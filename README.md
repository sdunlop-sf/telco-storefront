# Telco storefront — SP + Decisioning demo

A reusable, brand-agnostic storefront that demonstrates the layered real-time
decisioning architecture:

- **Decisioning Hub (outbound)** arbitrates the best offer per individual under
  contact policy / cross-domain rules and writes it into Data 360 — the *frame*.
- **Salesforce Personalization (inbound)** inherits that frame and serves it in
  real time, then **re-shapes it live** as the visitor's in-session browse
  context changes.

## Run locally

Open `index.html` — it runs in **mock mode** (no Salesforce needed) and
simulates both the DH outbound frame and the SP inbound overlay.

## Go live against Salesforce Personalization

Edit `config.js`:
1. Paste the Website connector **beacon URL** into `BEACON_URL`.
2. Set `MOCK_MODE = false`.
3. Set `PERSONALIZATION_POINT` to the SP personalization point API name.

Build steps for the Salesforce side are in
`docs/sp-rtom-dh-demo-runbook.md` in the decisioning-accelerator repo.
