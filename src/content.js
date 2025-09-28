(function () {
  const HIDDEN_CLASS = "nih-hide-trending";
  const STYLE_ID = "nih-hide-trending-style";

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${HIDDEN_CLASS} { display: none !important; visibility: hidden !important; pointer-events: none !important; }
    `;
    document.documentElement.appendChild(style);
  }

  function normalize(text) {
    return (text || "").replace(/[’]/g, "'").toLowerCase().trim();
  }

  const headingTextCandidates = [
    "what's happening",
    "trending now",
    "trends for you",
    "trending"
  ];

  const ariaLabelSubstrings = [
    "timeline: trending now",
    "trending now",
    "trends for you",
    "trending"
  ];

  function hasTrendingAria(el) {
    const label = el.getAttribute("aria-label");
    if (!label) return false;
    const value = normalize(label);
    return ariaLabelSubstrings.some((sub) => value.includes(sub));
  }

  function matchHeading(node) {
    const text = normalize(node.textContent || "");
    return headingTextCandidates.some((t) => text.includes(t));
  }

  function findContainersFromHeadings(root) {
    const containers = [];
    const headings = root.querySelectorAll(
      'h1[role="heading"], h2[role="heading"], div[role="heading"], h1, h2'
    );
    headings.forEach((h) => {
      if (!matchHeading(h)) return;
      const container = h.closest(
        'section[role="region"], section[aria-labelledby], section, aside, div[aria-label], div[data-testid], div'
      );
      if (container && !containers.includes(container)) containers.push(container);
    });
    return containers;
  }

  function findAriaLabeledSections(root) {
    const nodes = [];
    root.querySelectorAll('[aria-label]').forEach((el) => {
      if (hasTrendingAria(el)) nodes.push(el);
    });
    return nodes;
  }

  function hideAndDisable(node) {
    if (!node) return;
    if (node.classList && node.classList.contains(HIDDEN_CLASS)) return;
    try {
      if (node.classList) node.classList.add(HIDDEN_CLASS);
      node.setAttribute("aria-hidden", "true");
      node.setAttribute("aria-disabled", "true");
      node.setAttribute("inert", "");
      node.setAttribute("tabindex", "-1");
      node.style.setProperty("display", "none", "important");
      node.style.setProperty("visibility", "hidden", "important");
      node.style.setProperty("pointer-events", "none", "important");
    } catch (_) {
      // no-op
    }
  }

  function sweep(root = document) {
    injectStyle();
    const targets = [
      ...findAriaLabeledSections(root),
      ...findContainersFromHeadings(root)
    ];
    targets.forEach(hideAndDisable);
  }

  function start() {
    sweep(document);
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "childList") {
          m.addedNodes.forEach((n) => {
            if (n && n.nodeType === 1) sweep(n);
          });
        } else if (m.type === "attributes" && m.attributeName === "aria-label") {
          sweep(m.target);
        }
      }
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-label"],
    });
  }

  // Run immediately at document_start and keep watching for SPA route changes.
  start();
})();
