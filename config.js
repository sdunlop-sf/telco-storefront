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
  BRAND: "nova",

  // Beacon from the 4b "nova Storefront" Website connector.
  BEACON_URL: "https://cdn.c360a.salesforce.com/beacon/c360a/5e39738b-7dd0-46b3-b82d-10a7983da2fd/scripts/c360a.min.js",

  // API name of the SP personalization point that serves the storefront slot.
  // Generic on purpose — ONE point serves every demo vertical. The per-person
  // OfferId match in the recommender keeps demos isolated, so this never changes.
  PERSONALIZATION_POINT: "Decision_Offer_Personalisation",

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
    phone: {
      id: "PROD_PHONE", category: "CAT_DEVICES", label: "Aurora 5G",
      sub: "128GB · Midnight", price: "$0 upfront · $54/mo",
      img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80&auto=format&fit=crop"
    },
    plan: {
      id: "PROD_PLAN", category: "CAT_PLANS", label: "Unlimited mobile",
      sub: "Endless 5G data", price: "$45/mo",
      img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80&auto=format&fit=crop"
    },
    internet: {
      id: "PROD_INTERNET", category: "CAT_INTERNET", label: "Home internet nbn",
      sub: "Fast 100 · no lock-in", price: "$69/mo",
      img: "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&q=80&auto=format&fit=crop"
    },
    stream: {
      id: "PROD_STREAM", category: "CAT_PERKS", label: "nova perks",
      sub: "Streaming & more", price: "Included",
      img: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80&auto=format&fit=crop"
    }
  }
};
