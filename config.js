/* ─────────────────────────────────────────────────────────────────────────
 * Medibank app — demo config (Medibank private health insurer: hospital,
 * extras, combined; ambulance, overseas, Live Better).
 *
 * This is the ONE file you edit to flip the app from local mock to live SP.
 * MOCK_MODE false loads the Data 360 Web SDK beacon and lets Salesforce
 * Personalization serve the DH decision into the "For you" hero.
 * ───────────────────────────────────────────────────────────────────────── */
window.DEMO_CONFIG = {
  MOCK_MODE: false,

  // Shown in the header / footer. Pure cosmetics.
  BRAND: "Medibank",

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
  //                 FALLBACK_OFFER). Guaranteed-clean Medibank mock-up, no
  //                 Data Cloud dependency.
  //   "auto"     -> prefer the live SP decision, but only accept it when the
  //                 served offer is a known Medibank offer (brand token); else
  //                 show the local one. Safe (never serves a ghost) AND live.
  //   "live"     -> trust whatever SP serves, no Medibank guard.
  HERO_SOURCE: "auto",

  // How the "For you" slot renders the SP decision: "treatment" drops the
  // hydrated card in whole; "fields" paints the native hero from fields.
  RENDER_MODE: "fields",

  // Catalogue = Medibank's consumer health cover lines. One fund, many covers —
  // hospital, extras and combined plus ambulance and overseas. Browsing a cover
  // sends a Product Browse engagement event (SP re-shapes in session).
  CATALOG: {
    hospital: {
      id: "PROD_HOSPITAL", category: "CAT_HOSPITAL", label: "Hospital Cover",
      sub: "Private room + choice of doctor", price: "get a quote",
      img: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600&q=80&auto=format&fit=crop"
    },
    extras: {
      id: "PROD_EXTRAS", category: "CAT_EXTRAS", label: "Extras Cover",
      sub: "Dental + optical + physio", price: "get a quote",
      img: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=600&q=80&auto=format&fit=crop"
    },
    combined: {
      id: "PROD_COMBINED", category: "CAT_COMBINED", label: "Combined Cover",
      sub: "Hospital + extras in one", price: "get a quote",
      img: "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=600&q=80&auto=format&fit=crop"
    },
    ambulance: {
      id: "PROD_AMBULANCE", category: "CAT_AMBULANCE", label: "Ambulance Cover",
      sub: "Emergency transport cover", price: "get a quote",
      img: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=600&q=80&auto=format&fit=crop"
    },
    overseas: {
      id: "PROD_OVERSEAS", category: "CAT_OVERSEAS", label: "Overseas Cover",
      sub: "Visitors + students (OVHC / OSHC)", price: "get a quote",
      img: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80&auto=format&fit=crop"
    }
  }
};
