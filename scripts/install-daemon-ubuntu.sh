#!/usr/bin/env bash
set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "This installer must be run as root."
  exit 1
fi

apt-get update
apt-get install -y ca-certificates curl gnupg lsb-release software-properties-common
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

useradd --system --create-home --shell /usr/sbin/nologin ryzenpanel || true
mkdir -p /opt/ryzenpanel-daemon
chown ryzenpanel:ryzenpanel /opt/ryzenpanel-daemon

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
cp -R "$REPO_ROOT/apps/daemon/." /opt/ryzenpanel-daemon/
chown -R ryzenpanel:ryzenpanel /opt/ryzenpanel-daemon

cd /opt/ryzenpanel-daemon
npm install --production
npm run build

systemctl enable docker
systemctl restart docker

cat > /etc/systemd/system/ryzenpanel-daemon.service <<'EOF'
[Unit]
Description=RYZENPANEL Node Daemon
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=ryzenpanel
WorkingDirectory=/opt/ryzenpanel-daemon
Environment=DAEMON_API_KEY=replace_with_a_secure_token
Environment=DAEMON_PORT=8080
Environment=DAEMON_FILES_ROOT=/var/lib/ryzenpanel/servers
Environment=DOCKER_SOCKET_PATH=/var/run/docker.sock
ExecStart=/usr/bin/node /opt/ryzenpanel-daemon/dist/index.js
Restart=always
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable ryzenpanel-daemon
systemctl restart ryzenpanel-daemon

echo "RYZENPANEL daemon installed. Update /etc/systemd/system/ryzenpanel-daemon.service with your secret token."
