#!/usr/bin/env bash
set -euo pipefail

RYZEN_VERSION="1.0.0"

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

banner() {
  echo ''
  echo '██████╗ ██╗   ██╗███████╗███████╗███╗   ██╗██████╗  █████╗ ███╗   ██╗███████╗██╗'
  echo '██╔══██╗╚██╗ ██╔╝╚══███╔╝╚══███╔╝████╗  ██║██╔══██╗██╔══██╗████╗  ██║██╔════╝██║'
  echo '██████╔╝ ╚████╔╝   ███╔╝   ███╔╝ ██╔██╗ ██║██████╔╝███████║██╔██╗ ██║█████╗  ██║'
  echo '██╔══██╗  ╚██╔╝   ███╔╝   ███╔╝  ██║╚██╗██║██╔═══╝ ██╔══██║██║╚██╗██║██╔══╝  ██║'
  echo '██║  ██║   ██║   ███████╗███████╗██║ ╚████║██║     ██║  ██║██║ ╚████║███████╗███████╗'
  echo '╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝'
  echo ''
}

# Auto mode (called with --daemon flag from panel-generated command)
AUTO_MODE=false
PANEL_URL=""
NODE_UUID=""
NODE_SECRET=""
DAEMON_KEY=""
DAEMON_FQDN=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --daemon) AUTO_MODE=true ;;
    --panel-url=*) PANEL_URL="${1#*=}" ;;
    --node-uuid=*) NODE_UUID="${1#*=}" ;;
    --node-secret=*) NODE_SECRET="${1#*=}" ;;
    --daemon-key=*) DAEMON_KEY="${1#*=}" ;;
    --fqdn=*) DAEMON_FQDN="${1#*=}" ;;
    --help)
      banner
      echo "Usage: bash install.sh [options]"
      echo ""
      echo "Options:"
      echo "  --daemon             Install RyzenDaemon in non-interactive mode"
      echo "  --panel-url=URL      Panel URL (for daemon mode)"
      echo "  --node-uuid=UUID     Node UUID from panel"
      echo "  --node-secret=SECRET Node secret from panel"
      echo "  --daemon-key=KEY     Daemon API key from panel"
      echo "  --fqdn=FQDN          Daemon public FQDN/IP"
      exit 0
      ;;
    *) ;;
  esac
  shift
done

banner
echo '╔══════════════════════════════════════════════════════════════╗'
echo '║        Next-Generation Minecraft Hosting Panel v1.0         ║'
echo '║       One-Click Installer — Panel + RyzenDaemon            ║'
echo '╚══════════════════════════════════════════════════════════════╝'
echo ''
echo "  📦 Version: $RYZEN_VERSION"
echo "  🎯 Repo: https://github.com/Uiatcg/RyzenPanel"
echo ''

if [ "$EUID" -ne 0 ]; then
  error "This installer must be run as root."
  exit 1
fi

if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS="$NAME"
  VER="$VERSION_ID"
else
  error "Cannot detect OS."
  exit 1
fi

info "Detected: $OS $VER"

if [[ "$OS" != "Ubuntu" && "$OS" != "Debian GNU/Linux" ]]; then
  error "This installer supports Ubuntu 22.04, Ubuntu 24.04, and Debian 12 only."
  exit 1
fi

# Skip interactive prompt in auto mode
if [ "$AUTO_MODE" = true ]; then
  INSTALL_MODE="2"
else
  echo ''
  echo '╔══════════════════════════════════════════════════════════════╗'
  echo '║              Choose Installation Mode                       ║'
  echo '╠══════════════════════════════════════════════════════════════╣'
  echo '║  1) Install Panel (Web UI + API)                           ║'
  echo '║  2) Install RyzenDaemon (Game Server Node)                 ║'
  echo '║  3) Install Both (Panel + Daemon on same server)           ║'
  echo '╚══════════════════════════════════════════════════════════════╝'
  echo ''
  read -p "Select option [1-3]: " INSTALL_MODE
  echo ''
  case "$INSTALL_MODE" in
    1|2|3) ;;
    *) error "Invalid option"; exit 1 ;;
  esac
fi

