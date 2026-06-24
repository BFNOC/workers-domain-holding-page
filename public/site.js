(function () {
  let config = window.SITE_CONFIG || {};
  const fallbackEmail = "hello@example.com";
  const fallbackLocale = "en";
  const localeStorageKey = "domain-temp-page.locale";
  const baseConfigPath = "./site-config.js";
  const localConfigPath = "./site-config.local.js";

  function isPlainObject(value) {
    return Object.prototype.toString.call(value) === "[object Object]";
  }

  function mergeConfig(base, override) {
    if (!isPlainObject(base)) {
      return isPlainObject(override) ? override : {};
    }
    if (!isPlainObject(override) || override === base) {
      return base;
    }

    const next = { ...base };
    Object.keys(override).forEach((key) => {
      const baseValue = next[key];
      const overrideValue = override[key];
      next[key] = isPlainObject(baseValue) && isPlainObject(overrideValue)
        ? mergeConfig(baseValue, overrideValue)
        : overrideValue;
    });
    return next;
  }

  function loadConfigScript(path, cacheBust) {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      const separator = path.includes("?") ? "&" : "?";

      script.src = cacheBust ? `${path}${separator}v=${Date.now()}` : path;
      script.async = false;
      script.onload = resolve;
      script.onerror = resolve;
      document.head.appendChild(script);
    });
  }

  async function loadConfig() {
    window.SITE_CONFIG = {};
    await loadConfigScript(baseConfigPath, false);

    const baseConfig = isPlainObject(window.SITE_CONFIG) ? window.SITE_CONFIG : {};
    await loadConfigScript(localConfigPath, true);

    config = mergeConfig(baseConfig, window.SITE_CONFIG || {});
    window.SITE_CONFIG = config;
  }

  function getSupportedLocales() {
    return Array.isArray(config.locales) && config.locales.length ? config.locales : [fallbackLocale];
  }

  function normalizeLocale(locale) {
    const value = String(locale || "").toLowerCase().split("-")[0];
    return getSupportedLocales().includes(value) ? value : "";
  }

  function getStoredLocale() {
    try {
      return normalizeLocale(window.localStorage.getItem(localeStorageKey));
    } catch {
      return "";
    }
  }

  function getUrlLocale() {
    try {
      return normalizeLocale(new URLSearchParams(window.location.search).get("lang"));
    } catch {
      return "";
    }
  }

  function setStoredLocale(locale) {
    try {
      window.localStorage.setItem(localeStorageKey, locale);
    } catch {
      // Storage can be unavailable in private modes; the current render still works.
    }
  }

  function getInitialLocale() {
    return (
      getUrlLocale() ||
      getStoredLocale() ||
      normalizeLocale(window.navigator.language) ||
      normalizeLocale(config.defaultLocale) ||
      fallbackLocale
    );
  }

  let activeLocale = fallbackLocale;

  function getCurrentDomain() {
    const hostname = window.location.hostname || "example.com";
    const domain = hostname.replace(/^www\./i, "");
    const isLocalPreview = ["localhost", "127.0.0.1", "::1"].includes(domain);
    const localPreviewDomain = isLocalPreview ? getUrlDomain() : "";

    return localPreviewDomain || (isLocalPreview && config.previewDomain ? config.previewDomain : domain);
  }

  function getProfile(domain) {
    return (config.domainProfiles && config.domainProfiles[domain]) || {};
  }

  function getUrlDomain() {
    try {
      const value = new URLSearchParams(window.location.search).get("domain") || "";
      const domain = value.toLowerCase().trim().replace(/^www\./i, "");
      return config.domainProfiles && config.domainProfiles[domain] ? domain : "";
    } catch {
      return "";
    }
  }

  function getProfileContent(profile, locale) {
    const localized = profile.content || {};
    return localized[locale] || localized[fallbackLocale] || profile;
  }

  function getUi(locale) {
    const localized = config.ui || {};
    return localized[locale] || localized[fallbackLocale] || {};
  }

  function replaceTokens(value, replacements) {
    return String(value || "").replace(/\{([a-z]+)\}/gi, (match, key) => {
      return Object.prototype.hasOwnProperty.call(replacements, key) ? replacements[key] : match;
    });
  }

  function setText(selector, value) {
    if (!value) {
      return;
    }
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = value;
    });
  }

  function setRichDomainText(selector, value, domain) {
    if (!value) {
      return;
    }
    document.querySelectorAll(selector).forEach((node) => {
      node.replaceChildren();
      value.split("{domain}").forEach((part, index) => {
        if (index > 0) {
          const strong = document.createElement("strong");
          strong.textContent = domain;
          node.appendChild(strong);
        }
        node.appendChild(document.createTextNode(part));
      });
    });
  }

  function setTokenizedText(selector, value, replacements) {
    if (!value) {
      return;
    }
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = replaceTokens(value, replacements);
    });
  }

  function setImage(selector, src, alt) {
    if (!src) {
      return;
    }
    document.querySelectorAll(selector).forEach((image) => {
      image.setAttribute("src", src);
      if (typeof alt === "string") {
        image.setAttribute("alt", alt);
      }
    });
  }

  function applyPageMeta(content, domain, locale) {
    document.documentElement.lang = locale === "zh" ? "zh-Hans" : "en";

    if (content.pageTitle) {
      document.title = replaceTokens(content.pageTitle, { domain });
    }

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && content.metaDescription) {
      metaDescription.setAttribute("content", replaceTokens(content.metaDescription, { domain }));
    }
  }

  function applyProfile(profile, content, domain) {
    if (profile.theme) {
      document.body.dataset.theme = profile.theme;
    } else {
      delete document.body.dataset.theme;
    }
    setText("[data-hero-kicker]", content.heroKicker);
    setText("[data-hero-title]", content.heroTitle);
    setText("[data-hero-lead]", content.heroLead);
    setRichDomainText("[data-hero-body]", content.heroBody, domain);
    setImage("[data-visual-image]", profile.visualSrc || content.visualSrc, content.visualAlt);
    setText("[data-visual-caption]", content.visualCaption);

    (content.principles || []).forEach((principle, index) => {
      setText(`[data-principle-title="${index}"]`, principle.title);
      setText(`[data-principle-body="${index}"]`, principle.body);
    });
  }

  function applyMailLinks(domain, ui) {
    const email = config.contactEmail || fallbackEmail;
    const subject = replaceTokens(ui.mailSubject || "Inquiry regarding {domain}", { domain });
    const body = (ui.mailBody || [`Hello, I am interested in ${domain}.`])
      .map((line) => replaceTokens(line, { domain }))
      .join("\n");
    const href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    document.querySelectorAll("[data-mail-link]").forEach((link) => {
      link.setAttribute("href", href);
    });
    setText("[data-email]", email);
  }

  function applyUi(ui, displayName) {
    const ownerName = config.ownerName || "the owner";

    setText("[data-availability]", ui.availability);
    setText("[data-domain-kicker]", ui.domainKicker);
    setRichDomainText("[data-domain-title]", ui.domainTitle, displayName);
    setText("[data-contact-prefix]", ui.contactPrefix);
    setText("[data-contact-suffix]", ui.contactSuffix);
    setTokenizedText("[data-footer-owner]", ui.footerOwner, { owner: ownerName });
    setText("[data-footer-host]", ui.footerHost);
  }

  function applyLanguageButtons(locale) {
    document.querySelectorAll("[data-lang-button]").forEach((button) => {
      const isActive = button.dataset.langButton === locale;
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function render() {
    const domain = getCurrentDomain();
    const profile = getProfile(domain);
    const content = getProfileContent(profile, activeLocale);
    const ui = getUi(activeLocale);
    const displayName = profile.displayName || domain;
    const note = content.note || "This domain is currently parked. It may be available to the right buyer.";

    applyPageMeta(content, displayName, activeLocale);
    applyProfile(profile, content, displayName);
    applyUi(ui, displayName);
    setText("[data-domain]", displayName);
    setText("[data-domain-note]", note);
    applyMailLinks(displayName, ui);
    applyLanguageButtons(activeLocale);
  }

  function bindLanguageSwitcher() {
    document.querySelectorAll("[data-lang-button]").forEach((button) => {
      button.addEventListener("click", () => {
        const nextLocale = normalizeLocale(button.dataset.langButton);
        if (!nextLocale || nextLocale === activeLocale) {
          return;
        }
        activeLocale = nextLocale;
        setStoredLocale(activeLocale);
        render();
      });
    });
  }

  function boot() {
    activeLocale = getInitialLocale();
    bindLanguageSwitcher();
    render();
  }

  loadConfig().then(boot);
})();
