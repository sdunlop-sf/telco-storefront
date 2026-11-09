/* ─────────────────────────────────────────────────────────────────────────
 * Westpac app — demo config (B2C lifecycle banking: onboarding, cards,
 * savings, home-loan retention and hardship support, served into the app).
 *
 * This is the ONE file you edit to flip the app from local mock to live SP.
 * MOCK_MODE false loads the Data 360 Web SDK beacon and lets Salesforce
 * Personalization serve the DH decision into the "For you" hero.
 *
 * Previous skin (NRMA) is kept in skins/nrma/ — copy those four files back
 * over the root ones to restore it.
 * ───────────────────────────────────────────────────────────────────────── */
window.DEMO_CONFIG = {
  MOCK_MODE: false,

  // Shown in the header / footer. Pure cosmetics.
  BRAND: "Westpac",

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
  //                 FALLBACK_OFFER). Guaranteed-clean Westpac mock-up, no
  //                 Data Cloud dependency.
  //   "auto"     -> prefer the live SP decision, but only accept it when the
  //                 served offer is a known Westpac offer (WB_ code / brand
  //                 token); else show the local one. Safe AND live.
  //   "live"     -> trust whatever SP serves, no Westpac guard.
  HERO_SOURCE: "auto",

  // How the "For you" slot renders the SP decision: "treatment" drops the
  // hydrated card in whole; "fields" paints the native hero from fields.
  RENDER_MODE: "fields",

  // Catalogue = Westpac product lines. Browsing a line sends a Product Browse
  // engagement event (SP re-shapes in session).
  CATALOG: {
    savings: {
      id: "PROD_SAVINGS", category: "CAT_SAVINGS", label: "Savings accounts",
      sub: "Set a goal, watch it grow", price: "Open in minutes",
      img: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&q=80&auto=format&fit=crop"
    },
    cards: {
      id: "PROD_CARDS", category: "CAT_CARDS", label: "Credit cards",
      sub: "Low-rate and rewards options", price: "Compare cards",
      img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80&auto=format&fit=crop"
    },
    homeloans: {
      id: "PROD_HOMELOANS", category: "CAT_HOMELOANS", label: "Home loans",
      sub: "Fixed, variable or split", price: "Talk to a specialist",
      img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80&auto=format&fit=crop"
    },
    insurance: {
      id: "PROD_INSURANCE", category: "CAT_INSURANCE", label: "Insurance",
      sub: "Home, contents and car", price: "Get a quote",
      img: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=600&q=80&auto=format&fit=crop"
    },
    help: {
      id: "PROD_HELP", category: "CAT_HELP", label: "Financial support",
      sub: "Help when things get tough", price: "Talk to us",
      img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80&auto=format&fit=crop"
    }
  }
};
