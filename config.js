/* ─────────────────────────────────────────────────────────────────────────
 * My NRMA app — demo config (NRMA motoring club).
 *
 * This is the ONE file you edit to flip the app from local mock to live SP.
 * MOCK_MODE false loads the Data 360 Web SDK beacon and lets Salesforce
 * Personalization serve the DH decision into the "For you" hero.
 * ───────────────────────────────────────────────────────────────────────── */
window.DEMO_CONFIG = {
  MOCK_MODE: false,

  // Shown in the header / footer. Pure cosmetics.
  BRAND: "My NRMA",

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
  //                 served offer is a known NRMA offer (brand token); else show
  //                 the local one. Safe (never serves a ghost) AND live.
  //   "live"     -> trust whatever SP serves, no NRMA guard.
  HERO_SOURCE: "auto",

  // How the "For you" slot renders the SP decision: "treatment" drops the
  // hydrated card in whole; "fields" paints the native hero from fields.
  RENDER_MODE: "fields",

  // Catalogue = the NRMA family of brands. Hero brand My NRMA Roadside plus the
  // sister businesses — this is the "one group, many brands" portfolio. Browsing
  // a brand sends a Product Browse engagement event (SP re-shapes in session).
  CATALOG: {
    roadside: {
      id: "PROD_ROADSIDE", category: "CAT_ROADSIDE", label: "My NRMA Roadside",
      sub: "Everyday · Complete · Ultimate Care", price: "from $8/mo",
      img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80&auto=format&fit=crop"
    },
    insurance: {
      id: "PROD_INSURANCE", category: "CAT_INSURANCE", label: "NRMA Insurance",
      sub: "Car · home · travel", price: "get a quote",
      img: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80&auto=format&fit=crop"
    },
    energy: {
      id: "PROD_ENERGY", category: "CAT_ENERGY", label: "NRMA Energy",
      sub: "Home electricity + EV plans", price: "compare plans",
      img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80&auto=format&fit=crop"
    },
    parks: {
      id: "PROD_PARKS", category: "CAT_PARKS", label: "NRMA Parks + Resorts",
      sub: "Holiday parks Australia-wide", price: "book a stay",
      img: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=600&q=80&auto=format&fit=crop"
    },
    thrifty: {
      id: "PROD_THRIFTY", category: "CAT_THRIFTY", label: "Thrifty Car Rental",
      sub: "Cars + commercials", price: "from $45/day",
      img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80&auto=format&fit=crop"
    }
  }
};
