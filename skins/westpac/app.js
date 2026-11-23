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
  // Westpac re-skin: the "account" is a B2C banking profile — balances,
  // products and recent activity the engine reads to decide the next best
  // step. Contact Ids are the 4b personas the decisions are fired against.
  const PERSONAS = [
    { id: "003Kh00001uijWCIAY", name: "Hannah Nguyen", tag: "Established · home loan roll-off in 45 days",
      account: {
        since: "Westpac customer since 2012", tier: "Everyday + Home loan",
        stats: [
          { value: "&#36;4,280", label: "Everyday account" },
          { value: "&#36;18,940", label: "Savings" },
          { value: "45 days", label: "Fixed rate rolls off" }
        ],
        policies: [
          { kind: "Home loan", label: "Fixed rate · owner occupier", ref: "Rolls to variable soon",
            premium: "Fixed term ending", status: "Review suggested" },
          { kind: "Everyday account", label: "Westpac Choice", ref: "BSB 032-000",
            premium: "Salary paid in", status: "On track" }
        ],
        activity: [
          { what: "Salary credit", when: "Today", amt: "+ &#36;3,912.40" },
          { what: "Called us · asked about rates", when: "Yesterday", amt: "Contact centre" },
          { what: "Woolworths Metro", when: "Yesterday", amt: "&#8211; &#36;46.20" },
          { what: "Home loan repayment", when: "1 Nov", amt: "&#8211; &#36;2,604.00" }
        ]
      } },
    { id: "003Kh00001uijWDIAY", name: "Daniel Chen", tag: "New customer · joined 3 days ago",
      account: {
        since: "Welcome to Westpac · joined 3 days ago", tier: "New customer",
        stats: [
          { value: "&#36;1,150", label: "Everyday account" },
          { value: "&#36;0", label: "Savings" },
          { value: "Day 3", label: "Of your first 30" }
        ],
        policies: [
          { kind: "Everyday", label: "Everyday account", ref: "Opened 3 days ago",
            premium: "Card on its way", status: "Set-up 2 of 4" },
          { kind: "Digital", label: "Digital wallet", ref: "Not set up yet",
            premium: "Pay with your phone", status: "Set up now" }
        ],
        activity: [
          { what: "First deposit", when: "3 days ago", amt: "+ &#36;1,200.00" },
          { what: "App installed", when: "3 days ago", amt: "Welcome" },
          { what: "Coffee Supreme", when: "Today", amt: "&#8211; &#36;5.80" }
        ]
      } },
    { id: "003Kh00001uijWFIAY", name: "Anita Kapoor", tag: "Financial hardship arrangement in place",
      account: {
        since: "Westpac customer since 2018", tier: "Support arrangement",
        stats: [
          { value: "&#36;312", label: "Everyday account" },
          { value: "Paused", label: "Card repayments" },
          { value: "In place", label: "Hardship arrangement" }
        ],
        policies: [
          { kind: "Support", label: "Hardship arrangement", ref: "Reviewed with our team",
            premium: "Repayments adjusted", status: "In place" },
          { kind: "Credit card", label: "Low rate card", ref: "Card ending 9021",
            premium: "Repayments paused", status: "Review due" }
        ],
        activity: [
          { what: "Hardship arrangement confirmed", when: "Last week", amt: "Support team" },
          { what: "Pharmacy", when: "Today", amt: "&#8211; &#36;18.40" },
          { what: "Rent", when: "1 Nov", amt: "&#8211; &#36;520.00" }
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
    eyebrow: "Westpac",
    heading: "Your money, your next step.",
    body: "Everyday banking, savings, cards and home loans in one app. <strong>Sign in</strong> and your next best step re-shapes to you.",
    cta: "Explore Westpac",
    url: "#",
    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1000&q=80&auto=format&fit=crop"
  };

  // Local creative per Westpac offer code (WB_*). Generic copy, no rates —
  // used for the per-persona fallback and to fill an image if a live serve
  // carries none. A live SP decision ALWAYS overrides the fallback.
  const OFFER_CREATIVE = {
    WB_ONBOARD1: { eyebrow: "Welcome to Westpac", heading: "Let's get your app set up the way you like it",
      body: "Turn on <strong>real-time alerts</strong> and add your card to your <strong>digital wallet</strong> so you can pay with your phone from today.",
      cta: "Finish set-up", img: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1000&q=80&auto=format&fit=crop" },
    WB_ONBOARD2: { eyebrow: "Welcome to Westpac", heading: "Start a savings goal in a minute",
      body: "Pick something you're saving for and we'll help you <strong>track it from your home screen</strong>. You can change it any time.",
      cta: "Set a goal", img: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1000&q=80&auto=format&fit=crop" },
    WB_CARD: { eyebrow: "Picked for you", heading: "A credit card that fits how you spend",
      body: "Compare our <strong>low-rate and rewards cards</strong> and see which one suits your everyday spending. Apply in the app in a few minutes.",
      cta: "Compare cards", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1000&q=80&auto=format&fit=crop" },
    WB_SAVER: { eyebrow: "Picked for you", heading: "Give your savings a boost",
      body: "Move some of today's balance into a <strong>bonus savings account</strong> and earn more when you grow it each month.",
      cta: "Open a savings account", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1000&q=80&auto=format&fit=crop" },
    WB_REPRICE: { eyebrow: "Your fixed rate ends soon", heading: "Let's look at your home loan options together",
      body: "Your fixed term is ending. A home loan specialist can <strong>review your options before it rolls to variable</strong> — book a time that suits you.",
      cta: "Book a review", img: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1000&q=80&auto=format&fit=crop" },
    WB_HARDSHIP_HELP: { eyebrow: "We're here to help", heading: "Your support arrangement, and what happens next",
      body: "Your arrangement is in place. See <strong>your next steps</strong>, check in with our support team, or find free financial counselling.",
      cta: "See my next steps", img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=1000&q=80&auto=format&fit=crop" }
  };

  // Per-persona local offer shown when the live serve has not resolved yet
  // (fresh identity, item graph mid-refresh). Keyed by Contact Id -> offer code.
  const FALLBACK_CODE = {
    "003Kh00001uijWCIAY": "WB_REPRICE",       // Hannah — fixed-rate roll-off
    "003Kh00001uijWDIAY": "WB_ONBOARD1",      // Daniel — new customer onboarding
    "003Kh00001uijWFIAY": "WB_HARDSHIP_HELP"  // Anita — hardship: support only
  };
  const FALLBACK_OFFER = {};
  Object.keys(FALLBACK_CODE).forEach(id => {
    const c = OFFER_CREATIVE[FALLBACK_CODE[id]];
    if (c) FALLBACK_OFFER[id] = Object.assign({ url: "#", code: FALLBACK_CODE[id] }, c);
  });

  // Accept a live SP decision only when it serves a Westpac offer, so a stale
  // serve from a previous demo vertical (NRMA, telco, insurer) is ignored and
  // the local offer shows instead. Offer Ids churn on every rebuild, so we key
  // on the WB_ offer code or the Westpac brand token in the hydrated treatment.
  const WESTPAC_OFFER_IDS = new Set([]);   // optional exact 15-char Id guard
  const OTHER_BRANDS = /\b(nrma|my nrma|suncorp|medibank|bupa|telco|ampol|chargefox)\b/i;
  function codeOf(item) {
    const txt = [pick(item, "OfferTreatmentCode__c"), pick(item, "OfferCode__c", "offerCode"),
                 pick(item, "Id__c"), pick(item, "TreatmentOutput__c", "treatmentOutput")].join(" ");
    const m = /\bWB_[A-Z0-9_]+/.exec(txt);
    return m ? m[0].replace(/_(EMAIL|SMS|PUSH|WEB)$/, "") : null;
  }
  function isWestpacItem(item) {
    const oid = pick(item, "OfferId__c", "offerId");
    if (oid && WESTPAC_OFFER_IDS.has(String(oid).substring(0, 15))) return true;
    const txt = (pick(item, "TreatmentOutput__c", "treatmentOutput") || "") + " " +
                (pick(item, "OfferHeading__c", "offerHeading") || "") + " " +
                (pick(item, "OfferBody__c", "offerBody") || "");
    if (OTHER_BRANDS.test(txt)) return false;           // leftover NRMA / telco / insurer serve
    return !!codeOf(item) || /westpac/i.test(txt);
  }

  const CAT_LABEL = {
    CAT_SAVINGS: "Savings", CAT_CARDS: "Credit cards", CAT_HOMELOANS: "Home loans",
    CAT_INSURANCE: "Insurance", CAT_HELP: "Support"
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
    const liveCode = codeOf(item);
    const img     = pick(item, "ImageUrl__c", "imageUrl")
                    || imageFromTreatment(pick(item, "TreatmentOutput__c", "treatmentOutput"))
                    || (liveCode && OFFER_CREATIVE[liveCode] && OFFER_CREATIVE[liveCode].img);
    const code    = liveCode || pick(item, "OfferId__c", "OfferTreatmentCode__c", "Id__c") || "—";

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

  // Populate the logged-in Westpac customer summary from the selected persona.
  // Demo dressing only — this is NOT SP/decision data; it just makes the offer
  // land inside a believable account context. Hidden when anonymous.
  function renderAccount(persona) {
    const panel = document.getElementById("account-summary");
    if (!panel) return;
    const a = persona && persona.account;
    if (!a) { panel.hidden = true; const act = document.getElementById("acct-activity"); if (act) act.hidden = true; return; }

    document.getElementById("acct-avatar").textContent = (persona.name || "s").trim()[0];
    document.getElementById("acct-name").textContent = (persona.name || "").split(" ")[0];
    document.getElementById("acct-since").textContent = a.since || "Welcome back";
    document.getElementById("acct-tier").textContent = a.tier || "Westpac customer";

    // Signature stats row (points / standing / renewal) — mirrors the canonical
    // story. Demo dressing; hidden if a persona defines no stats.
    const statsEl = document.getElementById("acct-stats");
    if (statsEl) {
      statsEl.innerHTML = "";
      (a.stats || []).forEach(s => {
        const el = document.createElement("div");
        el.className = "stat";
        el.innerHTML = `<span class="sv">${s.value}</span><span class="sl">${s.label}</span>`;
        statsEl.appendChild(el);
      });
      statsEl.style.display = (a.stats && a.stats.length) ? "" : "none";
    }

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

    // Recent activity list (demo dressing).
    const act = document.getElementById("acct-activity");
    const rows = document.getElementById("activity-rows");
    if (act && rows) {
      rows.innerHTML = "";
      (a.activity || []).forEach(r => {
        const el = document.createElement("div");
        el.className = "arow";
        el.innerHTML = `<div><b>${r.what}</b><span class="awhen">${r.when}</span></div><span class="aamt${/^\+/.test(r.amt) ? " in" : ""}">${r.amt}</span>`;
        rows.appendChild(el);
      });
      act.hidden = !(a.activity && a.activity.length);
    }

    panel.hidden = false;
  }

  function renderEmpty(source) {
    document.getElementById("offer-heading").textContent = "Loading your next step…";
    document.getElementById("offer-body").textContent =
      "Fetching the next step decided for your account.";
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
    document.getElementById("offer-code").textContent = f.code || "home";
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

  // Render the generic, un-personalised Westpac hero for an anonymous visitor.
  // Paints the native hero fields directly (synthetic content, not an SP call),
  // hides the member account chrome, and restores the native hero if a
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
    // logged-in page is a complete Westpac visual with no Data Cloud dependency.
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
        // In "auto" only accept a live decision that serves a known Westpac offer;
        // otherwise fall through to the local home offer (ignores stale serves).
        const accept = item && (item.TreatmentOutput__c || item.OfferHeading__c || item.personalizationContentId)
          && ((cfg.HERO_SOURCE || "live") !== "auto" || isWestpacItem(item));
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
    sec.style.boxShadow = "0 0 0 3px rgba(218,23,16,.85)";
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
      renderAccount(PERSONAS.find(p => p.id === sel.value)); // log in / out of the Westpac app
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
  //   (no param)                      -> Hannah (established customer) by default
  // On refresh the same identity is kept, so "fire decisions -> refresh" shows
  // the newly-served offer against a stable logged-in member.
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
      // Open LOGGED IN (default: Hannah) so the parity beat starts in a real
      // Westpac customer account and the served offer updates on refresh as
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
