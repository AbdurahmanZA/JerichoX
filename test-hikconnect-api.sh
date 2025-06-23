#!/bin/bash
echo "🛡️  Testing HikConnect API Integration"
echo "====================================="

# Test health endpoint
echo "1. Testing HikConnect health endpoint..."
HEALTH=$(curl -s http://localhost:3001/api/hikconnect/health)
echo "Response: $HEALTH"

# Test accounts endpoint (empty)
echo -e "\n2. Testing accounts endpoint..."
ACCOUNTS=$(curl -s -H "Authorization: Bearer test-token" http://localhost:3001/api/hikconnect/accounts)
echo "Response: $ACCOUNTS"

# Test adding a HikConnect account
echo -e "\n3. Testing account creation..."
ADD_ACCOUNT=$(curl -s -X POST \
  -H "Authorization: Bearer test-token" \
  -H "Content-Type: application/json" \
  -d '{
    "accountName": "Test Office Cameras",
    "accessKey": "test_access_key_123",
    "secretKey": "test_secret_key_456",
    "region": "global"
  }' \
  http://localhost:3001/api/hikconnect/accounts)
echo "Response: $ADD_ACCOUNT"

# Extract account ID for next tests
ACCOUNT_ID=$(echo $ADD_ACCOUNT | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "Account ID: $ACCOUNT_ID"

if [ ! -z "$ACCOUNT_ID" ]; then
  # Test device sync
  echo -e "\n4. Testing device sync..."
  SYNC_DEVICES=$(curl -s -X POST \
    -H "Authorization: Bearer test-token" \
    http://localhost:3001/api/hikconnect/devices/sync/$ACCOUNT_ID)
  echo "Response: $SYNC_DEVICES"
  
  # Test getting devices for account
  echo -e "\n5. Testing get account devices..."
  DEVICES=$(curl -s -H "Authorization: Bearer test-token" \
    http://localhost:3001/api/hikconnect/devices/account/$ACCOUNT_ID)
  echo "Response: $DEVICES"
  
  # Test stats
  echo -e "\n6. Testing statistics..."
  STATS=$(curl -s -H "Authorization: Bearer test-token" \
    http://localhost:3001/api/hikconnect/stats)
  echo "Response: $STATS"
fi

echo -e "\n====================================="
echo "✅ HikConnect API test completed!"
echo "📊 You can now test the frontend integration"
