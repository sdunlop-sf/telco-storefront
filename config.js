/* ─────────────────────────────────────────────────────────────────────────
 * Telco storefront — demo config.
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
  MOCK_MODE: true,

  // Paste the beacon from the 4b Website connector (looks like:
  // https://cdn.c360a.salesforce.com/beacon/c360a/<id>/scripts/c360a.min.js)
  BEACON_URL: "",

  // API name of the SP personalization point that serves the storefront slot.
  PERSONALIZATION_POINT: "Telco_Offer_Personalisation",

  // Engagement channel passed as dynamic context to the recommender rules.
  CHANNEL: "Web",

  // Product catalog ids used by the browse events. Replace the id values with
  // the real Product / ProductCategory record ids from 4b once wired, so the
  // Product Browse Engagement events resolve against the catalog.
  CATALOG: {
    phone:    { id: "PROD_PHONE",    category: "CAT_DEVICES",  label: "Aurora 5G Phone" },
    plan:     { id: "PROD_PLAN",     category: "CAT_PLANS",    label: "Unlimited Mobile Plan" },
    internet: { id: "PROD_INTERNET", category: "CAT_INTERNET", label: "Home Internet nbn" },
    stream:   { id: "PROD_STREAM",   category: "CAT_PERKS",    label: "Streaming Pass" }
  }
};
