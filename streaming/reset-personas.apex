/* ───────────────────────────────────────────────────────────────────────────
 * RESET PERSONAS to their home offer (repeatable-demo helper).
 *
 * After a live re-decide test a persona is parked on whatever offer was last
 * streamed. This restores the clean baseline in one push:
 *   1. query the stream DMO for every status=active row,
 *   2. supersede them all (same-PK upsert -> status=superseded),
 *   3. stream one fresh status=active HOME decision per persona.
 * Net result: each persona serves their home offer again, zero stale actives.
 *
 * Reuses the proven 3-step auth. WRITES to the Data Cloud lake.
 * Fill CLIENT_ID / CLIENT_SECRET in a /tmp copy; never commit secrets.
 * ─────────────────────────────────────────────────────────────────────────── */
String CLIENT_ID     = 'PASTE_CONSUMER_KEY';
String CLIENT_SECRET = 'PASTE_CONSUMER_SECRET';

// contactId => {offerId, webTreatmentId, triggerType} — the home decision per persona.
Map<String, List<String>> home = new Map<String, List<String>>{
  '003Kh00001uijWCIAY' => new List<String>{ '1XhKh000000PBQAKA4', '7otKh00000000GqIAI', 'bup_extras'    }, // Hannah Nguyen — Add Extras Cover
  '003Kh00001uijWDIAY' => new List<String>{ '1XhKh000000PBQBKA4', '7otKh00000000GsIAI', 'bup_upgrade'   }, // Daniel Chen   — Combine Hospital + Extras
  '003Kh00001uijWEIAY' => new List<String>{ '1XhKh000000PBQDKA4', '7otKh00000000GwIAI', 'bup_retention' }, // Rebecca Hall  — Renewal Save
  '003Kh00001uijWFIAY' => new List<String>{ '1XhKh000000PBQEKA4', '7otKh00000000GyIAI', 'bup_loyalty'   }  // Anita Kapoor  — Loyalty Reward
};

String domain = URL.getOrgDomainUrl().toExternalForm();

// 1. client_credentials -> core token
HttpRequest r1 = new HttpRequest();
r1.setEndpoint(domain + '/services/oauth2/token'); r1.setMethod('POST');
r1.setHeader('Content-Type','application/x-www-form-urlencoded');
r1.setBody('grant_type=client_credentials&client_id=' + EncodingUtil.urlEncode(CLIENT_ID,'UTF-8')
  + '&client_secret=' + EncodingUtil.urlEncode(CLIENT_SECRET,'UTF-8')); r1.setTimeout(60000);
HttpResponse p1 = new Http().send(r1);
if (p1.getStatusCode()!=200){ System.debug('S1 '+p1.getBody()); return; }
String coreToken = (String)((Map<String,Object>)JSON.deserializeUntyped(p1.getBody())).get('access_token');

// 2. a360 exchange -> cdp token + tenant
HttpRequest r2 = new HttpRequest();
r2.setEndpoint(domain + '/services/a360/token'); r2.setMethod('POST');
r2.setHeader('Content-Type','application/x-www-form-urlencoded');
r2.setBody('grant_type=' + EncodingUtil.urlEncode('urn:salesforce:grant-type:external:cdp','UTF-8')
  + '&subject_token=' + EncodingUtil.urlEncode(coreToken,'UTF-8')
  + '&subject_token_type=' + EncodingUtil.urlEncode('urn:ietf:params:oauth:token-type:access_token','UTF-8'));
r2.setTimeout(60000);
HttpResponse p2 = new Http().send(r2);
if (p2.getStatusCode()!=200){ System.debug('S2 '+p2.getBody()); return; }
Map<String,Object> m2 = (Map<String,Object>) JSON.deserializeUntyped(p2.getBody());
String cdpToken = (String) m2.get('access_token');
String tenant = (String) m2.get('instance_url');
String base = tenant.startsWith('http') ? tenant : 'https://' + tenant;

// 3. find all current active rows (core-proxied queryv2, uses session id)
String sid = UserInfo.getSessionId();
HttpRequest rq = new HttpRequest();
rq.setEndpoint(domain + '/services/data/v66.0/ssot/queryv2'); rq.setMethod('POST');
rq.setHeader('Authorization','Bearer ' + sid); rq.setHeader('Content-Type','application/json');
rq.setBody(JSON.serialize(new Map<String,Object>{ 'sql' =>
  'SELECT decisionId__c, contactId__c, offerId__c, treatmentId__c, triggerType__c '
  + 'FROM NBA_Decision_Stream_Decision_598F949__dlm WHERE status__c = \'active\'' }));
rq.setTimeout(60000);
HttpResponse pq = new Http().send(rq);
if (pq.getStatusCode()!=200 && pq.getStatusCode()!=201){ System.debug('QUERY '+pq.getBody()); return; }
Map<String,Object> qm = (Map<String,Object>) JSON.deserializeUntyped(pq.getBody());
List<Object> dataRows = (List<Object>) qm.get('data');

String nowIso = Datetime.now().formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
String validIso = Datetime.now().addDays(30).formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
List<Object> rows = new List<Object>();

// supersede every current active row (same PK)
Integer superseded = 0;
if (dataRows != null) {
  for (Object o : dataRows) {
    List<Object> c = (List<Object>) o;
    rows.add(new Map<String,Object>{
      'decisionId'=>(String)c[0], 'contactId'=>(String)c[1], 'offerId'=>(String)c[2],
      'treatmentId'=>(String)c[3], 'actionId'=>'', 'triggerType'=>(String)c[4],
      'status'=>'superseded', 'supersedes'=>'', 'validUntil'=>validIso, 'eventTime'=>nowIso });
    superseded++;
  }
}

// stream one fresh active HOME decision per persona
for (String cId : home.keySet()) {
  List<String> h = home.get(cId);
  rows.add(new Map<String,Object>{
    'decisionId'=>cId, 'contactId'=>cId, 'offerId'=>h[0],  // bare-contact key = publisher upsert namespace (one active row/person)
    'treatmentId'=>h[1], 'actionId'=>'', 'triggerType'=>h[2],
    'status'=>'active', 'supersedes'=>'', 'validUntil'=>validIso, 'eventTime'=>nowIso });
}

HttpRequest r3 = new HttpRequest();
r3.setEndpoint(base + '/api/v1/ingest/sources/NBA_Decision_Stream/Decision'); r3.setMethod('POST');
r3.setHeader('Authorization','Bearer ' + cdpToken); r3.setHeader('Content-Type','application/json');
r3.setBody(JSON.serialize(new Map<String,Object>{ 'data' => rows })); r3.setTimeout(60000);
HttpResponse p3 = new Http().send(r3);
System.debug('RESET status=' + p3.getStatusCode() + ' body=' + p3.getBody()
  + ' superseded=' + superseded + ' homeActivated=' + home.size() + ' totalRows=' + rows.size());
