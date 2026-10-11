/* ─────────────────────────────────────────────────────────────────────────
 * nova. storefront — personalization logic.
 *
 * Architecture this site demonstrates (the realistic combo):
 *   DH (outbound)  : arbitrates per individual under contact policy / cross-
 *                    domain rules, writes the winning offer into Data 360.
 *                    -> this is the FRAME the visitor inherits on arrival, and
 *                       it is the SAME creative the outbound channel (email)
 *                       already delivered. Inbound == outbound.
 *   SP (inbound)   : serves that frame instantly, then RE-SHAPES it live as
 *                    in-session browse context changes (category being viewed).
 *
 * The OFFERS map below is aligned WORD-FOR-WORD to the real Web-channel Offer
 * Treatments on 4b (NBA Testing Org), so mock == live == the outbound creative.
 *
 * MOCK_MODE simulates both halves locally so the shell is demoable with no org.
 * Live mode defers the decision to Salesforce Personalization via the Web SDK.
 * ───────────────────────────────────────────────────────────────────────── */
(function () {
  const cfg = window.DEMO_CONFIG;
  const IMG = (slug) => `https://images.unsplash.com/${slug}?w=1000&q=80&auto=format&fit=crop`;

  // Real 4b Web-channel Offer Treatments (OfferCode -> outbound creative).
  // Copy mirrors OfferHeading / OfferBody / CallToActionText / ImageUrl on 4b.
  const OFFERS = {
    OFFTCPERK1: {
      heading: "A streaming pass, included this month",
      body: "A little extra for being with us — this month a streaming pass comes included with your plan, and anything you watch won't use your data. Just switch it on in the app.",
      cta: "Turn it on", img: IMG("photo-1512290923902-8a9f81dc236c")
    },
    OFFTCPERK2: {
      heading: "Unlimited data, every weekend this month",
      body: "Your weekends just got bigger — for the rest of this month you have unlimited data every Saturday and Sunday at no extra charge. It's already on, nothing to activate.",
      cta: "See the details", img: IMG("photo-1600880292203-757bb62b4baf")
    },
    OFFTCPERK3: {
      heading: "Three months of device protection, on us",
      body: "Peace of mind on us — three months of device protection against cracks and spills, free. If your screen breaks in that time we'll sort the repair, no excess.",
      cta: "Add protection", img: IMG("photo-1518199266791-5375a83190b7")
    },
    OFFTCEARN: {
      heading: "One bill for mobile and home internet, and you save",
      body: "A simple way to spend less each month — add NBN home internet to your mobile plan and we take $15 a month off the bundle. Same fast network, one bill, and you keep your current plan exactly as it is.",
      cta: "Check my address", img: IMG("photo-1522199755839-a2bacb67c546")
    },
    OFFTCYEARN: {
      heading: "You are closer to our top tier than you think",
      body: "You're just one step from our Platinum loyalty tier — priority support, early access to deals, and a loyalty credit every year you stay. You could get there this month without spending a dollar more.",
      cta: "Show me how", img: IMG("photo-1543269865-cbf427effbad")
    },
    OFFTCSAVE: {
      heading: "We would really like to keep you with us",
      body: "You've been with us a while, and we don't want price to be the reason you leave. Here's a loyalty credit of $20 a month for the next 12 months, applied right now, and a specialist call-back today.",
      cta: "Apply my loyalty credit", img: IMG("photo-1573497491208-6b1acb260507")
    },
    OFFTCBURN: {
      heading: "Your upgrade is ready when you are",
      body: "Your current handset is coming to the end of its life and you're now eligible to upgrade. Trade it in and we'll put the credit straight onto a new device, with nothing to pay today.",
      cta: "See my upgrade", img: IMG("photo-1494790108377-be9c29b29330")
    },
    OFFTCPRO: {
      heading: "5G Business Pro, for business accounts",
      body: "Our top business plan — priority network access, a dedicated account manager, and pooled data across your team. Reserved for registered business accounts.",
      cta: "View Business Pro", img: IMG("photo-1454165804606-c3d57bc86b40")
    }
  };

  // Personas = different DH outbound FRAMES (what DH decided for this individual,
  // and already sent them outbound). Daniel Ross is a real 4b Contact whose live
  // decision resolves to OFFTCPERK1; the rest are illustrative frames.
  const PERSONAS = [
    { id: "003Kh00001uii5mIAA", name: "Daniel Ross",  tag: "Loyalty",      frame: "OFFTCPERK1" },
    { id: "p-retention",        name: "Marcus Reid",  tag: "At-risk",      frame: "OFFTCSAVE"  },
    { id: "p-tier",             name: "Priya Nair",   tag: "Near-tier",    frame: "OFFTCYEARN" },
    { id: "p-upgrade",          name: "Sam Okafor",   tag: "Upgrade-ready", frame: "OFFTCBURN" }
  ];

  // Inbound overlay: category being browsed -> how SP re-shapes within the frame.
  const CATEGORY_OVERLAY = {
    CAT_INTERNET: "OFFTCEARN",   // viewing home internet -> bundle offer
    CAT_DEVICES:  "OFFTCBURN",   // viewing phones        -> upgrade offer
    CAT_PERKS:    "OFFTCPERK2",  // viewing perks         -> perk offer
    CAT_PLANS:    null           // viewing plans         -> keep DH frame
  };

  const CAT_LABEL = {
    CAT_DEVICES: "Devices", CAT_PLANS: "Plans",
    CAT_INTERNET: "Home internet", CAT_PERKS: "Perks"
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
    const art = document.getElementById("offer-art");
    art.style.backgroundImage =
      `linear-gradient(120deg, rgba(8,14,26,.45), rgba(8,14,26,.05)), url('${o.img}')`;
    state.lastDecision = { offerCode, source, individualId: state.individualId || "anonymous", channel: cfg.CHANNEL, ts: new Date().toISOString() };
    document.getElementById("decision-json").textContent =
      JSON.stringify(state.lastDecision, null, 2);
  }

  function decideMock(category) {
    // SP inherits DH's frame, then overlays inbound context if present.
    const overlay = category ? CATEGORY_OVERLAY[category] : null;
    if (overlay) return render(overlay, `SP · inbound overlay (DH frame: ${state.frame})`);
    return render(state.frame, "DH outbound frame · served by SP");
  }

  /* ---------- browse (shared by catalog cards + nav) ---------- */
  function highlight(category) {
    document.querySelectorAll(".product").forEach(n =>
      n.classList.toggle("viewed", n.dataset.cat === category));
    document.querySelectorAll("nav a[data-cat]").forEach(n =>
      n.classList.toggle("active", n.dataset.cat === category));
  }
  function browse(product) {
    state.lastCategory = product.category;
    highlight(product.category);
    onBrowse(product, cat => decideMock(cat));
  }

  /* ---------- catalog ---------- */
  function buildCatalog() {
    const grid = document.getElementById("catalog");
    Object.values(cfg.CATALOG).forEach(p => {
      const el = document.createElement("article");
      el.className = "product";
      el.dataset.cat = p.category;
      el.innerHTML = `
        <div class="ph" style="background-image:url('${p.img}')"></div>
        <div class="meta">
          <div class="chip">${CAT_LABEL[p.category] || p.category}</div>
          <div class="name">${p.label}</div>
          <div class="sub">${p.sub || ""}</div>
          <div class="price">${p.price || ""}</div>
        </div>`;
      el.onclick = () => browse(p);
      grid.appendChild(el);
    });
  }

  /* ---------- nav (browse by category) ---------- */
  function wireNav() {
    document.querySelectorAll("nav a[data-cat]").forEach(a => {
      a.onclick = (e) => {
        e.preventDefault();
        const cat = a.dataset.cat;
        // find a representative product for this category so live events resolve
        const p = Object.values(cfg.CATALOG).find(x => x.category === cat)
                  || { id: "PROD_" + cat, category: cat, label: a.textContent };
        browse(p);
      };
    });
  }

  /* ---------- identity ---------- */
  function buildIdentity() {
    const sel = document.getElementById("who");
    PERSONAS.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id; opt.dataset.frame = p.frame;
      opt.textContent = `${p.name} · ${p.tag}`;
      sel.appendChild(opt);
    });
    sel.onchange = () => {
      const opt = sel.selectedOptions[0];
      state.individualId = sel.value;
      state.frame = opt && opt.dataset.frame ? opt.dataset.frame : "OFFTCPERK1";
      state.lastCategory = null;
      highlight(null);
      setIdentity(state.individualId);
      decideMock(null); // fresh arrival = inherit DH outbound frame
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
          catalogObject: {
            type: "Product", id: product.id,
            attributes: { productCategory: product.category, category: "Engagement" }
          }
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
      console.log("[nova] beacon loaded; personalization point:", cfg.PERSONALIZATION_POINT);
    };
    document.head.appendChild(s);
  }

  /* ---------- boot ---------- */
  function boot() {
    const pill = document.getElementById("mode-pill");
    if (cfg.BRAND) document.querySelectorAll("[data-brand]").forEach(n => n.firstChild.textContent = cfg.BRAND);
    buildIdentity();
    buildCatalog();
    wireNav();
    if (cfg.MOCK_MODE || !cfg.BEACON_URL) {
      pill.textContent = "MOCK"; pill.className = "pill mock";
      decideMock(null);
    } else {
      pill.textContent = "LIVE · Salesforce Personalization"; pill.className = "pill live";
      initLive();
      decideMock(null); // placeholder until first SP decision returns
    }
  }
  document.addEventListener("DOMContentLoaded", boot);
})();
