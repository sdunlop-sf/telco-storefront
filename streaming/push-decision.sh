#!/usr/bin/env bash
# Push one decision record into Data Cloud via the NBA_Decision_Stream Ingestion
# API connector, to prove the streaming "out" hop: Apex -> Ingestion API -> DMO
# -> RT graph -> SP, in seconds (beating the batch CRM connector lag).
#
# WRITES a record into the Data Cloud data lake on 4b. Not a code/metadata
# deploy, but it is a data write — run only after the schema is uploaded and
# you've said go.
#
# Usage:
#   ./push-decision.sh                       # pushes Hannah, active, her known offer
#   ./push-decision.sh <contactId> <offerId> <treatmentId> <status> <triggerType>
#
# Prereqs:
#   - Schema uploaded to the NBA_Decision_Stream connector (object: Decision)
#   - The CLI user/connected app has Data Cloud API scope (cdp_api). If the
#     token exchange 401s, that scope is missing -> make a dedicated connected
#     app (see README). The raw exchange response is printed on failure.
set -euo pipefail

ORG="NBA Testing Org"
SOURCE="NBA_Decision_Stream"
OBJECT="Decision"

# Defaults = Hannah Nguyen (bundle), her proven offer/treatment, active.
CONTACT_ID="${1:-003Kh00001uijWCIAY}"
OFFER_ID="${2:-1XhKh000000PBQAKA4}"
TREATMENT_ID="${3:-7otKh00000000GqIAI}"
STATUS="${4:-active}"
TRIGGER="${5:-bup_extras}"

DECISION_ID="TESTDEC$(date +%s)"
NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
VALID="$(date -u -v+7d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '+7 days' +%Y-%m-%dT%H:%M:%SZ)"

echo "== 1. core token =="
CORE=$(sf org display --target-org "$ORG" --json | python3 -c "import sys,json;print(json.load(sys.stdin)['result']['accessToken'])")
MYDOMAIN=$(sf org display --target-org "$ORG" --json | python3 -c "import sys,json;print(json.load(sys.stdin)['result']['instanceUrl'])")

echo "== 2. exchange for Data Cloud token =="
RESP=$(curl -s -X POST "$MYDOMAIN/services/a360/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "grant_type=urn:salesforce:grant-type:external:cdp" \
  --data-urlencode "subject_token=$CORE" \
  --data-urlencode "subject_token_type=urn:ietf:params:oauth:token-type:access_token")

DC_TOKEN=$(echo "$RESP" | python3 -c "import sys,json;print(json.load(sys.stdin).get('access_token',''))" 2>/dev/null || true)
DC_URL=$(echo "$RESP" | python3 -c "import sys,json;print(json.load(sys.stdin).get('instance_url',''))" 2>/dev/null || true)
if [ -z "$DC_TOKEN" ] || [ -z "$DC_URL" ]; then
  echo "!! token exchange failed — likely missing Data Cloud API (cdp_api) scope."
  echo "$RESP"
  exit 1
fi
echo "   data cloud tenant: $DC_URL"

echo "== 3. push decision $DECISION_ID (contact=$CONTACT_ID status=$STATUS) =="
PAYLOAD=$(python3 - "$DECISION_ID" "$CONTACT_ID" "$OFFER_ID" "$TREATMENT_ID" "$STATUS" "$TRIGGER" "$VALID" "$NOW" <<'PY'
import json, sys
d, c, o, t, s, tr, v, now = sys.argv[1:9]
print(json.dumps({"data": [{
    "decisionId": d, "contactId": c, "offerId": o, "treatmentId": t,
    "actionId": "", "triggerType": tr, "status": s, "supersedes": "",
    "validUntil": v, "eventTime": now
}]}))
PY
)

curl -s -w "\nHTTP %{http_code}\n" -X POST \
  "$DC_URL/api/v1/ingest/sources/$SOURCE/$OBJECT" \
  -H "Authorization: Bearer $DC_TOKEN" \
  -H "Content-Type: application/json" \
  --data "$PAYLOAD"

echo
echo "Pushed. Now: check the Decision DLO/DMO in Data Cloud (Data Explorer) for"
echo "$DECISION_ID, then hit the SP personalization point for this contact and"
echo "time how long until the fresh decision is served. That latency IS the test."
