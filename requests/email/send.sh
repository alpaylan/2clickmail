# Create an email
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TOKEN=$(source $SCRIPT_DIR/../auth/login.sh)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit
fi

# Extract the email
# If an email id is provided, use it.
if [ -n "$1" ]; then
    EMAIL_ID=$1
else
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    DATA=$(cat $SCRIPT_DIR/data.json | tr -d '\n')
    ## Pick a random email
    # Get the length of the list
    if [ ! -f "$SCRIPT_DIR/data.json" ]; then
        echo "data.json file not found!"
        exit 1
    fi
    LENGTH=$(jq '.emails | length' <<< "$DATA")
    if [ "$LENGTH" -eq 0 ]; then
        echo "No emails found in data.json"
        exit 1
    fi
    # Generate a random number
    RANDOM_NUMBER=$((RANDOM % LENGTH))
    # Pick a random email id from data.json
    EMAIL_ID=$(jq -r ".emails[$RANDOM_NUMBER]._id" <<< "$DATA")
fi

REQUEST='{"mode": "increment_sent_count", "id": '\"$EMAIL_ID\"'}'
echo $REQUEST

# Post the email generation request
RESULT=$(curl -s -X POST http://127.0.0.1:8080/email \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$REQUEST")

echo $RESULT