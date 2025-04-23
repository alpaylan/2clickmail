# Login
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

DATA=$(cat $SCRIPT_DIR/data.json | tr -d '\n')

## Pick a random usermail and password
# Get the length of the list
LENGTH=$(jq '.users | length' <<< "$DATA")
# Generate a random number
RANDOM_NUMBER=$((RANDOM % LENGTH))
# Extract the usermail and password
DATA=$(jq -r ".users[$RANDOM_NUMBER]" <<< "$DATA")


RESP=$(curl -s -X POST http://127.0.0.1:8080/login \
     -H "Content-Type: application/json" \
     -d "$DATA")

# If "Success" returned, extract the token
if echo "$RESP" | grep -q '"Success"'; then
    TOKEN=$(jq -r '.Success' <<< "$RESP")
    echo "$TOKEN"
else
    ERROR=$(jq -r '.Failure' <<< "$RESP")
    echo "$ERROR"
    exit 1
fi