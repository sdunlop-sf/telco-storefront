/* ─────────────────────────────────────────────────────────────────────────
 * Covera app — demo config (Covera general insurer: home, contents, motor).
 *
 * This is the ONE file you edit to flip the app from local mock to live SP.
 * MOCK_MODE false loads the Data 360 Web SDK beacon and lets Salesforce
 * Personalization serve the DH decision into the "For you" hero.
 * ───────────────────────────────────────────────────────────────────────── */
window.DEMO_CONFIG = {
  MOCK_MODE: false,

  // Shown in the header / footer. Pure cosmetics.
  BRAND: "Covera",

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
  //                 FALLBACK_OFFER). Guaranteed-clean Covera mock-up, no
  //                 Data Cloud dependency.
  //   "auto"     -> prefer the live SP decision, but only accept it when the
  //                 served offer is a known Covera offer (brand token); else
  //                 show the local one. Safe (never serves a ghost) AND live.
  //   "live"     -> trust whatever SP serves, no Covera guard.
  HERO_SOURCE: "auto",

  // How the "For you" slot renders the SP decision: "treatment" drops the
  // hydrated card in whole; "fields" paints the native hero from fields.
  RENDER_MODE: "fields",

  // Catalogue = Covera's consumer insurance lines. One insurer, many covers —
  // home, contents, motor plus landlord and travel. Browsing a cover sends a
  // Product Browse engagement event (SP re-shapes in session).
  CATALOG: {
    home: {
      id: "PROD_HOME", category: "CAT_HOME", label: "Home Insurance",
      sub: "Building + rebuild cover", price: "get a quote",
      img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80&auto=format&fit=crop"
    },
    contents: {
      id: "PROD_CONTENTS", category: "CAT_CONTENTS", label: "Contents Insurance",
      sub: "Belongings + valuables", price: "get a quote",
      img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80&auto=format&fit=crop"
    },
    motor: {
      id: "PROD_MOTOR", category: "CAT_MOTOR", label: "Car Insurance",
      sub: "Comprehensive + third party", price: "get a quote",
      img: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80&auto=format&fit=crop"
    },
    landlord: {
      id: "PROD_LANDLORD", category: "CAT_LANDLORD", label: "Landlord Insurance",
      sub: "Rental property + loss of rent", price: "get a quote",
      img: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=600&q=80&auto=format&fit=crop"
    },
    travel: {
      id: "PROD_TRAVEL", category: "CAT_TRAVEL", label: "Travel Insurance",
      sub: "Domestic + international", price: "get a quote",
      img: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80&auto=format&fit=crop"
    }
  }
};
