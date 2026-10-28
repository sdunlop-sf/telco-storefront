/* ─────────────────────────────────────────────────────────────────────────
 * My NRMA app — demo config (NRMA loyalty: fuel savings, EV charging, NRMA
 * Parks, dining rewards and travel benefits, served into the member app).
 *
 * This is the ONE file you edit to flip the app from local mock to live SP.
 * MOCK_MODE false loads the Data 360 Web SDK beacon and lets Salesforce
 * Personalization serve the DH decision into the "For you" hero.
 * ───────────────────────────────────────────────────────────────────────── */
window.DEMO_CONFIG = {
  MOCK_MODE: false,

  // Shown in the header / footer. Pure cosmetics.
  BRAND: "NRMA",

  // Beacon from the 4b Website/App connector (harness shared across demos).
  BEACON_URL: "https://cdn.c360a.salesforce.com/beacon/c360a/5e39738b-7dd0-46b3-b82d-10a7983da2fd/scripts/c360a.min.js",

  // API name of the SP personalization point that serves the app slot.
  // Generic on purpose — ONE point serves every demo vertical.
  PERSONALIZATION_POINT: "DA_Perso_Point",

  // Engagement channel passed as dynamic context to the recommender rules.
  CHANNEL: "Web",

  // Data 360 Decisioning API endpoint (tenant endpoint + /personalization/decisions).
  DECISION_ENDPOINT: "https://mm4gcmjwmzrwcnjzm02g8n3bg0.c360a.salesforce.com/personalization/decisions",

  // Data space the personalization point lives in (profile graph scope).
  DATASPACE: "default",

  // Live re-poll interval (ms) for the "For you" slot. The flip beat: fire a
  // fresh arbitration -> the new offer swaps into the hero.
  POLL_MS: 4000,

  // Where the logged-in "For you" hero sources its offer:
  //   "fallback" -> ALWAYS render the local per-persona home offer (app.js
  //                 FALLBACK_OFFER). Guaranteed-clean My NRMA mock-up, no
  //                 Data Cloud dependency.
  //   "auto"     -> prefer the live SP decision, but only accept it when the
  //                 served offer is a known NRMA offer (brand token); else
  //                 show the local one. Safe (never serves a ghost) AND live.
  //   "live"     -> trust whatever SP serves, no NRMA guard.
  HERO_SOURCE: "auto",

  // How the "For you" slot renders the SP decision: "treatment" drops the
  // hydrated card in whole; "fields" paints the native hero from fields.
  RENDER_MODE: "fields",

  // Catalogue = NRMA member reward lines. One membership, many benefits —
  // fuel, EV charging, NRMA Parks, dining and travel. Browsing a line sends a
  // Product Browse engagement event (SP re-shapes in session).
  CATALOG: {
    fuel: {
      id: "PROD_FUEL", category: "CAT_FUEL", label: "Fuel Price Finder + Ampol",
      sub: "Live fuel prices + Ampol", price: "Up to 13c/L off",
      img: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?w=600&q=80&auto=format&fit=crop"
    },
    ev: {
      id: "PROD_EV", category: "CAT_EV", label: "EV Charging — Chargefox",
      sub: "Fast-charging along your route", price: "10% off charging",
      img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80&auto=format&fit=crop"
    },
    parks: {
      id: "PROD_PARKS", category: "CAT_PARKS", label: "NRMA Parks",
      sub: "Parks and Resorts, member rates", price: "Stay 4, pay 3",
      img: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600&q=80&auto=format&fit=crop"
    },
    dining: {
      id: "PROD_DINING", category: "CAT_DINING", label: "Dining Rewards",
      sub: "Cafés and restaurants", price: "Up to 25% off",
      img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80&auto=format&fit=crop"
    },
    travel: {
      id: "PROD_TRAVEL", category: "CAT_TRAVEL", label: "Travel — SIXT & Insurance",
      sub: "Car hire + travel insurance", price: "20% off SIXT",
      img: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80&auto=format&fit=crop"
    }
  }
};