if [[ "$INSTALL_MODE" == "1" ]] || [[ "$INSTALL_MODE" == "3" ]]; then
  echo '╔══════════════════════════════════════════════════════════════╗'
  echo '║                   Panel Configuration                       ║'
  echo '╚══════════════════════════════════════════════════════════════╝'
  echo ''
  read -p "Panel Domain (e.g., panel.example.com): " PANEL_DOMAIN
  read -s -p "Admin Password: " ADMIN_PASSWORD
  echo ''
  read -p "Email (for Let's Encrypt SSL): " LETSENCRYPT_EMAIL
  echo ''
  DB_PASSWORD=$(openssl rand -hex 16)
  JWT_SECRET=$(openssl rand -hex 32)
  APP_KEY=$(openssl rand -hex 32)

  info "Starting Panel Installation..."
  echo ''

  info "[1/8] Updating system packages..."
  apt-get update -y && apt-get upgrade -y

  info "[2/8] Installing Node.js, Nginx, Certbot..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs git nginx certbot python3-certbot-nginx

  info "[3/8] Installing PostgreSQL..."
  apt-get install -y postgresql postgresql-contrib
  # Start PostgreSQL (works on both systemd and non-systemd systems)
  if command -v systemctl &>/dev/null; then
    systemctl start postgresql 2>/dev/null || true
    systemctl enable postgresql 2>/dev/null || true
  fi
  service postgresql start 2>/dev/null || true
  sleep 3

  # Wait for PostgreSQL to be ready
  for i in $(seq 1 10); do
    if sudo -u postgres psql -c "SELECT 1;" &>/dev/null; then
      break
    fi
    info "Waiting for PostgreSQL to start... (attempt $i/10)"
    sleep 2
  done

  info "[4/8] Creating database..."
  sudo -u postgres psql -c "CREATE DATABASE ryzenpanel;" 2>/dev/null || warn "Database already exists"
  sudo -u postgres psql -c "CREATE USER ryzenpanel WITH PASSWORD '${DB_PASSWORD}';" 2>/dev/null || warn "User already exists"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ryzenpanel TO ryzenpanel;"
  sudo -u postgres psql -c "ALTER DATABASE ryzenpanel OWNER TO ryzenpanel;"

  PANEL_DIR="/var/www/ryzenpanel"
  if [ -d "$PANEL_DIR" ]; then
    info "Panel directory exists, updating..."
    cd "$PANEL_DIR" && git pull
  else
    info "[5/8] Cloning RyzenPanel..."
    git clone https://github.com/Uiatcg/RyzenPanel "$PANEL_DIR"
    cd "$PANEL_DIR"
  fi

  info "Installing pnpm..."
  npm install -g pnpm 2>/dev/null || true
  pnpm install

  info "[6/8] Configuring environment..."
  DB_PASSWORD_CLEAN=$(echo "$DB_PASSWORD" | sed 's/[&/\]/\\&/g')
  cat > .env << EOF
DATABASE_URL="postgresql://ryzenpanel:${DB_PASSWORD_CLEAN}@127.0.0.1:5432/ryzenpanel"
JWT_SECRET=${JWT_SECRET}
APP_KEY=${APP_KEY}
NEXT_PUBLIC_BASE_URL=https://${PANEL_DOMAIN}
AUTH_COOKIE_NAME=ryzenpanel_token
NODE_ENV=production
EOF

  info "[7/8] Building panel..."
  pnpm prisma generate
  pnpm prisma db push
  pnpm seed
  pnpm --filter @ryzenpanel/dashboard build

  info "[8/8] Configuring Nginx..."
  cat > /etc/nginx/sites-available/ryzenpanel << NGINXEOF
server {
    listen 80;
    server_name ${PANEL_DOMAIN};
    client_max_body_size 100M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
    }
}
NGINXEOF
  ln -sf /etc/nginx/sites-available/ryzenpanel /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx

  if [ -n "$LETSENCRYPT_EMAIL" ]; then
    info "Getting SSL certificate..."
    certbot --nginx -d "${PANEL_DOMAIN}" --non-interactive --agree-tos --email "${LETSENCRYPT_EMAIL}" || warn "SSL failed, you can run certbot manually"
  fi

  cat > /etc/systemd/system/ryzenpanel.service << SERVICEEOF
