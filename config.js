/* ─────────────────────────────────────────────────────────────────────────
 * Fitness First app — demo config (FLG / Fitness Lifestyle Group).
 *
 * This is the ONE file you edit to flip the app from local mock to live SP.
 * MOCK_MODE false loads the Data 360 Web SDK beacon and lets Salesforce
 * Personalization serve the DH decision into the "For you" hero.
 * ───────────────────────────────────────────────────────────────────────── */
window.DEMO_CONFIG = {
  MOCK_MODE: false,

  // Shown in the header / footer. Pure cosmetics.
  BRAND: "Fitness First",

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

  // Live re-poll interval (ms) for the "For you" slot — see Bupa notes. The
  // flip beat: fire a fresh arbitration -> the new offer swaps into the hero.
  POLL_MS: 4000,

  // Where the logged-in "For you" hero sources its offer:
  //   "fallback" -> ALWAYS render the local per-persona home offer (app.js
  //                 FALLBACK_OFFER). Guaranteed-clean Fitness First mock-up, no
  //                 Data Cloud dependency. Use while the item graph is mid-
  //                 refresh / propagation is lagging (current default).
  //   "auto"     -> prefer the live SP decision, but only accept it when the
  //                 served OfferId is a known FLG offer; else show the local one.
  //   "live"     -> trust whatever SP serves (needed for the live web-flip beat
  //                 once the DC item graph is refreshed).
  HERO_SOURCE: "auto",

  // How the "For you" slot renders the SP decision: "treatment" drops the
  // hydrated card in whole; "fields" paints the native hero from fields.
  RENDER_MODE: "fields",

  // Catalogue = the FLG family of brands. Hero brand Fitness First plus the
  // sister clubs — this is the "one group, many brands" portfolio. Browsing a
  // brand sends a Product Browse engagement event (SP re-shapes in session).
  CATALOG: {
    fitnessfirst: {
      id: "PROD_FITNESSFIRST", category: "CAT_FITNESSFIRST", label: "Fitness First",
      sub: "Premium clubs · Black Label studios", price: "from $18/wk",
      img: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80&auto=format&fit=crop"
    },
    goodlife: {
      id: "PROD_GOODLIFE", category: "CAT_GOODLIFE", label: "Goodlife Health Clubs",
      sub: "Full-service family clubs", price: "from $14/wk",
      img: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80&auto=format&fit=crop"
    },
    jetts: {
      id: "PROD_JETTS", category: "CAT_JETTS", label: "Jetts Fitness",
      sub: "24/7 access · no lock-in", price: "from $11/wk",
      img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80&auto=format&fit=crop"
    },
    zap: {
      id: "PROD_ZAP", category: "CAT_ZAP", label: "Zap Fitness",
      sub: "24/7 everyday value", price: "from $9/wk",
      img: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&q=80&auto=format&fit=crop"
    },
    barrys: {
      id: "PROD_BARRYS", category: "CAT_BARRYS", label: "Barry's",
      sub: "Boutique Red Room HIIT", price: "from $35/class",
      img: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80&auto=format&fit=crop"
    }
  }
};
