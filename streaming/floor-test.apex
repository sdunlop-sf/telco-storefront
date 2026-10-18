/* ───────────────────────────────────────────────────────────────────────────
 * FLOOR TEST — streaming decision push (hop 2).
 *
 * Proves the "out" hop: Apex → Data Cloud Ingestion API → Decision DMO. If this
 * returns HTTP 202, a decision can land in the lake in seconds; we then time how
 * fast SP serves it (that latency IS the real test).
 *
 * Three steps, per Salesforce Data Cloud Ingestion API docs:
 *   1. client_credentials → core access token (connected app w/ cdp_ingest_api).
 *   2. /services/a360/token exchange → Data Cloud (cdp) token + tenant URL.
 *   3. POST the decision to {tenant}/api/v1/ingest/sources/NBA_Decision_Stream/Decision.
 *
 * HOW TO RUN (never committed with real secrets — fill in a /tmp copy):
 *   cp this file /tmp/floor-test.apex, paste CLIENT_ID / CLIENT_SECRET from the
 *   NBA Data Cloud Ingest connected app, then:
 *     sf apex run --target-org "NBA Testing Org" --file /tmp/floor-test.apex
 *
 * Requires (deploy first): remote sites DC_Ingest_OrgDomain_4b + DC_Ingest_Tenant.
 * WRITES one record to the Data Cloud lake — run only after you've said go.
 * ─────────────────────────────────────────────────────────────────────────── */
String CLIENT_ID     = 'PASTE_CONSUMER_KEY';
String CLIENT_SECRET = 'PASTE_CONSUMER_SECRET';

// Default persona = Hannah Nguyen, her proven offer/treatment, status active.
String contactId   = '003Kh00001uijWCIAY';
String offerId     = '1XhKh000000PBQAKA4';
String treatmentId = '7otKh00000000GqIAI';
String status      = 'active';
String trig        = 'bup_extras';

String domain = URL.getOrgDomainUrl().toExternalForm();

// ── 1. client_credentials → core token ──────────────────────────────────────
HttpRequest r1 = new HttpRequest();
r1.setEndpoint(domain + '/services/oauth2/token');
r1.setMethod('POST');
r1.setHeader('Content-Type', 'application/x-www-form-urlencoded');
r1.setBody('grant_type=client_credentials'
  + '&client_id=' + EncodingUtil.urlEncode(CLIENT_ID, 'UTF-8')
  + '&client_secret=' + EncodingUtil.urlEncode(CLIENT_SECRET, 'UTF-8'));
r1.setTimeout(60000);
HttpResponse p1 = new Http().send(r1);
System.debug('STEP1 status=' + p1.getStatusCode());
if (p1.getStatusCode() != 200) { System.debug('STEP1 body=' + p1.getBody()); return; }
String coreToken = (String) ((Map<String,Object>) JSON.deserializeUntyped(p1.getBody())).get('access_token');

// ── 2. a360 exchange → cdp token + tenant url ────────────────────────────────
HttpRequest r2 = new HttpRequest();
r2.setEndpoint(domain + '/services/a360/token');
r2.setMethod('POST');
r2.setHeader('Content-Type', 'application/x-www-form-urlencoded');
r2.setBody('grant_type=' + EncodingUtil.urlEncode('urn:salesforce:grant-type:external:cdp', 'UTF-8')
  + '&subject_token=' + EncodingUtil.urlEncode(coreToken, 'UTF-8')
  + '&subject_token_type=' + EncodingUtil.urlEncode('urn:ietf:params:oauth:token-type:access_token', 'UTF-8'));
r2.setTimeout(60000);
HttpResponse p2 = new Http().send(r2);
System.debug('STEP2 status=' + p2.getStatusCode());
if (p2.getStatusCode() != 200) { System.debug('STEP2 body=' + p2.getBody()); return; }
Map<String,Object> m2 = (Map<String,Object>) JSON.deserializeUntyped(p2.getBody());
String cdpToken = (String) m2.get('access_token');
String tenant   = (String) m2.get('instance_url'); // host only, no scheme
System.debug('STEP2 cdpToken=' + (cdpToken != null) + ' tenant=' + tenant);

// ── 3. ingest one decision ───────────────────────────────────────────────────
String decId = 'TESTDEC' + String.valueOf(Datetime.now().getTime());
String nowIso = Datetime.now().formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
String validIso = Datetime.now().addDays(7).formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
Map<String,Object> rec = new Map<String,Object>{
  'decisionId' => decId, 'contactId' => contactId, 'offerId' => offerId,
  'treatmentId' => treatmentId, 'actionId' => '', 'triggerType' => trig,
  'status' => status, 'supersedes' => '', 'validUntil' => validIso, 'eventTime' => nowIso
};
String payload = JSON.serialize(new Map<String,Object>{ 'data' => new List<Object>{ rec } });

String base = tenant.startsWith('http') ? tenant : 'https://' + tenant;
HttpRequest r3 = new HttpRequest();
r3.setEndpoint(base + '/api/v1/ingest/sources/NBA_Decision_Stream/Decision');
r3.setMethod('POST');
r3.setHeader('Authorization', 'Bearer ' + cdpToken);
r3.setHeader('Content-Type', 'application/json');
r3.setBody(payload);
r3.setTimeout(60000);
HttpResponse p3 = new Http().send(r3);
System.debug('STEP3 INGEST status=' + p3.getStatusCode() + ' body=' + p3.getBody());
System.debug('PUSHED decisionId=' + decId + ' contact=' + contactId + ' status=' + status);
