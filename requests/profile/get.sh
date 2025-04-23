# Get profile
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TOKEN=$(source $SCRIPT_DIR/../auth/login.sh)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit
fi

echo "Token: $TOKEN"

DATA=$(cat $SCRIPT_DIR/data.json)

# Get user profile
curl -X GET http://127.0.0.1:8080/profile \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d $DATA