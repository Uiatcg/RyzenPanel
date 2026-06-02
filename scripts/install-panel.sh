#!/bin/bash
set -e

# RYZENPANEL - Panel Installer
# Supports: Ubuntu 22.04, Ubuntu 24.04, Debian 12

RYZEN_VERSION="1.0.0"
RYZEN_REPO="https://github.com/Uiatcg/RyzenPanel"

echo "============================================"
echo "  RYZENPANEL Panel v${RYZEN_VERSION}"
echo "  Next-Generation Minecraft Hosting Panel"
echo "============================================"
echo ""

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

# Configuration
read -p "Panel Domain (e.g., panel.example.com): " PANEL_DOMAIN
read -p "Database Password: " DB_PASSWORD
read -s -p "Admin Password: " ADMIN_PASSWORD
echo ""
read -p "Email (for Let's Encrypt): " LETSENCRYPT_EMAIL

echo ""
echo "Starting installation..."
echo ""

# Update system
echo "[1/8] Updating system packages..."
apt-get update -y && apt-get upgrade -y

# Install Node.js
echo "[2/8] Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs git nginx certbot python3-certbot-nginx

# Install PostgreSQL
echo "[3/8] Installing PostgreSQL..."
apt-get install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

# Create database
echo "[4/8] Configuring database..."
sudo -u postgres psql -c "CREATE DATABASE ryzenpanel;"
sudo -u postgres psql -c "CREATE USER ryzenpanel WITH PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ryzenpanel TO ryzenpanel;"
sudo -u postgres psql -c "ALTER DATABASE ryzenpanel OWNER TO ryzenpanel;"

# Clone panel
echo "[5/8] Installing RYZENPANEL..."
cd /var/www
git clone ${RYZEN_REPO} ryzenpanel
cd ryzenpanel
git checkout v${RYZEN_VERSION}

npm install -g pnpm
pnpm install

# Configure environment
echo "[6/8] Configuring environment..."
cat > .env << EOF
DATABASE_URL="postgresql://ryzenpanel:${DB_PASSWORD}@127.0.0.1:5432/ryzenpanel"
JWT_SECRET=$(openssl rand -hex 32)
NEXT_PUBLIC_BASE_URL=http://${PANEL_DOMAIN}
AUTH_COOKIE_NAME=ryzenpanel_token
EOF

# Build panel
echo "[7/8] Building panel..."
pnpm prisma generate
pnpm prisma db push
pnpm seed
pnpm build

# Configure nginx
echo "[8/8] Configuring nginx..."
cat > /etc/nginx/sites-available/ryzenpanel << EOF
server {
    listen 80;
    server_name ${PANEL_DOMAIN};

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
EOF

ln -sf /etc/nginx/sites-available/ryzenpanel /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# Let's Encrypt
if [ -n "$LETSENCRYPT_EMAIL" ]; then
    certbot --nginx -d ${PANEL_DOMAIN} --non-interactive --agree-tos --email ${LETSENCRYPT_EMAIL}
fi

# Create systemd service
cat > /etc/systemd/system/ryzenpanel.service << EOF
[Unit]
Description=RYZENPANEL - Minecraft Hosting Panel
After=network.target

[Service]
Type=simple
WorkingDirectory=/var/www/ryzenpanel
ExecStart=/usr/local/bin/pnpm --filter @ryzenpanel/dashboard start
Restart=always
RestartSec=5
User=root
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ryzenpanel
systemctl start ryzenpanel

echo ""
echo "============================================"
echo "  Installation Complete!"
echo "============================================"
echo ""
echo "Panel URL: http://${PANEL_DOMAIN}"
echo "Admin Login: admin@ryzenpanel.com"
echo "Admin Password: ${ADMIN_PASSWORD}"
echo ""
echo "Next steps:"
echo "  1. Configure your DNS to point ${PANEL_DOMAIN} to this server"
echo "  2. Add a node from the admin panel"
echo "  3. Install RyzenDaemon on your game server"
echo "============================================"