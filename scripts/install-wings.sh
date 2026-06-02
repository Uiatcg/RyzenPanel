#!/usr/bin/env bash
set -euo pipefail

RYZEN_VERSION="1.0.0"

echo ''
echo '██████╗ ██╗   ██╗███████╗███████╗███╗   ██╗██████╗  █████╗ ███╗   ██╗███████╗██╗'
echo '██╔══██╗╚██╗ ██╔╝╚══███╔╝╚══███╔╝████╗  ██║██╔══██╗██╔══██╗████╗  ██║██╔════╝██║'
echo '██████╔╝ ╚████╔╝   ███╔╝   ███╔╝ ██╔██╗ ██║██████╔╝███████║██╔██╗ ██║█████╗  ██║'
echo '██╔══██╗  ╚██╔╝   ███╔╝   ███╔╝  ██║╚██╗██║██╔═══╝ ██╔══██║██║╚██╗██║██╔══╝  ██║'
echo '██║  ██║   ██║   ███████╗███████╗██║ ╚████║██║     ██║  ██║██║ ╚████║███████╗███████╗'
echo '╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝'
echo ''
echo '╔══════════════════════════════════════════════════════════════╗'
echo '║          Wings Daemon Installer — RyzenPanel v1.0           ║'
echo '╚══════════════════════════════════════════════════════════════╝'
echo ''

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info() { echo -e "${CYAN}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

if [ "$EUID" -ne 0 ]; then
  error "This installer must be run as root."
  exit 1
fi

# Parse args
AUTO_MODE=false
PANEL_URL=""
NODE_UUID=""
NODE_SECRET=""
DAEMON_KEY=""
DAEMON_FQDN=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --wings) AUTO_MODE=true ;;
    --panel-url=*) PANEL_URL="${1#*=}" ;;
    --node-uuid=*) NODE_UUID="${1#*=}" ;;
    --node-secret=*) NODE_SECRET="${1#*=}" ;;
    --daemon-key=*) DAEMON_KEY="${1#*=}" ;;
    --fqdn=*) DAEMON_FQDN="${1#*=}" ;;
    *) error "Unknown option: $1"; exit 1 ;;
  esac
  shift
done

if [ "$AUTO_MODE" = false ]; then
  echo '╔══════════════════════════════════════════════════════════════╗'
  echo '║              Wings Daemon Configuration                     ║'
  echo '╚══════════════════════════════════════════════════════════════╝'
  echo ''
  read -p "Panel URL (e.g., https://panel.example.com): " PANEL_URL
  read -p "Daemon FQDN / Public IP: " DAEMON_FQDN
  echo ''
  echo "  Paste the credentials from the panel admin area:"
  echo ''
  read -p "Node UUID: " NODE_UUID
  read -p "Daemon Key: " DAEMON_KEY
  read -p "Node Secret: " NODE_SECRET
fi

if [ -z "$PANEL_URL" ] || [ -z "$NODE_UUID" ] || [ -z "$DAEMON_KEY" ] || [ -z "$NODE_SECRET" ] || [ -z "$DAEMON_FQDN" ]; then
  error "Missing required configuration."
  exit 1
fi

echo ''
info "Installing Docker..."
apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io
systemctl enable docker
systemctl restart docker

info "Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

info "Setting up daemon directory..."
DAEMON_DIR="/opt/ryzenpanel-daemon"
mkdir -p "$DAEMON_DIR"
mkdir -p /var/lib/ryzenpanel/servers
mkdir -p /var/lib/ryzenpanel/backups
chmod 755 /var/lib/ryzenpanel/servers

# Copy daemon files from the repo or download from GitHub
if [ -d "$(dirname "$0")/../apps/daemon" ]; then
  info "Copying daemon files from local repo..."
  cp -R "$(dirname "$0")/../apps/daemon/." "$DAEMON_DIR/"
else
  info "Downloading daemon from GitHub..."
  cd /tmp
  git clone --depth 1 https://github.com/Uiatcg/RyzenPanel /tmp/ryzenpanel-dl
  cp -R /tmp/ryzenpanel-dl/apps/daemon/." "$DAEMON_DIR/"
  rm -rf /tmp/ryzenpanel-dl
