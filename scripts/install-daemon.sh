#!/bin/bash
set -e

# RYZENPANEL - Daemon Installer
# Supports: Ubuntu 22.04, Ubuntu 24.04, Debian 12

RYZEN_VERSION="1.0.0"
RYZEN_REPO="https://github.com/ryzenpanel/daemon"

echo "============================================"
echo "  RYZENDAEMON v${RYZEN_VERSION}"
echo "  RyzenNode Agent Installer"
echo "============================================"
echo ""

# Parse arguments
while [ "$1" != "" ]; do
    case $1 in
        --panel-url ) shift; PANEL_URL=$1 ;;
        --node-id ) shift; NODE_ID=$1 ;;
        --node-token ) shift; NODE_TOKEN=$1 ;;
        * ) echo "Unknown option: $1"; exit 1 ;;
    esac
    shift
done

# Check OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    echo "Unsupported operating system"
    exit 1
fi

echo "Detected: $OS $VER"

if [[ "$OS" != "Ubuntu" && "$OS" != "Debian GNU/Linux" ]]; then
    echo "This installer supports Ubuntu 22.04, Ubuntu 24.04, and Debian 12 only."
    exit 1
fi

# Check root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root"
    exit 1
fi

# Interactive mode if no arguments
if [ -z "$PANEL_URL" ]; then
    read -p "Panel URL (e.g., https://panel.example.com): " PANEL_URL
fi
if [ -z "$NODE_ID" ]; then
    read -p "Node ID (from admin panel): " NODE_ID
fi
if [ -z "$NODE_TOKEN" ]; then
    read -p "Node Token (from admin panel): " NODE_TOKEN
fi

echo ""
echo "Starting installation..."
echo ""

# Update system
echo "[1/5] Updating system packages..."
apt-get update -y && apt-get upgrade -y

# Install Docker
echo "[2/5] Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com | bash
    systemctl enable docker
    systemctl start docker
else
    echo "Docker already installed."
fi

# Install Java
echo "[3/5] Installing Java..."
apt-get install -y openjdk-17-jre-headless openjdk-17-jdk-headless

# Install Node.js for daemon
echo "[4/5] Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

npm install -g pnpm

# Clone and build daemon
echo "[5/5] Installing RyzenDaemon..."
cd /opt
git clone ${RYZEN_REPO} ryzendaemon
cd ryzendaemon
git checkout v${RYZEN_VERSION}
pnpm install

# Create data directory
mkdir -p /var/lib/ryzenpanel/servers
mkdir -p /var/log/ryzenpanel

# Create config
API_KEY=$(openssl rand -hex 48)
cat > /opt/ryzendaemon/.env << EOF
DAEMON_PORT=8080
DAEMON_HTTP_HOST=0.0.0.0
DAEMON_API_KEY=${API_KEY}
DAEMON_DATA_ROOT=/var/lib/ryzenpanel
DAEMON_FILES_ROOT=/var/lib/ryzenpanel/servers
DOCKER_SOCKET_PATH=/var/run/docker.sock
PANEL_URL=${PANEL_URL}
NODE_ID=${NODE_ID}
NODE_TOKEN=${NODE_TOKEN}
EOF

# Build daemon
pnpm build --filter @ryzenpanel/daemon

# Create systemd service
cat > /etc/systemd/system/ryzendaemon.service << EOF
[Unit]
Description=RYZENDAEMON - RyzenNode Game Server Agent
After=docker.service network.target
Requires=docker.service

[Service]
Type=simple
WorkingDirectory=/opt/ryzendaemon
ExecStart=/usr/bin/node /opt/ryzendaemon/apps/daemon/dist/index.js
Restart=always
RestartSec=10
User=root
Environment=NODE_ENV=production
EnvironmentFile=/opt/ryzendaemon/.env
LimitNOFILE=1000000

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ryzendaemon
systemctl start ryzendaemon

echo ""
echo "============================================"
echo "  Installation Complete!"
echo "============================================"
echo ""
echo "Daemon Status:"
systemctl status ryzendaemon --no-pager -l
echo ""
echo "Panel URL: ${PANEL_URL}"
echo "Node ID: ${NODE_ID}"
echo "Status: Connecting..."
echo ""
echo "Check logs: journalctl -u ryzendaemon -f"
echo "============================================"