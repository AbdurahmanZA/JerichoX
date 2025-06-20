# JerichoX - JERICHO Security Platform

## 🛡️ Enterprise Security Control Room Platform

**JERICHO Security** is a modern, cloud-native security control room platform designed specifically for monitoring and controlling Hikvision cameras through Hik-Connect Cloud integration. This application serves as a comprehensive solution for security control rooms, offering enterprise-grade monitoring, analytics, and incident management capabilities.

---

## 🏗️ Architecture Overview

### Infrastructure Design
```
ESXi Host Infrastructure:
├── Ubuntu 24.04 LTS VM (Primary Application)
│   ├── Docker containers (JERICHO platform)
│   ├── PostgreSQL + Redis containers
│   └── Nginx reverse proxy
├── Ubuntu 24.04 LTS VM (Asterisk PBX)
│   ├── Asterisk 20+ for emergency calling
│   ├── SIP/WebRTC gateway
│   └── Call recording storage
├── Ubuntu 24.04 LTS VM (AI Processing)
│   ├── TensorFlow/PyTorch containers
│   ├── AI model inference services
│   └── GPU passthrough (if available)
└── Shared Storage (NFS/iSCSI)
    ├── Video recordings
    ├── Call recordings
    └── AI model storage
```

### Technology Stack

#### Frontend
- **Framework**: React 18.3+ with TypeScript 5.5+
- **Build Tool**: Vite 5.4+
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS 3.4+ with custom dark theme
- **State Management**: Zustand + TanStack Query v5
- **Routing**: React Router DOM v6
- **Real-time**: Socket.io-client for WebSocket connections

#### Backend
- **Runtime**: Node.js 20 LTS with TypeScript
- **Framework**: Express.js with Helmet, CORS, and rate limiting
- **Database**: PostgreSQL 16+ (primary) + Redis 7+ (caching/sessions)
- **Authentication**: JWT + OAuth 2.0 + bcrypt
- **Real-time**: Socket.io for WebSocket communications
- **API**: RESTful APIs + GraphQL for complex queries

#### Cloud Integration
- **Primary**: Hik-Connect Cloud APIs
- **Video Streaming**: Progressive JPEG/MJPEG (reliable, proven)
- **Storage**: Hikvision Cloud Storage + local backup
- **Analytics**: Hikvision AI Analytics APIs
- **Notifications**: Real-time cloud event subscriptions

---

## 🚀 Quick Start

### Prerequisites
- **OS**: Ubuntu 24.04 LTS Server/Desktop
- **RAM**: 16GB+ (32GB recommended for production)
- **Storage**: 100GB+ SSD
- **Network**: Stable internet connection (100Mbps+)
- **Docker**: Latest version
- **Node.js**: 20 LTS

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AbdurahmanZA/JerichoX.git
cd JerichoX
```

2. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env

# Configure your environment variables
nano .env
```

3. **Docker Development Environment**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

4. **Local Development**
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### First Time Setup

1. **Configure Hikvision Integration**
   - Obtain Hik-Connect API credentials
   - Update `.env` with your access keys
   - Test camera connectivity

2. **Setup Database**
   - Database will be automatically initialized
   - Run migrations: `npm run db:migrate`
   - Seed initial data: `npm run db:seed`

3. **Create Admin User**
```bash
# Access the backend container
docker exec -it jericho-backend-dev npm run create-admin

# Or manually via API
curl -X POST http://localhost:3001/api/auth/setup \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"username\": \"admin\",
    \"password\": \"your_secure_password\",
    \"email\": \"admin@your-organization.com\",
    \"fullName\": \"System Administrator\"
  }'
```

4. **Access the Application**
   - Open http://localhost:3000
   - Login with admin credentials
   - Complete initial setup wizard

---

## 📁 Project Structure

```
JerichoX/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # shadcn/ui base components
│   │   ├── camera/         # Camera-specific components
│   │   ├── security/       # Security control room components
│   │   ├── communications/ # VoIP and calling components
│   │   └── ai/             # AI analytics components
│   ├── services/           # API services and integrations
│   │   ├── hikvision/      # Camera API services
│   │   ├── asterisk/       # VoIP API services
│   │   └── ai/             # AI processing services
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Helper functions
│   └── config/             # Configuration files
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Express middleware
│   │   └── routes/         # API routes
│   └── docker/             # Docker configurations
├── infrastructure/
│   ├── docker-compose.yml  # Development environment
│   ├── nginx/              # Nginx configuration
│   ├── postgres/           # Database setup
│   ├── redis/              # Redis configuration
│   └── scripts/            # Deployment scripts
└── docs/                   # Documentation
```