[Unit]
Description=RyzenPanel - Minecraft Hosting Panel
After=network.target

[Service]
Type=simple
WorkingDirectory=${PANEL_DIR}
ExecStart=$(which pnpm) --filter @ryzenpanel/dashboard start
Restart=always
RestartSec=5
User=root
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SERVICEEOF

  systemctl daemon-reload
  systemctl enable ryzenpanel
  systemctl restart ryzenpanel

  success "Panel installation complete!"
  echo ''
  echo "  Panel URL: https://${PANEL_DOMAIN}"
  echo "  Admin Email: admin@gmail.com"
  echo "  Admin Password: ${ADMIN_PASSWORD}"
  echo ''
fi

if [[ "$INSTALL_MODE" == "2" ]] || [[ "$INSTALL_MODE" == "3" ]]; then
  echo '╔══════════════════════════════════════════════════════════════╗'
  echo '║              RyzenDaemon Configuration                     ║'
  echo '╚══════════════════════════════════════════════════════════════╝'
  echo ''

  if [[ "$INSTALL_MODE" == "3" ]]; then
    PANEL_URL="https://${PANEL_DOMAIN}"
    info "Using panel URL: ${PANEL_URL}"
    echo ''
    echo "  Since panel and daemon are on the same server,"
    echo "  the daemon will use localhost for API communication."
    echo ''

    read -p "Daemon Public IP (for Minecraft clients): " DAEMON_FQDN
    read -p "Daemon Name (e.g., Main Node): " NODE_NAME
    read -p "Location (e.g., New York, USA): " NODE_LOCATION

    info "Creating node in database..."
    NODE_UUID=$(openssl rand -hex 16)
    DAEMON_KEY=$(openssl rand -hex 32)
    NODE_SECRET=$(openssl rand -hex 32)

    cat > /tmp/ryzen_node.sql << SQLEOF
INSERT INTO "Node" (id, uuid, name, location, fqdn, ip, daemon_port, daemon_key, "nodeSecret", status, "maxRam", "maxDisk", "maxServers")
VALUES (gen_random_uuid()::text, '${NODE_UUID}', '${NODE_NAME}', '${NODE_LOCATION}', 'http://localhost:8080', '127.0.0.1', 8080, '${DAEMON_KEY}', '${NODE_SECRET}', 'offline', 32768, 102400, 10)
ON CONFLICT (uuid) DO NOTHING;
SQLEOF
    sudo -u postgres psql -d ryzenpanel -f /tmp/ryzen_node.sql 2>/dev/null || warn "Could not auto-create node (panel may not be ready)"

    echo ''
    success "Node created!"
    echo "  Node UUID: ${NODE_UUID}"
    echo "  Daemon Key: ${DAEMON_KEY}"
    echo "  Node Secret: ${NODE_SECRET}"
    echo '  Note: Update FQDN to your public IP in Admin -> Nodes for Minecraft clients.'
    echo ''
  else
    read -p "Panel URL (e.g., https://panel.example.com): " PANEL_URL
    read -p "Daemon FQDN / Public IP: " DAEMON_FQDN
    echo ''
    echo "  You need the Node UUID, Daemon Key, and Node Secret"
    echo "  from the panel admin area."
    echo ''
    read -p "Node UUID (from panel): " NODE_UUID
    read -p "Daemon Key (from panel): " DAEMON_KEY
    read -p "Node Secret (from panel): " NODE_SECRET
  fi

  info "Installing Docker..."
  apt-get update
  apt-get install -y ca-certificates curl gnupg lsb-release
  mkdir -p /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
  apt-get update
  apt-get install -y docker-ce docker-ce-cli containerd.io

  info "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs

  DAEMON_DIR="/opt/ryzenpanel-daemon"
  if [ -d "$DAEMON_DIR" ]; then
    info "Daemon directory exists, updating..."
    cd "$DAEMON_DIR" && git pull
  else
    info "Cloning RyzenPanel..."
    git clone https://github.com/Uiatcg/RyzenPanel "$DAEMON_DIR"
    cd "$DAEMON_DIR"
  fi

  info "Installing pnpm..."
  npm install -g pnpm 2>/dev/null || true
  pnpm install

  info "Building daemon..."
  pnpm --filter @ryzenpanel/daemon build

  mkdir -p /var/lib/ryzenpanel/servers
  chmod 755 /var/lib/ryzenpanel/servers

  DAEMON_ENV_DIR="$DAEMON_DIR/apps/daemon"

  cat > "$DAEMON_ENV_DIR/.env" << DAEMONENV
