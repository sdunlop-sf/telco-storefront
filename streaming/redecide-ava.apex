/* ───────────────────────────────────────────────────────────────────────────
 * RE-DECIDE TEST (the "stale offer vanishes" beat, genuinely live).
 * Supersedes Hannah's current seed decision (status=superseded, same PK = upsert)
 * and activates a DIFFERENT offer. If the graph's status=active filter holds,
 * the Decisioning API flips from the old offer to the new one.
 *
 * WRITES 2 records to the Data Cloud lake. Fill secrets in a /tmp copy.
 * ─────────────────────────────────────────────────────────────────────────── */
String CLIENT_ID     = 'PASTE_CONSUMER_KEY';
String CLIENT_SECRET = 'PASTE_CONSUMER_SECRET';

String contactId  = '003Kh00001uijWCIAY';          // Hannah
String oldDecId   = 'SEED003Kh00001uijWCIAY0';      // her seeded active decision
String newOffer   = '1XhKh000000PBQBKA4';           // BUP_COMBINE — cover upgrade
String newTreat   = '7otKh00000000GsIAI';           // "Combine your hospital + extras and save"

String domain = URL.getOrgDomainUrl().toExternalForm();

HttpRequest r1 = new HttpRequest();
r1.setEndpoint(domain + '/services/oauth2/token'); r1.setMethod('POST');
r1.setHeader('Content-Type','application/x-www-form-urlencoded');
r1.setBody('grant_type=client_credentials&client_id=' + EncodingUtil.urlEncode(CLIENT_ID,'UTF-8')
  + '&client_secret=' + EncodingUtil.urlEncode(CLIENT_SECRET,'UTF-8')); r1.setTimeout(60000);
HttpResponse p1 = new Http().send(r1);
if (p1.getStatusCode()!=200){ System.debug('S1 '+p1.getBody()); return; }
String coreToken = (String)((Map<String,Object>)JSON.deserializeUntyped(p1.getBody())).get('access_token');

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

String nowIso = Datetime.now().formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
String validIso = Datetime.now().addDays(30).formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
String newDecId = 'REDEC' + Datetime.now().getTime();
List<Object> rows = new List<Object>{
  new Map<String,Object>{ 'decisionId'=>oldDecId, 'contactId'=>contactId, 'offerId'=>'1XhKh000000PBQAKA4',
    'treatmentId'=>'7otKh00000000GqIAI', 'actionId'=>'', 'triggerType'=>'bup_extras',
    'status'=>'superseded', 'supersedes'=>'', 'validUntil'=>validIso, 'eventTime'=>nowIso },
  new Map<String,Object>{ 'decisionId'=>newDecId, 'contactId'=>contactId, 'offerId'=>newOffer,
    'treatmentId'=>newTreat, 'actionId'=>'', 'triggerType'=>'bup_upgrade',
    'status'=>'active', 'supersedes'=>oldDecId, 'validUntil'=>validIso, 'eventTime'=>nowIso }
};
HttpRequest r3 = new HttpRequest();
r3.setEndpoint(base + '/api/v1/ingest/sources/NBA_Decision_Stream/Decision'); r3.setMethod('POST');
r3.setHeader('Authorization','Bearer ' + cdpToken); r3.setHeader('Content-Type','application/json');
r3.setBody(JSON.serialize(new Map<String,Object>{ 'data' => rows })); r3.setTimeout(60000);
HttpResponse p3 = new Http().send(r3);
System.debug('REDECIDE status=' + p3.getStatusCode() + ' body=' + p3.getBody()
  + ' superseded=' + oldDecId + ' newActive=' + newDecId + ' newOffer=' + newOffer);
