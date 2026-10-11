/* ─────────────────────────────────────────────────────────────────────────
 * Data 360 Website connector sitemap for the Telco storefront.
 *
 * Upload under: Data Cloud Setup > Websites & Mobile Apps > <connection> >
 *               Sitemap > Upload Sitemap.
 *
 * Captures:
 *   - identity (setAnonymousId from the storefront persona switcher)
 *   - product views as Product Browse Engagement, carrying productCategory
 *     (the attribute the "Active browser" recommender overlays on)
 *
 * This mirrors the events app.js sends, so live mode works without edits.
 * ───────────────────────────────────────────────────────────────────────── */
function initSalesforceInteractions() {
  SalesforceInteractions.init({
    consents: [
      { provider: "Telco Storefront", purpose: "Tracking", status: SalesforceInteractions.ConsentStatus.OptIn }
    ],
    cookieDomain: window.location.hostname
  }).then(() => {
    SalesforceInteractions.initSitemap({
      global: {
        onActionEvent: (actionEvent) => {
          // Pass through productCategory so the recommender can read it.
          return actionEvent;
        }
      },
      pageTypes: [
        {
          name: "home",
          isMatch: () => true,
          interaction: {
            name: SalesforceInteractions.CatalogObjectInteractionName.ViewCatalogObject
          }
        }
      ]
    });
  });
}

if (window.SalesforceInteractions) {
  initSalesforceInteractions();
} else {
  window.addEventListener("sfinteractionsReady", initSalesforceInteractions);
}
