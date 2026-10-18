# Streaming decision loop (hop 2: decision -> SP, in seconds)

The storefront already serves DH decisions inbound via SP. This folder adds the
**fast "out" hop** so a *freshly fired / superseded* decision reaches SP in
seconds instead of waiting on the batch CRM->DC connector. That's what makes the
"stale offer vanishes" beat genuinely live.

## The contract (why this works)

Freshness is enforced by **what the RT profile graph projects**, not by logic SP
runs. SP stays a dumb render surface:

1. Every decision carries `status` (active | superseded | consumed | expired) + `validUntil`.
2. The RT graph projects **only `status = active` and unexpired** decisions.
3. A signal fires DH re-arbitration -> old decision `superseded`, new one `active`.
4. SP's next poll self-corrects: stale offer drops out of the graph, fresh one appears.

## Pieces

| File | What it is |
|------|-----------|
| `decision-stream.openapi.yaml` | OAS schema for the `NBA_Decision_Stream` Ingestion API connector. One object: `Decision`. Upload in Data Cloud Setup -> Ingestion API -> NBA_Decision_Stream -> Upload Files. |
| `push-decision.sh` | Proves the floor: pushes one decision through the connector, so we can time how fast SP serves it. |

## Identity (the join that must hold)

The streamed `Decision.contactId` must map, in the DMO, to a field that resolves
through `IndividualIdentityLink__dlm` (SourceRecordId = Contact Id) ->
`UnifiedIndividual__dlm` — the same join proven on the batch path. If the record
lands without a resolvable Contact Id, SP will not see it.

## Order of operations (on 4b — each step announced before writes)

1. **[you]** Upload `decision-stream.openapi.yaml` to the connector. Status Schema Required -> Connected.
2. **[you]** Map the resulting `Decision` DLO -> a DMO. PK = `decisionId`; event time = `eventTime`; map `contactId` for identity resolution.
3. **[test]** Run `./push-decision.sh` and time decision-in -> served-by-SP. If seconds, hop 2 holds.
4. **[build]** Point the RT profile graph at the streaming decision DMO (may be a NEW graph — RT graph API names are immutable).
5. **[build]** Add `status = active` + `validUntil` projection filter.
6. **[build]** Wire hop 1: signal -> re-arbitration -> supersede + push (Apex -> this connector).
7. **[build]** Site re-poll so the vanish/replace is visible without a manual refresh.

## Auth note

`push-decision.sh` exchanges the CLI session for a Data Cloud token at
`/services/a360/token` (grant `urn:salesforce:grant-type:external:cdp`). If that
401s, the CLI connected app lacks the `cdp_api` scope — create a dedicated
connected app with Data Cloud scopes and use its token instead. The script
prints the raw exchange response on failure.
