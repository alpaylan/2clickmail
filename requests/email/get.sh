# Get email
#!/bin/bash
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
# Extract the email
# If an email id is provided, use it.
if [ -n "$1" ]; then
    EMAIL_ID=$1
    DATA=$(jq -r ".emails | select(._id == "$EMAIL_ID") | .[0]" <<< "$DATA")
else
    # Pick a random email id from data.json
    DATA=$(jq -r ".emails[$RANDOM_NUMBER]._id" <<< "$DATA")
fi

RESP=$(curl -s -X GET http://127.0.0.1:8080/email?value=$DATA)

echo "$RESP"