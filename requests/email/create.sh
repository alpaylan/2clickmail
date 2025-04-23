# Create an email
#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TOKEN=$(source $SCRIPT_DIR/../auth/login.sh)

if [ -z "$TOKEN" ]; then
  echo "Failed to get token"
  exit
fi

echo "Token: $TOKEN"

# Generate random usermail and password
TO=$(uuidgen | cut -d'-' -f1)@example.com
CC=$(uuidgen | cut -d'-' -f1)@example.com
BCC=$(uuidgen | cut -d'-' -f1)@example.com
SUBJECT=$(uuidgen | cut -d'-' -f1)
BODY=$(uuidgen | cut -d'-' -f1)

DATA='{"to": ["'"$TO"'"], "cc": ["'"$CC"'"], "bcc": ["'"$BCC"'"], "subject": "'"$SUBJECT"'", "body": "'"$BODY"'"}'
DATA='{"mode": "generate", "email": '"$DATA"'}'
echo "r: $(jq -r '.email' <<< "$DATA")"
echo "Data: $DATA"
# Post the email generation request
curl -X POST http://127.0.0.1:8080/email \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d $DATA