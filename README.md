# JERICHO Security Platform

Enterprise-grade security control room platform with Hikvision camera integration.

## Quick Installation (Ubuntu 24.04)

```bash
curl -sSL https://raw.githubusercontent.com/AbdurahmanZA/JerichoX/main/install-production.sh | bash
```

## Manual Setup

### Prerequisites
- Ubuntu 24.04 LTS
- Node.js 20+
- PostgreSQL 14+
- Redis 6+

### Installation Steps

1. **Clone repository**
```bash
git clone https://github.com/AbdurahmanZA/JerichoX.git
cd JerichoX
npm install --production
npm run build
```

2. **Configure environment**
```bash
# Edit .env with your configuration
nano .env
```

3. **Setup database**
```bash
# Create PostgreSQL database
sudo -u postgres createdb jericho_security

# Run migrations
npm run db:migrate
```

4. **Start services**
```bash
./scripts/manage.sh start
```

## Management Commands

- **Start**: `./scripts/manage.sh start`
- **Stop**: `./scripts/manage.sh stop`
- **Restart**: `./scripts/manage.sh restart`
- **Status**: `./scripts/manage.sh status`
- **Logs**: `./scripts/manage.sh logs [frontend|api]`

## Default Credentials

- **Username**: admin
- **Password**: admin123 (⚠️ Change immediately!)

## Architecture

- **Frontend**: React + TypeScript + Vite (Production Express Server)
- **Backend**: Node.js + Express + Socket.io
- **Database**: PostgreSQL + Redis
- **Security**: JWT + Session Management + Rate Limiting

## Production Deployment

For production deployment with systemd services, Nginx reverse proxy, and SSL:

```bash
sudo bash install-production.sh
```

## Features

- 🎥 Hikvision camera integration
- 📱 Real-time monitoring dashboard
- 🚨 Incident management
- 👥 Multi-user access control
- 📊 Analytics and reporting
- 🔐 Enterprise security

## Support

For issues and documentation, visit: https://github.com/AbdurahmanZA/JerichoX