fi

info "Installing npm dependencies..."
cd "$DAEMON_DIR"
npm install --production

info "Building daemon..."
npm run build

info "Writing configuration..."
cat > .env << DAEMONENV
DAEMON_API_KEY=${DAEMON_KEY}
DAEMON_PORT=8080
DAEMON_FILES_ROOT=/var/lib/ryzenpanel/servers
DAEMON_FQDN=${DAEMON_FQDN}
PANEL_URL=${PANEL_URL}
NODE_ID=${NODE_UUID}
NODE_TOKEN=${NODE_SECRET}
DOCKER_HOST=unix:///var/run/docker.sock
DAEMON_HTTP_HOST=0.0.0.0
DAEMON_DATA_ROOT=/var/lib/ryzenpanel
DAEMON_IP=${DAEMON_FQDN}
DAEMON_PUBLIC_PORT=25565
DAEMON_PUBLIC_HOST=${DAEMON_FQDN}
DOCKER_SOCKET_PATH=/var/run/docker.sock
DAEMON_ENABLE_SSL=false
DAEMON_HTTP_PORT=8080
DAEMON_PREFIX=ryzen
DOCKER_NETWORK=ryzenpanel
DAEMON_BACKUP_DIR=/var/lib/ryzenpanel/backups
EOF

info "Creating systemd service..."
cat > /etc/systemd/system/ryzenpanel-daemon.service << 'SERVICEEOF'
[Unit]
Description=RyzenPanel Wings Daemon
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/ryzenpanel-daemon
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
SERVICEEOF

systemctl daemon-reload
systemctl enable ryzenpanel-daemon
systemctl restart ryzenpanel-daemon

info "Registering with panel..."
sleep 3
REGISTER_RESULT=$(curl -s -X POST "${PANEL_URL}/api/nodes/register" \
  -H "Content-Type: application/json" \
  -d "{\"nodeId\":\"${NODE_UUID}\",\"nodeToken\":\"${NODE_SECRET}\",\"daemonKey\":\"${DAEMON_KEY}\",\"fqdn\":\"${DAEMON_FQDN}\",\"daemonPort\":8080,\"ip\":\"${DAEMON_FQDN}\"}" 2>&1) || true

if echo "$REGISTER_RESULT" | grep -q "success"; then
  success "Registered with panel successfully!"
else
  warn "Auto-registration failed: ${REGISTER_RESULT}"
  warn "You may need to register manually in the panel."
fi

echo ''
echo '╔══════════════════════════════════════════════════════════════╗'
echo '║              Wings Daemon Installation Complete!             ║'
echo '╠══════════════════════════════════════════════════════════════╣'
echo '║                                                             ║'
echo '║   ██╗    ██╗██╗███╗   ██╗ ██████╗ ███████╗                 ║'
echo '║   ██║    ██║██║████╗  ██║██╔════╝ ██╔════╝                 ║'
echo '║   ██║ █╗ ██║██║██╔██╗ ██║██║  ███╗███████╗                 ║'
echo '║   ██║███╗██║██║██║╚██╗██║██║   ██║╚════██║                 ║'
echo '║   ╚███╔███╔╝██║██║ ╚████║╚██████╔╝███████║                 ║'
echo '║    ╚══╝╚══╝ ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝                 ║'
echo '║                                                             ║'
echo '╚══════════════════════════════════════════════════════════════╝'
echo ''
echo "  🌐 Panel URL: ${PANEL_URL}"
echo "  🖥️  Node UUID: ${NODE_UUID}"
echo "  🔑 Daemon Key: ${DAEMON_KEY}"
echo "  🔐 Node Secret: ${NODE_SECRET}"
echo ''
echo "  📌 To check daemon status: systemctl status ryzenpanel-daemon"
echo "  📌 To view daemon logs: journalctl -u ryzenpanel-daemon -f"
echo ''
