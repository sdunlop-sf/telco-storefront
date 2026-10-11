/* ─────────────────────────────────────────────────────────────────────────
 * Telco storefront — personalization logic.
 *
 * Architecture this site demonstrates (the realistic combo):
 *   DH (outbound)  : arbitrates per individual under contact policy / cross-
 *                    domain rules, writes the winning offer into Data 360.
 *                    -> this is the FRAME the visitor inherits on arrival.
 *   SP (inbound)   : serves that frame instantly, then RE-SHAPES it live as
 *                    in-session browse context changes (category being viewed).
 *
 * MOCK_MODE simulates both halves locally so the shell is demoable with no org.
 * Live mode defers the decision to Salesforce Personalization via the Web SDK.
 * ───────────────────────────────────────────────────────────────────────── */
(function () {
  const cfg = window.DEMO_CONFIG;

  // Real 4b Web-channel Offer Treatments (OfferCode -> content). Keep in sync
  // with the Offer Treatments on NBA Testing Org so mock == live content.
  const OFFERS = {
    OFFTCPERK1: { heading: "A streaming pass, included this month", body: "Your loyalty perk this cycle: a streaming pass on us. No extra charge, nothing to activate.", cta: "Claim perk", art: "#1f6feb" },
    OFFTCPERK2: { heading: "Unlimited data, every weekend this month", body: "This month's perk — unlimited weekend data, automatically applied to your plan.", cta: "Turn it on", art: "#8957e5" },
    OFFTCPERK3: { heading: "Three months of device protection, on us", body: "A thank-you perk: device protection free for three months. Covered from today.", cta: "Add cover", art: "#1b7f5c" },
    OFFTCEARN:  { heading: "One bill for mobile and home internet, and you save", body: "Bring your home internet to Telco and we'll put it on one bill — and knock the price down.", cta: "See the bundle", art: "#0a84ff" },
    OFFTCYEARN: { heading: "You are closer to our top tier than you think", body: "A little more activity this quarter and you reach our top loyalty tier. Here's how.", cta: "View tier", art: "#b8860b" },
    OFFTCSAVE:  { heading: "We would really like to keep you with us", body: "Thanks for being with Telco. Here is a saved price locked in for the next 12 months.", cta: "Keep my plan", art: "#c0392b" },
    OFFTCBURN:  { heading: "Your upgrade is ready when you are", body: "You're eligible to upgrade to the new Aurora 5G now, with nothing to pay today.", cta: "Upgrade now", art: "#2d3436" },
    OFFTCPRO:   { heading: "5G Business Pro, for business accounts", body: "Dedicated 5G, priority support and pooled data built for your team.", cta: "Explore Pro", art: "#34495e" }
  };

  // Personas = different DH outbound FRAMES (what DH decided for this individual).
  const PERSONAS = [
    { id: "003Kh00001uii5mIAA", name: "Daniel Ross (loyalty)",   frame: "OFFTCPERK1" },
    { id: "p-retention",        name: "Marcus Reid (at risk)",   frame: "OFFTCSAVE"  },
    { id: "p-tier",             name: "Priya Nair (near tier)",  frame: "OFFTCYEARN" },
    { id: "p-upgrade",          name: "Sam Okafor (eligible)",   frame: "OFFTCBURN"  }
  ];

  // Inbound overlay: category being browsed -> how SP re-shapes within the frame.
  const CATEGORY_OVERLAY = {
    CAT_INTERNET: "OFFTCEARN",   // viewing home internet -> bundle offer
    CAT_DEVICES:  "OFFTCBURN",   // viewing phones        -> upgrade offer
    CAT_PERKS:    "OFFTCPERK2",  // viewing perks         -> perk offer
    CAT_PLANS:    null           // viewing plans         -> keep DH frame
  };

  let state = { individualId: "", frame: "OFFTCPERK1", lastCategory: null, lastDecision: null };

  /* ---------- rendering ---------- */
  function render(offerCode, source) {
    const o = OFFERS[offerCode] || OFFERS.OFFTCPERK1;
    document.getElementById("offer-heading").textContent = o.heading;
    document.getElementById("offer-body").textContent = o.body;
    document.getElementById("offer-cta").textContent = o.cta;
    document.getElementById("offer-code").textContent = offerCode;
    document.getElementById("offer-source").textContent = source;
    document.getElementById("offer-art").style.background =
      `linear-gradient(135deg, ${o.art}, ${o.art}cc)`;
    state.lastDecision = { offerCode, source, individualId: state.individualId, channel: cfg.CHANNEL, ts: new Date().toISOString() };
    document.getElementById("decision-json").textContent =
      JSON.stringify(state.lastDecision, null, 2);
  }

  function decideMock(category) {
    // SP inherits DH's frame, then overlays inbound context if present.
    const overlay = category ? CATEGORY_OVERLAY[category] : null;
    if (overlay) return render(overlay, `SP · inbound overlay (DH frame: ${state.frame})`);
    return render(state.frame, "DH outbound frame · served by SP");
  }

  /* ---------- catalog ---------- */
  function buildCatalog() {
    const grid = document.getElementById("catalog");
    const icons = { phone: "📱", plan: "📶", internet: "🏠", stream: "🎬" };
    Object.entries(cfg.CATALOG).forEach(([key, p]) => {
      const el = document.createElement("div");
      el.className = "product";
      el.innerHTML = `<div class="ph">${icons[key] || "🔹"}</div>
        <div class="name">${p.label}</div><div class="cat">${p.category}</div>`;
      el.onclick = () => {
        document.querySelectorAll(".product").forEach(n => n.classList.remove("viewed"));
        el.classList.add("viewed");
        state.lastCategory = p.category;
        onBrowse(p, category => decideMock(category));
      };
      grid.appendChild(el);
    });
  }

  /* ---------- identity ---------- */
  function buildIdentity() {
    const sel = document.getElementById("who");
    PERSONAS.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id; opt.dataset.frame = p.frame; opt.textContent = p.name;
      sel.appendChild(opt);
    });
    sel.onchange = () => {
      const opt = sel.selectedOptions[0];
      state.individualId = sel.value;
      state.frame = opt.dataset.frame || "OFFTCPERK1";
      state.lastCategory = null;
      document.querySelectorAll(".product").forEach(n => n.classList.remove("viewed"));
      setIdentity(state.individualId);
      decideMock(null); // fresh arrival = DH frame
    };
  }

  /* ---------- live vs mock seam ---------- */
  // onBrowse: fire a browse event. Mock calls back immediately; live sends it
  // to Data 360 and lets SP re-decide (the slot updates via the SDK callback).
  function onBrowse(product, cb) {
    if (cfg.MOCK_MODE) return cb(product.category);
    if (window.SalesforceInteractions) {
      SalesforceInteractions.sendEvent({
        interaction: {
          name: "View Catalog Object",
          catalogObject: { type: "Product", id: product.id,
            attributes: { productCategory: product.category, category: "Engagement" } }
        }
      });
      // SP serves the re-decided offer via the personalization point / SDK
      // callback wired in initLive(). We optimistically reflect the overlay too.
      cb(product.category);
    }
  }

  function setIdentity(id) {
    if (cfg.MOCK_MODE) return;
    if (window.SalesforceInteractions && id) SalesforceInteractions.setAnonymousId(id);
  }

  /* ---------- live init (beacon) ---------- */
  function initLive() {
    const s = document.createElement("script");
    s.src = cfg.BEACON_URL; s.async = true;
    s.onload = () => {
      // Hook the SP personalization decision for our point and render it.
      // (Exact SDK personalization API is wired during Phase 2 against the
      //  live personalization point; see runbook.)
      console.log("[telco] beacon loaded; personalization point:", cfg.PERSONALIZATION_POINT);
    };
    document.head.appendChild(s);
  }

  /* ---------- boot ---------- */
  function boot() {
    const pill = document.getElementById("mode-pill");
    buildIdentity();
    buildCatalog();
    if (cfg.MOCK_MODE || !cfg.BEACON_URL) {
      pill.textContent = "MOCK MODE"; pill.className = "pill mock";
      decideMock(null);
    } else {
      pill.textContent = "LIVE · Salesforce Personalization"; pill.className = "pill live";
      initLive();
      decideMock(null); // placeholder until first SP decision returns
    }
  }
  document.addEventListener("DOMContentLoaded", boot);
})();
