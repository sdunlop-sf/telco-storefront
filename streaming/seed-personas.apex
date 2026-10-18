/* ───────────────────────────────────────────────────────────────────────────
 * SEED PERSONAS via the streaming Ingestion API (makes the stream the single
 * decision source). Pushes each of the 4 Bupa personas' CURRENT offer as a
 * status=active decision, so SP serves them from NBA_Decision_Stream once the
 * RT graph projects it. Same offers as the batch path — nothing visibly changes.
 *
 * Reuses the proven 3-step auth (client_credentials → a360 exchange → ingest).
 * WRITES 4 records to the Data Cloud lake — run only after you've said go.
 * Fill CLIENT_ID / CLIENT_SECRET in a /tmp copy; never commit secrets.
 * ─────────────────────────────────────────────────────────────────────────── */
String CLIENT_ID     = 'PASTE_CONSUMER_KEY';
String CLIENT_SECRET = 'PASTE_CONSUMER_SECRET';

// contactId => {offerId, treatmentId, triggerType}
Map<String, List<String>> personas = new Map<String, List<String>>{
  '003Kh00001uijWCIAY' => new List<String>{ '1XhKh000000PBQAKA4', '7otKh00000000GqIAI', 'bup_extras'    }, // Hannah Nguyen — Add Extras Cover
  '003Kh00001uijWDIAY' => new List<String>{ '1XhKh000000PBQBKA4', '7otKh00000000GsIAI', 'bup_upgrade'   }, // Daniel Chen   — Combine Hospital + Extras
  '003Kh00001uijWEIAY' => new List<String>{ '1XhKh000000PBQDKA4', '7otKh00000000GwIAI', 'bup_retention' }, // Rebecca Hall  — Renewal Save
  '003Kh00001uijWFIAY' => new List<String>{ '1XhKh000000PBQEKA4', '7otKh00000000GyIAI', 'bup_loyalty'   }  // Anita Kapoor  — Loyalty Reward
};

String domain = URL.getOrgDomainUrl().toExternalForm();

// 1. client_credentials → core token
HttpRequest r1 = new HttpRequest();
r1.setEndpoint(domain + '/services/oauth2/token');
r1.setMethod('POST');
r1.setHeader('Content-Type', 'application/x-www-form-urlencoded');
r1.setBody('grant_type=client_credentials&client_id=' + EncodingUtil.urlEncode(CLIENT_ID,'UTF-8')
  + '&client_secret=' + EncodingUtil.urlEncode(CLIENT_SECRET,'UTF-8'));
r1.setTimeout(60000);
HttpResponse p1 = new Http().send(r1);
if (p1.getStatusCode()!=200){ System.debug('STEP1 FAIL '+p1.getBody()); return; }
String coreToken = (String)((Map<String,Object>)JSON.deserializeUntyped(p1.getBody())).get('access_token');

// 2. a360 exchange → cdp token + tenant
HttpRequest r2 = new HttpRequest();
r2.setEndpoint(domain + '/services/a360/token');
r2.setMethod('POST');
r2.setHeader('Content-Type', 'application/x-www-form-urlencoded');
r2.setBody('grant_type=' + EncodingUtil.urlEncode('urn:salesforce:grant-type:external:cdp','UTF-8')
  + '&subject_token=' + EncodingUtil.urlEncode(coreToken,'UTF-8')
  + '&subject_token_type=' + EncodingUtil.urlEncode('urn:ietf:params:oauth:token-type:access_token','UTF-8'));
r2.setTimeout(60000);
HttpResponse p2 = new Http().send(r2);
if (p2.getStatusCode()!=200){ System.debug('STEP2 FAIL '+p2.getBody()); return; }
Map<String,Object> m2 = (Map<String,Object>) JSON.deserializeUntyped(p2.getBody());
String cdpToken = (String) m2.get('access_token');
String tenant = (String) m2.get('instance_url');
String base = tenant.startsWith('http') ? tenant : 'https://' + tenant;

// 3. push all personas, status=active, in one batch
String nowIso = Datetime.now().formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
String validIso = Datetime.now().addDays(30).formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
List<Object> rows = new List<Object>();
Integer n = 0;
for (String cId : personas.keySet()) {
  List<String> p = personas.get(cId);
  rows.add(new Map<String,Object>{
    'decisionId' => cId, 'contactId' => cId, 'offerId' => p[0],  // bare-contact key = publisher upsert namespace (one row/person)
    'treatmentId' => p[1], 'actionId' => '', 'triggerType' => p[2],
    'status' => 'active', 'supersedes' => '', 'validUntil' => validIso, 'eventTime' => nowIso
  });
  n++;
}
String payload = JSON.serialize(new Map<String,Object>{ 'data' => rows });
HttpRequest r3 = new HttpRequest();
r3.setEndpoint(base + '/api/v1/ingest/sources/NBA_Decision_Stream/Decision');
r3.setMethod('POST');
r3.setHeader('Authorization', 'Bearer ' + cdpToken);
r3.setHeader('Content-Type', 'application/json');
r3.setBody(payload);
r3.setTimeout(60000);
HttpResponse p3 = new Http().send(r3);
System.debug('SEED INGEST status=' + p3.getStatusCode() + ' body=' + p3.getBody() + ' count=' + rows.size());