DAEMON_API_KEY=${DAEMON_KEY}
DAEMON_PORT=8080
DAEMON_HTTP_HOST=0.0.0.0
DAEMON_FILES_ROOT=/var/lib/ryzenpanel/servers
DAEMON_DATA_ROOT=/var/lib/ryzenpanel
DAEMON_FQDN=${DAEMON_FQDN}
DAEMON_IP=${DAEMON_FQDN}
PANEL_URL=${PANEL_URL}
NODE_ID=${NODE_UUID}
NODE_TOKEN=${NODE_SECRET}
DOCKER_SOCKET_PATH=/var/run/docker.sock
DOCKER_HOST=unix:///var/run/docker.sock
DAEMONENV

  cat > /etc/systemd/system/ryzenpanel-daemon.service << SERVICEEOF
[Unit]
Description=RyzenPanel RyzenDaemon
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=${DAEMON_ENV_DIR}
EnvironmentFile=${DAEMON_ENV_DIR}/.env
ExecStart=$(which node) ${DAEMON_ENV_DIR}/dist/index.js
Restart=always
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
SERVICEEOF

  systemctl daemon-reload
  systemctl enable docker 2>/dev/null || true
  systemctl restart docker 2>/dev/null || true
  systemctl enable ryzenpanel-daemon 2>/dev/null || true
  systemctl restart ryzenpanel-daemon 2>/dev/null || true

  info "Daemon started. Checking logs..."
  sleep 2
  journalctl -u ryzenpanel-daemon --no-pager -n 10 2>/dev/null || cat "$DAEMON_ENV_DIR/../..//tmp/ryzen-daemon.log" 2>/dev/null || true

  if [[ "$INSTALL_MODE" == "2" ]]; then
    echo ''
    info "Attempting to register with panel..."
    sleep 3
    curl -s -X POST "${PANEL_URL}/api/nodes/register" \
      -H "Content-Type: application/json" \
      -d "{\"nodeId\":\"${NODE_UUID}\",\"nodeToken\":\"${NODE_SECRET}\",\"daemonKey\":\"${DAEMON_KEY}\",\"fqdn\":\"${DAEMON_FQDN}\",\"daemonPort\":8080,\"ip\":\"${DAEMON_FQDN}\"}" \
      2>/dev/null || warn "Auto-registration failed. Register manually in panel."
  fi

  success "RyzenDaemon installation complete!"
  echo ''
  echo "  Daemon URL: http://${DAEMON_FQDN}:8080"
  echo "  Node UUID: ${NODE_UUID}"
  echo ''
fi

echo ''
echo '╔══════════════════════════════════════════════════════════════╗'
echo '║                    Installation Complete!                   ║'
echo '╠══════════════════════════════════════════════════════════════╣'
echo '║                                                             ║'
echo '║   ██████╗ ██╗   ██╗███████╗███████╗███╗   ██╗██████╗      ║'
echo '║   ██╔══██╗╚██╗ ██╔╝╚══███╔╝╚══███╔╝████╗  ██║██╔══██╗     ║'
echo '║   ██████╔╝ ╚████╔╝   ███╔╝   ███╔╝ ██╔██╗ ██║██████╔╝     ║'
echo '║   ██╔══██╗  ╚██╔╝   ███╔╝   ███╔╝  ██║╚██╗██║██╔═══╝      ║'
echo '║   ██║  ██║   ██║   ███████╗███████╗██║ ╚████║██║          ║'
echo '║   ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝          ║'
echo '║                                                             ║'
echo '║   💬 Support: https://discord.gg/YwXsyh95Q3                ║'
echo '╚══════════════════════════════════════════════════════════════╝'
echo ''
echo "  📖 Documentation: https://github.com/Uiatcg/RyzenPanel"
echo "  💬 Need help? Join our Discord: https://discord.gg/YwXsyh95Q3"
echo ''
