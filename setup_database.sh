#!/bin/bash
# JerichoX Security Platform - Database Infrastructure Setup
# Ubuntu 24.04 LTS - Complete PostgreSQL + Redis Installation
# Server: 192.168.0.142 (jerichox)

set -e  # Exit on any error

echo "========================================"
echo "🛡️  JERICHO SECURITY PLATFORM"
echo "📊 Database Infrastructure Setup"
echo "========================================"
echo "Server: $(hostname) ($(hostname -I | awk '{print $1}'))"
echo "User: $(whoami)"
echo "Date: $(date)"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Database configuration
DB_NAME="jerichox_security"
DB_USER="jerichox"
DB_PASSWORD="JerichoSec2025!"
REDIS_PASSWORD="JerichoRedis2025!"

echo -e "${BLUE}🔄 Updating system packages...${NC}"
echo "M@rwan1395" | sudo -S apt update && sudo apt upgrade -y

echo -e "${BLUE}📦 Installing PostgreSQL 15+...${NC}"
echo "M@rwan1395" | sudo -S apt install -y postgresql postgresql-contrib postgresql-client

echo -e "${BLUE}📦 Installing Redis 7+...${NC}"
echo "M@rwan1395" | sudo -S apt install -y redis-server redis-tools

echo -e "${BLUE}📦 Installing additional tools...${NC}"
echo "M@rwan1395" | sudo -S apt install -y htop curl wget git unzip software-properties-common

echo -e "${YELLOW}🔧 Configuring PostgreSQL...${NC}"

# Start and enable PostgreSQL
echo "M@rwan1395" | sudo -S systemctl start postgresql
echo "M@rwan1395" | sudo -S systemctl enable postgresql

# Create database and user
echo "M@rwan1395" | sudo -S -u postgres psql << EOF_SQL
-- Create database
CREATE DATABASE ${DB_NAME};

-- Create user
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};

-- Grant additional permissions for schema creation
ALTER USER ${DB_USER} CREATEDB;

-- Show created databases
\l

-- Show users
\du

EOF_SQL

echo -e "${GREEN}✅ PostgreSQL database '${DB_NAME}' created successfully${NC}"

echo -e "${YELLOW}🔧 Configuring Redis...${NC}"

# Configure Redis
echo "M@rwan1395" | sudo -S cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

# Update Redis configuration
echo "M@rwan1395" | sudo -S tee /etc/redis/redis.conf > /dev/null << EOF_REDIS
# JerichoX Security Platform - Redis Configuration

# Basic settings
bind 127.0.0.1 ::1
port 6379
timeout 0
tcp-keepalive 300

# Security
requirepass ${REDIS_PASSWORD}

# Memory management
maxmemory 256mb
maxmemory-policy allkeys-lru

# Persistence
save 900 1
save 300 10
save 60 10000

# Logging
loglevel notice
logfile /var/log/redis/redis-server.log

# Database
databases 16

# Performance
tcp-backlog 511
EOF_REDIS

# Restart Redis
echo "M@rwan1395" | sudo -S systemctl restart redis-server
echo "M@rwan1395" | sudo -S systemctl enable redis-server

echo -e "${GREEN}✅ Redis configured with authentication${NC}"
