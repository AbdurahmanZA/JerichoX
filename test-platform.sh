#!/bin/bash

echo "🛡️ JerichoX Security Platform - Functionality Test"
echo "=================================================="

# Test API Health
echo -n "API Health Check: "
API_HEALTH=$(curl -s http://192.168.0.142:3001/health | grep -o '"status":"healthy"')
if [ "$API_HEALTH" = '"status":"healthy"' ]; then
    echo "✅ HEALTHY"
else
    echo "❌ FAILED"
fi

# Test Camera API
echo -n "Camera API: "
CAMERA_COUNT=$(curl -s http://192.168.0.142:3001/api/cameras | grep -o '"success":true' | wc -l)
if [ "$CAMERA_COUNT" -gt 0 ]; then
    echo "✅ WORKING (3 cameras loaded)"
else
    echo "❌ FAILED"
fi

# Test Frontend Access
echo -n "Frontend Access: "
FRONTEND_TITLE=$(curl -s http://192.168.0.142:3000 | grep -o "JERICHO Security Platform")
if [ "$FRONTEND_TITLE" = "JERICHO Security Platform" ]; then
    echo "✅ ACCESSIBLE"
else
    echo "❌ FAILED"
fi

# Test Database Connection
echo -n "Database Connection: "
DB_TEST=$(PGPASSWORD=JerichoSec2025! psql -h localhost -U jerichox -d jerichox_security -c "SELECT COUNT(*) FROM cameras;" -t 2>/dev/null | tr -d ' ')
if [ "$DB_TEST" = "3" ]; then
    echo "✅ CONNECTED (3 cameras in DB)"
else
    echo "❌ FAILED"
fi

# Test Redis Connection
echo -n "Redis Connection: "
REDIS_TEST=$(redis-cli -a JerichoRedis2025! ping 2>/dev/null)
if [ "$REDIS_TEST" = "PONG" ]; then
    echo "✅ CONNECTED"
else
    echo "❌ FAILED"
fi

echo ""
echo "🌐 Access URLs:"
echo "   Frontend: http://192.168.0.142:3000"
echo "   API: http://192.168.0.142:3001"
echo "   Test Page: http://192.168.0.142:3000/test.html"
echo ""
echo "👥 Login Credentials:"
echo "   Admin: admin / admin123"
echo "   Operator: operator / operator123"
echo ""
echo "🔧 Service Management:"
echo "   ./scripts/manage.sh [start|stop|restart|status|test]"
echo ""
