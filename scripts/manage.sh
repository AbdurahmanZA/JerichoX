#!/bin/bash
# JerichoX Service Management Script

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/home/asolomon/JerichoX"
cd "$PROJECT_DIR"

case "$1" in
    start)
        echo -e "${BLUE}🚀 Starting JerichoX services...${NC}"
        
        # Kill existing processes
        pkill -f "node.*api-server.js" || true
        pkill -f "vite" || true
        pkill -f "concurrently" || true
        sleep 2
        
        # Start API server
        echo "Starting API server..."
        nohup node api-server.js > logs/api.log 2>&1 &
        echo $! > logs/api.pid
        
        # Start frontend
        echo "Starting frontend..."
        nohup npm run dev:frontend > logs/frontend.log 2>&1 &
        echo $! > logs/frontend.pid
        
        sleep 3
        echo -e "${GREEN}✅ Services started${NC}"
        $0 status
        ;;
        
    stop)
        echo -e "${YELLOW}🛑 Stopping JerichoX services...${NC}"
        
        if [ -f logs/api.pid ]; then
            kill $(cat logs/api.pid) 2>/dev/null || true
            rm -f logs/api.pid
        fi
        
        if [ -f logs/frontend.pid ]; then
            kill $(cat logs/frontend.pid) 2>/dev/null || true
            rm -f logs/frontend.pid
        fi
        
        pkill -f "node.*api-server.js" || true
        pkill -f "vite" || true
        pkill -f "concurrently" || true
        
        echo -e "${GREEN}✅ Services stopped${NC}"
        ;;
        
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
        
    status)
        echo -e "${BLUE}📊 JerichoX Service Status${NC}"
        echo "========================================"
        
        # Check API server
        if pgrep -f "node.*api-server.js" > /dev/null; then
            echo -e "API Server: ${GREEN}✅ Running${NC} (PID: $(pgrep -f 'node.*api-server.js'))"
            if curl -s http://localhost:3001/health > /dev/null; then
                echo -e "API Health: ${GREEN}✅ Healthy${NC}"
            else
                echo -e "API Health: ${RED}❌ Unhealthy${NC}"
            fi
        else
            echo -e "API Server: ${RED}❌ Stopped${NC}"
        fi
        
        # Check frontend
        if pgrep -f "vite" > /dev/null; then
            echo -e "Frontend: ${GREEN}✅ Running${NC} (PID: $(pgrep -f 'vite'))"
        else
            echo -e "Frontend: ${RED}❌ Stopped${NC}"
        fi
        
        # Check database
        if systemctl is-active postgresql > /dev/null; then
            echo -e "PostgreSQL: ${GREEN}✅ Running${NC}"
        else
            echo -e "PostgreSQL: ${RED}❌ Stopped${NC}"
        fi
        
        if systemctl is-active redis-server > /dev/null; then
            echo -e "Redis: ${GREEN}✅ Running${NC}"
        else
            echo -e "Redis: ${RED}❌ Stopped${NC}"
        fi
        
        echo "========================================"
        echo "URLs:"
        echo "  Frontend: http://localhost:3000"
        echo "  API: http://localhost:3001"
        echo "  Health: http://localhost:3001/health"
        ;;
        
    logs)
        case "$2" in
            api)
                tail -f logs/api.log
                ;;
            frontend)
                tail -f logs/frontend.log
                ;;
            db)
                echo "M@rwan1395" | sudo -S tail -f /var/log/postgresql/postgresql-*-main.log
                ;;
            redis)
                echo "M@rwan1395" | sudo -S tail -f /var/log/redis/redis-server.log
                ;;
            *)
                echo "Usage: $0 logs [api|frontend|db|redis]"
                ;;
        esac
        ;;
        
    test)
        echo -e "${BLUE}🧪 Testing JerichoX services...${NC}"
        
        # Test database
        echo -n "Database connection: "
        if PGPASSWORD=JerichoSec2025! psql -h localhost -U jerichox -d jerichox_security -c "SELECT 1;" > /dev/null 2>&1; then
            echo -e "${GREEN}✅${NC}"
        else
            echo -e "${RED}❌${NC}"
        fi
        
        # Test Redis
        echo -n "Redis connection: "
        if redis-cli -a JerichoRedis2025! ping > /dev/null 2>&1; then
            echo -e "${GREEN}✅${NC}"
        else
            echo -e "${RED}❌${NC}"
        fi
        
        # Test API
        echo -n "API health: "
        if curl -s http://localhost:3001/health > /dev/null; then
            echo -e "${GREEN}✅${NC}"
        else
            echo -e "${RED}❌${NC}"
        fi
        
        # Test frontend
        echo -n "Frontend: "
        if curl -s http://localhost:3000 > /dev/null; then
            echo -e "${GREEN}✅${NC}"
        else
            echo -e "${RED}❌${NC}"
        fi
        ;;
        
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|test}"
        echo ""
        echo "Log options: logs [api|frontend|db|redis]"
        ;;
esac
