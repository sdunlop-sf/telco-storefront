/* ─────────────────────────────────────────────────────────────────────────
 * Suncorp app — demo config (Suncorp general insurer: home, contents, car,
 * CTP, plus roadside assist and multi-policy bundles).
 *
 * This is the ONE file you edit to flip the app from local mock to live SP.
 * MOCK_MODE false loads the Data 360 Web SDK beacon and lets Salesforce
 * Personalization serve the DH decision into the "For you" hero.
 * ───────────────────────────────────────────────────────────────────────── */
window.DEMO_CONFIG = {
  MOCK_MODE: false,

  // Shown in the header / footer. Pure cosmetics.
  BRAND: "Suncorp",

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
  //                 FALLBACK_OFFER). Guaranteed-clean Suncorp mock-up, no
  //                 Data Cloud dependency.
  //   "auto"     -> prefer the live SP decision, but only accept it when the
  //                 served offer is a known Suncorp offer (brand token); else
  //                 show the local one. Safe (never serves a ghost) AND live.
  //   "live"     -> trust whatever SP serves, no Suncorp guard.
  HERO_SOURCE: "auto",

  // How the "For you" slot renders the SP decision: "treatment" drops the
  // hydrated card in whole; "fields" paints the native hero from fields.
  RENDER_MODE: "fields",

  // Catalogue = Suncorp's general-insurance lines. One insurer, many policies —
  // home, contents, car and CTP plus travel. Browsing a line sends a Product
  // Browse engagement event (SP re-shapes in session).
  CATALOG: {
    home: {
      id: "PROD_HOME", category: "CAT_HOME", label: "Home Insurance",
      sub: "Building + contents cover", price: "get a quote",
      img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80&auto=format&fit=crop"
    },
    contents: {
      id: "PROD_CONTENTS", category: "CAT_CONTENTS", label: "Contents Insurance",
      sub: "Your belongings, protected", price: "get a quote",
      img: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=600&q=80&auto=format&fit=crop"
    },
    car: {
      id: "PROD_CAR", category: "CAT_CAR", label: "Car Insurance",
      sub: "Comprehensive + roadside", price: "get a quote",
      img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80&auto=format&fit=crop"
    },
    ctp: {
      id: "PROD_CTP", category: "CAT_CTP", label: "CTP Insurance",
      sub: "Compulsory third party (QLD)", price: "get a quote",
      img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80&auto=format&fit=crop"
    },
    travel: {
      id: "PROD_TRAVEL", category: "CAT_TRAVEL", label: "Travel Insurance",
      sub: "Domestic + international trips", price: "get a quote",
      img: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80&auto=format&fit=crop"
    }
  }
};
