#!/bin/bash

case "$1" in
    start)
        echo "Starting JERICHO Security Platform..."
        nohup node server.js > logs/frontend.log 2>&1 &
        nohup node api-server.js > logs/api.log 2>&1 &
        echo "JERICHO started. Check logs/ directory for output."
        ;;
    stop)
        echo "Stopping JERICHO Security Platform..."
        pkill -f "node server.js"
        pkill -f "node api-server.js"
        echo "JERICHO stopped."
        ;;
    restart)
        $0 stop
        sleep 2
        $0 start
        ;;
    status)
        echo "JERICHO Status:"
        if pgrep -f "node server.js" > /dev/null; then
            echo "Frontend: Running"
        else
            echo "Frontend: Stopped"
        fi
        if pgrep -f "node api-server.js" > /dev/null; then
            echo "API: Running"
        else
            echo "API: Stopped"
        fi
        ;;
    logs)
        if [ "$2" = "api" ]; then
            tail -f logs/api.log
        elif [ "$2" = "frontend" ]; then
            tail -f logs/frontend.log
        else
            echo "Usage: $0 logs [frontend|api]"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        ;;
esac
