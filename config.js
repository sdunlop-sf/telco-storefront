/* ─────────────────────────────────────────────────────────────────────────
 * nova. storefront — demo config.
 *
 * This is the ONE file you edit to flip the site from local mock to live SP.
 *
 * MOCK_MODE true  -> renders a sample offer locally, no Salesforce needed.
 *                    Use for styling / offline dev / showing the shell.
 * MOCK_MODE false -> loads the Data 360 Web SDK beacon and lets Salesforce
 *                    Personalization serve the decision for the "For you" slot.
 *
 * To go live:
 *   1. On 4b create the Website connector (Data Cloud Setup > Websites & Mobile
 *      Apps) and copy its beacon URL into BEACON_URL below.
 *   2. Set MOCK_MODE = false.
 *   3. Set PERSONALIZATION_POINT to the API name of the SP personalization point.
 * ───────────────────────────────────────────────────────────────────────── */
window.DEMO_CONFIG = {
  MOCK_MODE: false,

  // Shown in the header. Pure cosmetics.
  BRAND: "Bupa",

  // Beacon from the 4b "nova Storefront" Website connector.
  BEACON_URL: "https://cdn.c360a.salesforce.com/beacon/c360a/5e39738b-7dd0-46b3-b82d-10a7983da2fd/scripts/c360a.min.js",

  // API name of the SP personalization point that serves the storefront slot.
  // Generic on purpose — ONE point serves every demo vertical. The per-person
  // OfferId match in the recommender keeps demos isolated, so this never changes.
  PERSONALIZATION_POINT: "DA_Perso_Point",

  // Engagement channel passed as dynamic context to the recommender rules.
  CHANNEL: "Web",

  // Data 360 Decisioning API endpoint. Paste the Data Cloud "Tenant Specific
  // Endpoint" (Data Cloud Setup) and append /personalization/decisions, e.g.
  //   https://<tenant>.c360a.salesforce.com/personalization/decisions
  // Required for live mode. The point's Authentication must be unchecked so the
  // browser can POST without credentials.
  DECISION_ENDPOINT: "https://mm4gcmjwmzrwcnjzm02g8n3bg0.c360a.salesforce.com/personalization/decisions",

  // Data space the personalization point lives in (profile graph scope).
  DATASPACE: "default",

  // Live re-poll interval (ms) for the "For you" slot. >0 re-requests the SP
  // decision on a timer so a signal-driven re-decision (DH supersedes the old
  // offer + streams a new active one) is SEEN swapping in near-real-time — the
  // "stale offer vanishes, fresh one appears" beat. 0 disables (serve once on
  // arrival/browse only). Each poll is a live decision call and writes a
  // Personalization Record to the lake — fine for demo; set 0 for a static shell.
  POLL_MS: 4000,

  // Where the logged-in "For you" hero sources its offer:
  //   "fallback" -> ALWAYS render the local per-persona home offer (app.js
  //                 FALLBACK_OFFER). Guaranteed-clean Bupa mock-up, no
  //                 dependency on Data Cloud. Use for a visual / while the item
  //                 graph is mid-refresh or propagation is lagging.
  //   "auto"     -> prefer the live SP decision, but only accept it when the
  //                 served OfferId is a known Bupa offer; otherwise show the
  //                 local home offer. Self-upgrades to live once DC serves
  //                 Bupa (stale non-Bupa serves are ignored).
  //   "live"     -> trust whatever SP serves (original behaviour; needed for the
  //                 live web-flip beat once DC is refreshed).
  HERO_SOURCE: "auto",

  // How the "For you" slot renders the SP decision:
  //   "treatment" (default) -> drop the hydrated TreatmentOutput card in whole,
  //                            image included. Pixel-identical to the email.
  //   "fields"              -> render structured fields into the native hero
  //                            (needs a standalone image field on the graph).
  RENDER_MODE: "fields",

  // Product catalog used by the browse events. Replace the id values with the
  // real Product / ProductCategory record ids from 4b once wired, so the
  // Product Browse Engagement events resolve against the catalog.
  CATALOG: {
    hospital: {
      id: "PROD_HOSPITAL", category: "CAT_HOSPITAL", label: "Hospital Cover",
      sub: "Gold · Silver · Bronze tiers", price: "from $21/wk",
      img: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80&auto=format&fit=crop"
    },
    extras: {
      id: "PROD_EXTRAS", category: "CAT_EXTRAS", label: "Extras Cover",
      sub: "Dental · optical · physio", price: "from $9/wk",
      img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80&auto=format&fit=crop"
    },
    claims: {
      id: "PROD_CLAIMS", category: "CAT_CLAIMS", label: "Make a claim",
      sub: "myBupa app · swipe or snap", price: "Included",
      img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80&auto=format&fit=crop"
    },
    benefits: {
      id: "PROD_BENEFITS", category: "CAT_BENEFITS", label: "Member benefits",
      sub: "Health programs & partner perks", price: "Included",
      img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&auto=format&fit=crop"
    }
  }
};
