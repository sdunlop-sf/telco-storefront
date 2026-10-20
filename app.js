/* ─────────────────────────────────────────────────────────────────────────
 * Storefront — personalization logic (vertical-agnostic harness).
 *
 * Architecture this site demonstrates (the realistic combo):
 *   DH (outbound)  : arbitrates per individual under contact policy / cross-
 *                    domain rules, writes the winning offer into Data 360.
 *                    -> this is the FRAME the visitor inherits on arrival, and
 *                       it is the SAME creative the outbound channel (email)
 *                       already delivered. Inbound == outbound.
 *   SP (inbound)   : serves that frame instantly via a Personalization Point,
 *                    reading the DH decision off the Real-Time profile graph.
 *
 * ZERO per-demo code. This file knows NOTHING about offers, verticals, or
 * creative. The Personalization Point returns the fully-hydrated treatment
 * (heading / body / CTA / image), and we just render whatever comes back.
 * A new demo = publish new Offer Treatments + fire arbitration + swap
 * config.js branding. No edits here, ever.
 *
 * MOCK_MODE renders a neutral placeholder so the shell is demoable with no org.
 * ───────────────────────────────────────────────────────────────────────── */
(function () {
  const cfg = window.DEMO_CONFIG;

  // Personas = identities only (Contact Ids + display labels). No offer
  // knowledge — the decision for each is served live by SP. Swapping personas
  // per demo is a config concern, not a code concern; kept here for the demo
  // switcher convenience only.
  // Covera re-skin: the "account" is now a CUSTOMER PROFILE at Covera — the
  // policies held (home / contents / motor) plus the life-stage signals the
  // engine reads to decide the next best interaction. Each item is a policy /
  // cover line.
  const PERSONAS = [
    { id: "003Kh00001uijWCIAY", name: "Sarah Mitchell", tag: "Homeowner · recently renovated",
      account: {
        since: "Covera customer since 2019", tier: "Home & Motor customer",
        policies: [
          { kind: "Home", label: "Home & Contents · NSW", ref: "Covera",
            premium: "Sum insured $680k", status: "Check recommended" },
          { kind: "Motor", label: "2021 Mazda CX-5", ref: "Comprehensive",
            premium: "$1,180 / yr", status: "Active" }
        ]
      } },
    { id: "003Kh00001uijWDIAY", name: "Daniel Okafor", tag: "Renewal approaching",
      account: {
        since: "Covera customer since 2020", tier: "Home & Motor customer",
        policies: [
          { kind: "Home", label: "Home & Contents · VIC", ref: "Covera",
            renewsInDays: 3, premium: "Renews in 3 days", status: "Due to renew" },
          { kind: "Motor", label: "2016 Toyota Corolla", ref: "Comprehensive",
            premium: "Renews in 3 days", status: "Due to renew" }
        ]
      } },
    { id: "003Kh00001uijWEIAY", name: "Priya Sharma", tag: "Lapsed policy",
      account: {
        since: "Covera customer since 2016", tier: "Former customer",
        policies: [
          { kind: "Home", label: "Home & Contents · QLD", ref: "Covera",
            renewsInDays: 2, premium: "Lapsed 4 weeks ago", status: "Lapsed" }
        ]
      } },
    { id: "003Kh00001uijWFIAY", name: "Tom Bennett", tag: "Motor-only · bundle-ready",
      account: {
        since: "Covera customer since 2014", tier: "Motor-only customer",
        policies: [
          { kind: "Motor", label: "2022 Ford Ranger", ref: "Comprehensive",
            premium: "$1,540 / yr", status: "Active" },
          { kind: "Home", label: "Home & Contents", ref: "Insured elsewhere",
            premium: "Not with Covera", status: "Bundle opportunity" },
          { kind: "Bundle", label: "Multi-policy discount", ref: "Not applied",
            premium: "Combine to save", status: "Available" }
        ]
      } }
  ];

  // Neutral local sample for MOCK_MODE / offline shell. Deliberately generic —
  // no demo-specific offer copy, so this file stays vertical-agnostic.
  const MOCK_ITEM = {
    OfferHeading__c: "Your personalised offer appears here",
    OfferBody__c: "Set <strong>MOCK_MODE: false</strong> in config.js to serve a live decision from Salesforce Personalization.",
    CallToActionText__c: "Shop now",
    CallToActionUrl__c: "#",
    ImageUrl__c: "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=1000&q=80&auto=format&fit=crop",
    OfferId__c: "SAMPLE"
  };

  // Generic, UN-PERSONALISED opening offer shown to an anonymous visitor (no
  // identity selected). This is the "before context" state: a brand/acquisition
  // hero every visitor sees, no account chrome. Picking a customer swaps this
  // for the DH-arbitrated, SP-served personal offer (the inbound-parity beat).
  const GENERIC_OFFER = {
    eyebrow: "Covera",
    heading: "Cover for the things that matter most.",
    body: "Home, contents and car insurance built around your life — <strong>sign in</strong> and your next best move re-shapes to you.",
    cta: "Get a quote",
    url: "#",
    img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1000&q=80&auto=format&fit=crop"
  };

  // Per-persona local offer shown in the logged-in hero when the live SP serve
  // has not resolved yet (fresh identity, item graph mid-refresh, propagation
  // lag). Mirrors each persona's HOME decision so the logged-in page is always a
  // complete Covera mock-up. A live SP decision ALWAYS overrides this — the
  // fallback only fills the gap so the hero never shows an empty "no-decision"
  // state in front of a customer. Keyed by Contact Id. Mirrors each persona's
  // HOME decision so the logged-in page is always a complete Covera mock-up.
  const FALLBACK_OFFER = {
    // Per-persona Covera recommendation, rendered locally (HERO_SOURCE
    // "fallback") so the hero is guaranteed-clean and matches the email creative.
    // (SP's live serve reads from a stale DC item-graph snapshot; until that is
    // refreshed we render the correct creative here rather than serve a ghost.)
    "003Kh00001uijWCIAY": { // Sarah — Engagement / Home Cover Health Check (CV_ENGAGE1)
      eyebrow: "Recommended for you",
      heading: "Is your home covered for today's rebuild cost?",
      body: "Building and contents costs have climbed, and many homes are now insured for less than it would cost to rebuild. Our free <strong>Home Cover Health Check</strong> reviews your sum insured and contents so you're not caught short. Book a time that suits you.",
      cta: "Book my cover check", url: "#",
      img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1000&q=80&auto=format&fit=crop" },
    "003Kh00001uijWDIAY": { // Daniel — Retention / Stay Protected (CV_RETURN1)
      eyebrow: "A note from your Covera team",
      heading: "Let's keep you protected, Daniel",
      body: "Your policy is coming up for renewal and we don't want you left without cover. <strong>Renew in a couple of minutes</strong> so there's no gap in your protection.",
      cta: "Renew my cover", url: "#",
      img: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1000&q=80&auto=format&fit=crop" },
    "003Kh00001uijWEIAY": { // Priya — Retention / win-back (CV_RETURN1 / composition persona)
      eyebrow: "A note from your Covera team",
      heading: "Let's get you protected again, Priya",
      body: "It's been a few weeks since your cover lapsed. No pressure — just a <strong>fresh start</strong> whenever you're ready, so your home is looked after again.",
      cta: "Reactivate my cover", url: "#",
      img: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?w=1000&q=80&auto=format&fit=crop" },
    "003Kh00001uijWFIAY": { // Tom — Upgrade / Home + Motor Bundle (CV_UPGRADE1)
      eyebrow: "Recommended for you",
      heading: "Bring your home and car together and save",
      body: "You're already with us for your car. Add your home and <strong>unlock a multi-policy discount</strong>, one renewal date and one place to manage everything.",
      cta: "See my bundle saving", url: "#",
      img: "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1000&q=80&auto=format&fit=crop" }
  };

  // Accept a live SP decision only when it serves a known Covera offer, so a
  // stale non-Covera serve is ignored and the local home offer shows instead.
  // Offer Ids are regenerated on every rebuild, so acceptance keys on the COVERA
  // BRAND TOKEN carried in the hydrated treatment (the card chip / footer / SMS
  // all say "Covera" / covera.com.au). Core CV_ offers only — A2A offers
  // (OFFCOVERA*) never serve here. Add 15-char Id prefixes to COVERA_OFFER_IDS
  // after a build if you want an exact-Id guard as well.
  const COVERA_OFFER_IDS = new Set([]);
  function isCoveraItem(item) {
    const oid = pick(item, "OfferId__c", "offerId");
    if (oid && COVERA_OFFER_IDS.has(String(oid).substring(0, 15))) return true;
    // Brand-token discriminator (works regardless of offer-Id churn).
    const txt = (pick(item, "TreatmentOutput__c", "treatmentOutput") || "") +
                (pick(item, "OfferBody__c", "offerBody") || "");
    return /covera/i.test(txt);
  }

  const CAT_LABEL = {
    CAT_HOME: "Home Insurance", CAT_CONTENTS: "Contents Insurance",
    CAT_MOTOR: "Car Insurance", CAT_LANDLORD: "Landlord Insurance", CAT_TRAVEL: "Travel Insurance"
  };

  let state = { individualId: "", lastCategory: null, lastDecision: null };
  let pollTimer = null;

  /* ---------- response mapping (vertical-agnostic) ---------- */
  // Pull the first non-empty value across possible field-name casings the SDK
  // might hand back (DMO __c names, camelCase, or plain).
  function pick(item, ...names) {
    for (const n of names) {
      if (item && item[n] != null && item[n] !== "") return item[n];
    }
    return null;
  }
  // The catalog graph carries no standalone image on this org, so extract the
  // <img src> out of the hydrated TreatmentOutput HTML (always present).
  function imageFromTreatment(html) {
    if (!html) return null;
    const m = /<img[^>]+src=["']([^"']+)["']/i.exec(html);
    return m ? m[1] : null;
  }

  /* ---------- rendering ---------- */
  function renderItem(item, source) {
    if (!item) return renderEmpty(source);

    // Default path: drop the fully-hydrated treatment card in whole. It already
    // carries image + heading + body + CTA, identical to the outbound email.
    // Set RENDER_MODE:"fields" in config.js to render into the native hero
    // instead (structured fields; needs an image, see dropInTreatment note).
    const treatment = pick(item, "TreatmentOutput__c", "treatmentOutput");
    if (cfg.RENDER_MODE !== "fields" && treatment) {
      return dropInTreatment(treatment, source, item);
    }

    const heading = pick(item, "OfferHeading__c", "offerHeading", "heading") || "";
    const body    = pick(item, "OfferBody__c", "offerBody", "body") || "";
    const cta     = pick(item, "CallToActionText__c", "callToActionText", "cta") || "Learn more";
    const url     = pick(item, "CallToActionUrl__c", "callToActionUrl") || "#";
    const img     = pick(item, "ImageUrl__c", "imageUrl")
                    || imageFromTreatment(pick(item, "TreatmentOutput__c", "treatmentOutput"));
    const code    = pick(item, "OfferId__c", "OfferTreatmentCode__c", "Id__c") || "—";

    setEyebrow("Recommended for you"); // personalised again (generic reset)
    document.getElementById("offer-heading").textContent = heading;
    document.getElementById("offer-body").innerHTML = body; // body carries <strong>/entities
    const ctaEl = document.getElementById("offer-cta");
    ctaEl.textContent = cta;
    ctaEl.setAttribute("href", url);
    document.getElementById("offer-code").textContent = code;
    document.getElementById("offer-source").textContent = source;

    const art = document.getElementById("offer-art");
    if (img) {
      art.style.backgroundImage =
        `linear-gradient(120deg, rgba(8,14,26,.45), rgba(8,14,26,.05)), url('${img}')`;
    }

    state.lastDecision = {
      offerId: pick(item, "OfferId__c"),
      treatment: pick(item, "Id__c", "OfferTreatmentCode__c"),
      heading, source,
      individualId: state.individualId || "anonymous",
      channel: cfg.CHANNEL, ts: new Date().toISOString()
    };
    document.getElementById("decision-json").textContent =
      JSON.stringify(state.lastDecision, null, 2);
  }

  // Populate the logged-in "Covera" customer summary from the selected persona.
  // Demo dressing only — this is NOT SP/decision data; it just makes the offer
  // land inside a believable account context. Hidden when anonymous.
  function renderAccount(persona) {
    const panel = document.getElementById("account-summary");
    if (!panel) return;
    const a = persona && persona.account;
    if (!a) { panel.hidden = true; return; }

    document.getElementById("acct-avatar").textContent = (persona.name || "s").trim()[0];
    document.getElementById("acct-name").textContent = (persona.name || "").split(" ")[0];
    document.getElementById("acct-since").textContent = a.since || "Welcome back";
    document.getElementById("acct-tier").textContent = a.tier || "Covera customer";

    // Render one card per care item. An item due soon ("due" / "overdue" /
    // "review" or within 7 days) is flagged so the care-continuity beat lands
    // in context.
    const grid = document.getElementById("acct-policies");
    grid.innerHTML = "";
    (a.policies || []).forEach(p => {
      const soon = (p.renewsInDays != null && p.renewsInDays <= 7) ||
                   /(due|overdue|review|paused|lapsed)/i.test(p.status || "");
      const el = document.createElement("div");
      el.className = "pcell policy" + (soon ? " low" : "");
      el.innerHTML = `
        <span class="plabel">${p.kind || "Service"}</span>
        <span class="pval">${p.label || "—"}</span>
        <span class="pfine">${p.ref || ""}</span>
        <div class="policy-foot">
          <span class="prem">${p.premium || ""}</span>
          <span class="renew${soon ? " due" : ""}">${p.status || ""}</span>
        </div>`;
      grid.appendChild(el);
    });

    panel.hidden = false;
  }

  function renderEmpty(source) {
    document.getElementById("offer-heading").textContent = "Loading your offer…";
    document.getElementById("offer-body").textContent =
      "Fetching the offer Decisioning has decided for your account.";
    const ctaEl = document.getElementById("offer-cta");
    ctaEl.textContent = "—"; ctaEl.setAttribute("href", "#");
    document.getElementById("offer-code").textContent = "—";
    document.getElementById("offer-source").textContent = source || "waiting";
    document.getElementById("decision-json").textContent =
      JSON.stringify({ individualId: state.individualId || "anonymous", status: "no-decision" }, null, 2);
  }

  function setEyebrow(text) {
    const el = document.querySelector("#foryou .eyebrow");
    if (el) el.textContent = text;
  }

  // Render the logged-in persona's local HOME offer into the native hero. Used
  // when SP has not served yet so the mock-up is always complete. Clears any
  // dropped-in treatment card first so the native .copy/.art hero is visible.
  // Returns true if a fallback was rendered, false if none is defined.
  function renderFallback(id, source) {
    const f = FALLBACK_OFFER[id];
    if (!f) return false;

    const slot = document.getElementById("treatment-slot");
    if (slot) {
      slot.remove();
      document.querySelectorAll("#foryou .copy, #foryou .art")
        .forEach(n => (n.style.display = ""));
    }

    setEyebrow(f.eyebrow);
    document.getElementById("offer-heading").textContent = f.heading;
    document.getElementById("offer-body").innerHTML = f.body;
    const ctaEl = document.getElementById("offer-cta");
    ctaEl.textContent = f.cta; ctaEl.setAttribute("href", f.url);
    document.getElementById("offer-code").textContent = "home";
    document.getElementById("offer-source").textContent = source || "home offer · awaiting live decision";

    const art = document.getElementById("offer-art");
    art.style.backgroundImage =
      `linear-gradient(120deg, rgba(8,14,26,.45), rgba(8,14,26,.05)), url('${f.img}')`;

    state.lastDecision = {
      offerId: null, treatment: null, heading: f.heading,
      source: source || "fallback", individualId: id, channel: cfg.CHANNEL,
      ts: new Date().toISOString()
    };
    document.getElementById("decision-json").textContent =
      JSON.stringify({ individualId: id, status: "home offer (local) — awaiting live SP decision" }, null, 2);
    return true;
  }

  // Render the generic, un-personalised Covera hero for an anonymous visitor.
  // Paints the native hero fields directly (synthetic content, not an SP call),
  // hides the Covera account chrome, and restores the native hero if a
  // drop-in treatment card was previously injected (persona -> anonymous).
  function renderGeneric() {
    renderAccount(null); // no account chrome when anonymous

    // If a hydrated treatment card was dropped in earlier, remove it and bring
    // the native .copy/.art hero back so the generic creative is visible.
    const slot = document.getElementById("treatment-slot");
    if (slot) {
      slot.remove();
      document.querySelectorAll("#foryou .copy, #foryou .art")
        .forEach(n => (n.style.display = ""));
    }

    setEyebrow(GENERIC_OFFER.eyebrow);
    document.getElementById("offer-heading").textContent = GENERIC_OFFER.heading;
    document.getElementById("offer-body").innerHTML = GENERIC_OFFER.body;
    const ctaEl = document.getElementById("offer-cta");
    ctaEl.textContent = GENERIC_OFFER.cta;
    ctaEl.setAttribute("href", GENERIC_OFFER.url);
    document.getElementById("offer-code").textContent = "—";
    document.getElementById("offer-source").textContent = "generic · not personalised";

    const art = document.getElementById("offer-art");
    art.style.backgroundImage =
      `linear-gradient(120deg, rgba(8,14,26,.45), rgba(8,14,26,.05)), url('${GENERIC_OFFER.img}')`;

    state.lastDecision = null;
    document.getElementById("decision-json").textContent =
      JSON.stringify({ individualId: "anonymous", status: "generic offer — no personalization" }, null, 2);
  }

  // Drop the hydrated treatment card in whole. Hides the native hero layout
  // once and injects the HTML into a single slot inside the "For you" section.
  function dropInTreatment(html, source, item) {
    const sec = document.getElementById("foryou");
    let slot = document.getElementById("treatment-slot");
    if (!slot) {
      sec.querySelectorAll(".copy, .art").forEach(n => (n.style.display = "none"));
      slot = document.createElement("div");
      slot.id = "treatment-slot";
      slot.className = "treatment-slot";
      // center the card in the hero without depending on styles.css
      slot.style.cssText = "width:100%;display:flex;justify-content:center;padding:24px 0;";
      sec.appendChild(slot);
    }
    slot.innerHTML = html || "";

    const code = pick(item, "OfferId__c", "OfferTreatmentCode__c", "Id__c") || "—";
    state.lastDecision = {
      offerId: pick(item, "OfferId__c"),
      treatment: pick(item, "Id__c", "OfferTreatmentCode__c"),
      source, individualId: state.individualId || "anonymous",
      channel: cfg.CHANNEL, ts: new Date().toISOString()
    };
    document.getElementById("offer-code") && (document.getElementById("offer-code").textContent = code);
    document.getElementById("offer-source") && (document.getElementById("offer-source").textContent = source);
    document.getElementById("decision-json").textContent =
      JSON.stringify(state.lastDecision, null, 2);
  }

  /* ---------- SP personalization request ----------
   * Requests the Personalization Point via the Data 360 Decisioning API
   * (POST {tenantEndpoint}/personalization/decisions) and renders the returned
   * treatment. Request/response bodies follow the confirmed API contract.
   *
   * Two runtime unknowns, both self-revealing (logged, not guessed):
   *  1. CORS — a browser POST to the tenant endpoint must be allowed for this
   *     (unauthenticated) point. If it's blocked we pivot to the SDK wrapper,
   *     whose available methods we log once below for exactly that pivot.
   *  2. Identity — context.individualId is our deviceId (= Contact Id via
   *     setAnonymousId). The pipeline looks it up in the profile data graph, so
   *     the web-created Individual must UNIFY with the CRM unified individual
   *     that holds the decision. Empty data[] => that hop isn't resolving. */
  function requestDecision() {
    if (cfg.MOCK_MODE) return renderItem(MOCK_ITEM, "MOCK · local sample");

    // One-time: surface the live SDK Personalization method surface so we can
    // confirm the CORS-cleared browser method from the actual loaded beacon.
    const SI = window.SalesforceInteractions;
    if (SI && SI.Personalization && !requestDecision._probed) {
      requestDecision._probed = true;
      try {
        console.log("[storefront] SalesforceInteractions.Personalization surface:",
          Object.keys(SI.Personalization));
      } catch (e) {}
    }

    const id = state.individualId;
    if (!id) return renderGeneric(); // anonymous visitor -> un-personalised brand hero

    // Mock-up mode: skip SP entirely and render the local home offer. The
    // logged-in page is a complete Covera visual with no Data Cloud dependency.
    if ((cfg.HERO_SOURCE || "live") === "fallback") {
      if (renderFallback(id, "home offer · local mock-up")) return;
    }

    if (!cfg.DECISION_ENDPOINT) {
      console.warn("[storefront] DECISION_ENDPOINT not set in config.js — paste the " +
        "Data Cloud Tenant Specific Endpoint + /personalization/decisions.");
      return renderEmpty("decision endpoint not configured");
    }

    const body = {
      context: {
        individualId: id,
        dataspace: cfg.DATASPACE || "default",
        requestUrl: location.href
      },
      personalizationPoints: [ { name: cfg.PERSONALIZATION_POINT } ]
    };

    fetch(cfg.DECISION_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    })
      .then((r) => r.json())
      .then((resp) => {
        const item = firstItem(resp);
        // In "auto" only accept a live decision that serves a known Covera offer;
        // otherwise fall through to the local home offer (ignores stale serves).
        const accept = item && (item.TreatmentOutput__c || item.OfferHeading__c || item.personalizationContentId)
          && ((cfg.HERO_SOURCE || "live") !== "auto" || isCoveraItem(item));
        if (accept) {
          const prevOffer = state.lastDecision && state.lastDecision.offerId;
          const newOffer  = pick(item, "OfferId__c", "OfferTreatmentCode__c", "Id__c");
          renderItem(item, "DH decision · served by SP (live)");
          // Visible "stale offer vanishes, fresh one appears" beat: flash the
          // slot only when a re-decision actually changed the served offer.
          if (prevOffer && newOffer && prevOffer !== newOffer) flashForYou();
        } else {
          console.warn("[storefront] empty personalization — identity likely not " +
            "resolving to the unified profile that holds the decision; " +
            "showing local home offer", resp);
          if (!renderFallback(id, "home offer · awaiting live decision"))
            renderEmpty("no decision for this identity");
        }
      })
      .catch((err) => {
        console.warn("[storefront] decision request failed (CORS? endpoint?)", err);
        if (!renderFallback(id, "home offer · live decision unavailable"))
          renderEmpty("decision request error — see console");
      });
  }

  // Data 360 Decisioning API contract (POST /personalization/decisions):
  //   { personalizations: [ { data: [ {<content obj>} ], attributes: {...} } ] }
  // The content object in data[0] carries the response-template Item Attributes
  // (OfferHeading__c / OfferBody__c / TreatmentOutput__c / ...). `attributes`
  // holds the manual decision attrs (e.g. Introduction Text) — merge both so
  // renderItem's pick() sees everything.
  function firstItem(resp) {
    if (!resp) return null;
    const p = resp.personalizations && resp.personalizations[0];
    if (p && Array.isArray(p.data) && p.data.length) {
      return Object.assign({}, p.attributes || {}, p.data[0]);
    }
    // tolerate other envelopes (older SDKs / simulate shapes)
    const arr = resp.data || resp.items || resp.recommendations ||
                (Array.isArray(resp) ? resp : null);
    if (Array.isArray(arr) && arr.length) return arr[0].attributes || arr[0];
    return resp.attributes || resp;
  }

  // Brief outline pulse on the "For you" section when the served offer changes,
  // so the live swap reads on screen without depending on styles.css.
  function flashForYou() {
    const sec = document.getElementById("foryou");
    if (!sec) return;
    sec.style.transition = "box-shadow .25s ease";
    sec.style.boxShadow = "0 0 0 3px rgba(10,102,194,.9)";
    setTimeout(() => { sec.style.boxShadow = "none"; }, 900);
  }

  // Re-poll the SP decision on cfg.POLL_MS so a signal-driven re-decision is
  // seen swapping live. Restarted whenever identity changes; no-op in mock or
  // when POLL_MS <= 0 / no identity selected.
  function startPolling() {
    if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    const ms = Number(cfg.POLL_MS) || 0;
    if (cfg.MOCK_MODE || ms <= 0 || !state.individualId) return;
    pollTimer = setInterval(requestDecision, ms);
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
    onBrowse(product);
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
      opt.value = p.id;
      opt.textContent = `${p.name} · ${p.tag}`;
      sel.appendChild(opt);
    });
    sel.onchange = () => {
      state.individualId = sel.value;
      state.lastCategory = null;
      highlight(null);
      renderAccount(PERSONAS.find(p => p.id === sel.value)); // log in / out of Covera
      setIdentity(state.individualId);
      requestDecision(); // fresh arrival = serve the DH decision for this person
      startPolling();    // watch for live re-decisions on this identity
    };
  }

  /* ---------- live vs mock seam ---------- */
  // onBrowse: fire a browse event. Mock re-renders the sample; live sends the
  // event to Data 360 then re-requests the decision so SP can re-shape it.
  function onBrowse(product) {
    if (cfg.MOCK_MODE) return renderItem(MOCK_ITEM, "MOCK · local sample");
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
      requestDecision(); // SP re-decides against updated in-session context
    }
  }

  function setIdentity(id) {
    if (cfg.MOCK_MODE) return;
    if (window.SalesforceInteractions && id) SalesforceInteractions.setAnonymousId(id);
  }

  /* ---------- live init (beacon) ----------
   * The beacon is embedded statically in index.html <head> per the connector
   * Integration Guide, so here we just wait for the SDK global to appear, then
   * serve the first decision. Fallback-inject only if the static tag is absent. */
  function initLive() {
    const ready = () => {
      console.log("[storefront] SDK ready; personalization point:", cfg.PERSONALIZATION_POINT);
      setIdentity(state.individualId); // register the signed-in individual with the SDK
      requestDecision();
      startPolling();
    };
    if (window.SalesforceInteractions) return ready();
    let waited = 0;
    const t = setInterval(() => {
      if (window.SalesforceInteractions) { clearInterval(t); return ready(); }
      if ((waited += 200) >= 4000) {
        clearInterval(t);
        const s = document.createElement("script");
        s.src = cfg.BEACON_URL; s.async = true; s.onload = ready;
        document.head.appendChild(s);
      }
    }, 200);
  }

  // Which identity the storefront opens on (the parity beat starts logged in).
  //   ?who=<first name | contact id>  -> that persona
  //   ?who=anon | anonymous           -> anonymous / generic (no login)
  //   (no param)                      -> Sarah (homeowner) by default
  // On refresh the same identity is kept, so "fire decisions -> refresh" shows
  // the newly-served offer against a stable logged-in customer.
  function resolveOpeningPersona() {
    const who = (new URLSearchParams(location.search).get("who") || "").trim().toLowerCase();
    if (who === "anon" || who === "anonymous") return null;
    if (who) {
      const m = PERSONAS.find(p =>
        p.id.toLowerCase() === who ||
        p.name.toLowerCase().split(" ")[0] === who ||
        p.name.toLowerCase().includes(who));
      if (m) return m;
    }
    return PERSONAS.find(p => p.name.toLowerCase().startsWith("sarah")) || PERSONAS[0] || null;
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
      renderItem(MOCK_ITEM, "MOCK · local sample");
    } else {
      pill.textContent = "LIVE · Salesforce Personalization"; pill.className = "pill live";
      // Open LOGGED IN (default: Sarah) so the parity beat starts in a real
      // Covera customer account and the served offer updates on refresh as
      // decisions fire. ?who=anon opens anonymous/generic instead.
      const opening = resolveOpeningPersona();
      if (opening) {
        document.getElementById("who").value = opening.id;
        state.individualId = opening.id;
        renderAccount(opening);
      } else {
        renderGeneric();
      }
      initLive();
    }
  }
  document.addEventListener("DOMContentLoaded", boot);
})();
