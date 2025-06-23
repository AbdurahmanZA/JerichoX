#!/bin/bash
echo "🛡️  Testing REAL HikConnect API Integration"
echo "=========================================="

BASE_URL="http://localhost:3001"
TOKEN="test_token"

echo ""
echo "1. Testing enhanced health endpoint..."
curl -s "$BASE_URL/api/hikconnect/health" | jq .

echo ""
echo "2. Testing credential validation (with invalid credentials)..."
curl -s -X POST "$BASE_URL/api/hikconnect/test-credentials" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "accessKey": "test_invalid_key",
    "secretKey": "test_invalid_secret", 
    "region": "global"
  }' | jq .

echo ""
echo "3. Testing account creation with real API validation..."
ACCOUNT_DATA='{
  "accountName": "Real Test Account",
  "accessKey": "your_real_access_key_here",
  "secretKey": "your_real_secret_key_here",
  "region": "global"
}'

echo "Account creation test (will validate credentials):"
curl -s -X POST "$BASE_URL/api/hikconnect/accounts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$ACCOUNT_DATA" | jq .

echo ""
echo "4. Testing current accounts..."
curl -s "$BASE_URL/api/hikconnect/accounts" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "5. Testing statistics..."
curl -s "$BASE_URL/api/hikconnect/stats" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo ""
echo "==============================================="
echo "✅ Real HikConnect API test completed!"
echo ""
echo "📋 To test with real credentials:"
echo "1. Get your HikConnect Access Key and Secret Key"
echo "2. Edit this script and replace 'your_real_access_key_here'"
echo "3. Run this script again"
echo "4. Then test device sync and camera addition"
echo ""
echo "🌐 Access frontend: http://192.168.0.142:3000"
echo "⚙️  Settings → HikConnect tab"
echo "==============================================="
