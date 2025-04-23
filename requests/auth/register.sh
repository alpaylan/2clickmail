# Register
#!/bin/bash

# Generate random usermail and password
USERMAIL=$(uuidgen | cut -d'-' -f1)
PASSWORD=$(uuidgen | cut -d'-' -f1)

DATA='{ "usermail": "'"$USERMAIL"'", "password": "'"$PASSWORD"'"}'

# Append new usermail-password to to data.json
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_FILE="$SCRIPT_DIR/data.json"

if [ -f "$DATA_FILE" ]; then
    jq --arg usermail "$USERMAIL" --arg password "$PASSWORD" \
        '.users += [{"usermail": $usermail, "password": $password}]' \
        "$DATA_FILE" > tmp.$$.json && mv tmp.$$.json "$DATA_FILE"
else
    touch "$DATA_FILE"
    jq -nc --arg usermail "$USERMAIL" --arg password "$PASSWORD" \
        '{ "users": [{"usermail": $usermail, "password": $password}] }' \
        > "$DATA_FILE"
fi

RESP=$(curl -s -X POST http://127.0.0.1:8080/register \
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