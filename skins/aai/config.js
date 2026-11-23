/* ─────────────────────────────────────────────────────────────────────────
 * AA Insurance (NZ) app — demo config (car, contents, home and travel cover,
 * AA Insurance Rewards, renewals and claim care, served into the app).
 *
 * This is the ONE file you edit to flip the app from local mock to live SP.
 * MOCK_MODE false loads the Data 360 Web SDK beacon and lets Salesforce
 * Personalization serve the DH decision into the "For you" hero.
 *
 * Switch skins with ./skins/use-skin.sh <name> (see skins/README.md). The
 * Westpac skin is kept in skins/westpac/, NRMA in skins/nrma/.
 * ───────────────────────────────────────────────────────────────────────── */
window.DEMO_CONFIG = {
  MOCK_MODE: false,

  // Shown in the header / footer. Pure cosmetics.
  BRAND: "AA Insurance",

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
  //                 FALLBACK_OFFER). Guaranteed-clean AAI mock-up, no
  //                 Data Cloud dependency.
  //   "auto"     -> prefer the live SP decision, but only accept it when the
  //                 served offer is a known AAI offer (AA_ code / brand
  //                 token); else show the local one. Safe AND live.
  //   "live"     -> trust whatever SP serves, no AAI guard.
  HERO_SOURCE: "auto",

  // How the "For you" slot renders the SP decision: "treatment" drops the
  // hydrated card in whole; "fields" paints the native hero from fields.
  RENDER_MODE: "fields",

  // Catalogue = AA Insurance product lines. Browsing a line sends a Product
  // Browse engagement event (SP re-shapes in session).
  CATALOG: {
    car: {
      id: "PROD_CAR", category: "CAT_CAR", label: "Car insurance",
      sub: "Agreed value cover and a lifetime repair guarantee", price: "Get a quote",
      img: "https://www.aainsurance.co.nz/i/880x580-px-AAI_website_tile_Young_Drivers_Road_Ready.jpg?xid=70piar1ns1oi|EkvP2bC0VNI9DaToyANWW|ca2fba511230779377302cec2661458b&w=600&q=70"
    },
    contents: {
      id: "PROD_CONTENTS", category: "CAT_CONTENTS", label: "Contents and renters",
      sub: "Your laptop and phone, covered anywhere in NZ", price: "From $4 a week",
      img: "https://www.aainsurance.co.nz/i/3W3A9137_800x600.jpg?xid=70piar1ns1oi|5VMOejO58vlZqJdWZM8OqI|5797f8f36c2f4c2ac9d18f8da0378ee9&w=600&q=70"
    },
    home: {
      id: "PROD_HOME", category: "CAT_HOME", label: "Home insurance",
      sub: "Cover for the place you call home", price: "Get a quote",
      img: "https://www.aainsurance.co.nz/i/Own_the_Home_Hero_Homepage_900x720.png?xid=70piar1ns1oi|76EaRZqLrvP2Iz8CgJenH3|f5383a0ec22501aa3a3a2335f74acd1b&w=600&q=70"
    },
    travel: {
      id: "PROD_TRAVEL", category: "CAT_TRAVEL", label: "Travel insurance",
      sub: "10% off for AA Insurance Rewards members", price: "Get a quote",
      img: "https://www.aainsurance.co.nz/i/Get_you_sorted_768w.png?xid=70piar1ns1oi|3n7fNcUdAq7VB1rSEK1YCS|5132ee9875615307f86c6e22c3beae0f&w=600&q=70"
    },
    claims: {
      id: "PROD_CLAIMS", category: "CAT_CLAIMS", label: "Claims and help",
      sub: "A real person, any time you need one", price: "0800 500 213",
      img: "https://www.aainsurance.co.nz/i/Car_pickup_768w.png?xid=70piar1ns1oi|4VhkCWjAyhSkpa6pHMsG2F|dbb8af19df6e50a7d618d98ec0f9ac65&w=600&q=70"
    }
  }
};
