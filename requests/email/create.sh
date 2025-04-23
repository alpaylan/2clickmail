# Create an email
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TOKEN=$(source $SCRIPT_DIR/../auth/login.sh)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit
fi

# Generate random usermail and password
TO=$(uuidgen | cut -d'-' -f1)@example.com
CC=$(uuidgen | cut -d'-' -f1)@example.com
BCC=$(uuidgen | cut -d'-' -f1)@example.com
SUBJECT=$(uuidgen | cut -d'-' -f1)
BODY=$(uuidgen | cut -d'-' -f1)

DATA='{"to": ["'"$TO"'"], "cc": ["'"$CC"'"], "bcc": ["'"$BCC"'"], "subject": "'"$SUBJECT"'", "body": "'"$BODY"'"}'

REQUEST='{"mode": "generate", "email": '"$DATA"'}'


# Post the email generation request
RESULT=$(curl -s -X POST http://127.0.0.1:8080/email \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$REQUEST")


DATA='{"_id": '$RESULT', "data": '"$DATA"'}'

DATA_FILE="$SCRIPT_DIR/data.json"

# Save the email to data.json
if [ -f "$DATA_FILE" ]; then
    jq --arg email "$DATA"  \
        '.emails += [$email | fromjson]' \
        "$DATA_FILE" > tmp.$$.json && mv tmp.$$.json "$DATA_FILE"
else
    touch "$DATA_FILE"
    jq -nc --arg email "$DATA" \
        '.emails += [$email | fromjson]' \
        > "$DATA_FILE"
fi

echo $DATA