---

## 🎯 Development Roadmap

### Phase 1: Core Platform Foundation (Months 1-3) ✅
- [x] Authentication & User Management
- [x] Basic UI Framework & Dark Theme
- [x] WebSocket Real-time Communication
- [x] Docker Development Environment
- [ ] Hik-Connect Cloud Integration
- [ ] Live Streaming Infrastructure (Progressive JPEG)
- [ ] Camera Layout Management
- [ ] Real-time Alert System
- [ ] Basic Incident Management

### Phase 2: Advanced Control Room Features (Months 4-6)
- [ ] PTZ Camera Control
- [ ] Advanced Analytics Dashboard
- [ ] Incident Management Workflow
- [ ] Mobile Command Center (PWA)
- [ ] Advanced Reporting System
- [ ] Asterisk PBX Integration

### Phase 3: AI & Analytics (Months 7-9)
- [ ] AI Processing VM Integration
- [ ] Facial Recognition Integration
- [ ] Behavior Analysis
- [ ] Predictive Analytics
- [ ] Advanced Threat Detection
- [ ] AI-powered Incident Classification

### Phase 4: Enterprise Features (Months 10-12)
- [ ] Multi-site Management
- [ ] Advanced User Roles & Permissions
- [ ] Compliance Reporting
- [ ] API Integration Platform
- [ ] Advanced Backup & Recovery
- [ ] Performance Optimization

---

## 🛠️ Development Commands

```bash
# Frontend development
npm run dev              # Start development server (http://localhost:3000)
npm run build           # Build for production
npm run type-check      # TypeScript validation

# Docker operations
npm run docker:up       # Start all services
npm run docker:down     # Stop all services
npm run docker:logs     # View service logs

# Quality assurance
npm run lint            # Code linting
npm test               # Run tests
npm run storybook      # Component documentation
```

---

## 🔐 Security Features

### Authentication & Authorization
- Multi-factor Authentication (MFA)
- Role-based Access Control (RBAC)
- JWT token-based authentication
- Session management with timeout
- LDAP/Active Directory integration

### Infrastructure Security
- Container security scanning
- Network segmentation
- SSL/TLS encryption
- Firewall configuration
- Audit logging
- Backup encryption

---

## 📚 Documentation

### API Documentation
- **Backend API**: Available at `http://localhost:3001/api/docs` (Swagger)
- **WebSocket Events**: See `/docs/websocket-api.md`
- **Inter-VM Communication**: See `/docs/inter-vm-api.md`

### Component Documentation
- **Storybook**: Run `npm run storybook` for component library
- **Type Definitions**: See `/src/types/index.ts`
- **Architecture**: See `/docs/architecture.md`

### Deployment Guides
- **Local Development**: See `/docs/local-setup.md`
- **ESXi Deployment**: See `/docs/esxi-deployment.md`
- **Production Setup**: See `/docs/production-setup.md`
- **Backup & Recovery**: See `/docs/backup-recovery.md`

---

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Follow the development guidelines
4. Write tests for your changes
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

### Code Review Checklist
- [ ] JERICHO architecture compliance
- [ ] TypeScript best practices
- [ ] Error handling completeness
- [ ] Performance considerations
- [ ] Security implications
- [ ] Accessibility requirements
- [ ] Mobile responsiveness
- [ ] Dark theme compatibility

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🏆 Acknowledgments

- [Hikvision](https://www.hikvision.com/) for Hik-Connect Cloud APIs
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for styling framework
- [React](https://reactjs.org/) and [TypeScript](https://www.typescriptlang.org/) teams
- The open-source community for amazing tools and libraries

---

## ⚠️ Security Notice

**IMPORTANT**: This is an enterprise security platform. Ensure proper security measures and compliance with local regulations before deployment in production environments.

### Security Checklist
- [ ] Change all default passwords and secrets
- [ ] Enable SSL/TLS with valid certificates
- [ ] Configure firewall rules properly
- [ ] Enable audit logging
- [ ] Set up backup encryption
- [ ] Review user access permissions
- [ ] Test incident response procedures
- [ ] Conduct security assessments

---

**Built with ❤️ for security professionals worldwide**