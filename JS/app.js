(() => {
  const normalizePath = (path) => (path || "").replace(/\\/g, "/");

  // Reveal on scroll with staggered animation
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            // Add a small delay for each element to create stagger effect
            setTimeout(() => {
              entry.target.classList.add("is-visible");
            }, index * 100); // 100ms delay between each element
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    revealEls.forEach((el) => io.observe(el));
  }

  // Active nav link
  const currentPath = normalizePath(window.location.pathname);
  const navLinks = Array.from(document.querySelectorAll(".nav-links a[href]"));
  for (const link of navLinks) {
    const href = normalizePath(link.getAttribute("href"));
    if (!href || href.startsWith("#")) continue;

    // Match by filename end (works for relative paths)
    const hrefFile = href.split("/").pop();
    const pathFile = currentPath.split("/").pop();
    if (
      hrefFile &&
      pathFile &&
      hrefFile.toLowerCase() === pathFile.toLowerCase()
    ) {
      link.setAttribute("aria-current", "page");
    }
  }

  // Back to top
  const toTop = document.getElementById("toTop");
  if (toTop) {
    const onScroll = () => {
      const show = window.scrollY > 420;
      toTop.classList.toggle("is-visible", show);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Contact form enhancements
  const contactForm = document.querySelector(".form");
  if (contactForm) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    contactForm.addEventListener("submit", function (e) {
      // Add submitting state
      contactForm.classList.add("submitting");
      submitBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Envoi en cours...';
      submitBtn.disabled = true;

      // Remove any existing success message
      const existingSuccess = contactForm.querySelector(".success-message");
      if (existingSuccess) {
        existingSuccess.remove();
      }

      // The form will submit to Formspree, but we'll handle the response
      // Note: Formspree redirects to a success page by default
      // This is just for immediate visual feedback
      setTimeout(() => {
        // Reset form state (in case of error or for demo)
        contactForm.classList.remove("submitting");
        submitBtn.innerHTML = originalBtnText;
        submitBtn.disabled = false;
      }, 3000);
    });

    // Enhanced form validation feedback
    const inputs = contactForm.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("blur", function () {
        if (this.value.trim() !== "") {
          this.classList.add("has-value");
        } else {
          this.classList.remove("has-value");
        }
      });

      input.addEventListener("input", function () {
        if (this.checkValidity()) {
          this.classList.remove("invalid");
          this.classList.add("valid");
        } else {
          this.classList.remove("valid");
          this.classList.add("invalid");
        }
      });
    });
  }

  // Skills: values table and function to fill progress bars
  const skillValues = {
    VPN: 70,
    VirtualBox: 90,
    "Active Directory": 90,
    Linux: 90,
    Cybersécurité: 20,
    "Cisco Packet Tracer": 95,
    Glpi: 95,
    GitHub: 10,
    OSTiket: 95,
    HTML: 50,
    CSS: 50,
    Javascript: 10,
    PHP: 30,
    SQL: 30,
    Python: 10,
  };

  function fillSkillProgress() {
    const cards = document.querySelectorAll(".skill-card");
    if (!cards.length) return;

    cards.forEach((card) => {
      const nameEl = card.querySelector(".skill-name");
      if (!nameEl) return;
      const name = nameEl.textContent.trim();
      const value = skillValues[name];
      const fill = card.querySelector(".progress-fill");
      const percent = card.querySelector(".progress-percentage");

      if (typeof value !== "undefined") {
        if (fill) {
          fill.style.width = "0%";
          // force layout then animate
          fill.getBoundingClientRect();
          fill.style.transition = "width 700ms ease";
          fill.style.width = value + "%";
        }
        if (percent) percent.textContent = value + "%";
      } else {
        if (fill) fill.style.width = "0%";
        if (percent) percent.textContent = "";
      }
    });
  }

  // Run after DOM is ready (script is loaded with `defer` in HTML)
  fillSkillProgress();

  // Generate three "réalisations" lines per skill based on the percentage
  function generateSkillRealizations() {
    const cards = document.querySelectorAll(".skill-card");
    if (!cards.length) return;

    cards.forEach((card) => {
      const nameEl = card.querySelector(".skill-name");
      if (!nameEl) return;
      const name = nameEl.textContent.trim();
      const value = skillValues[name] || 0;

      let lines = [];
      if (value >= 80) {
        lines = [
          "Expertise avancée",
          "Plusieurs projets réalisés",
          "Peut encadrer / documenter",
        ];
      } else if (value >= 60) {
        lines = [
          "Bonne maîtrise",
          "Projets réalisés",
          "Formation continue recommandée",
        ];
      } else if (value >= 40) {
        lines = [
          "Bases solides",
          "Petits projets et TP",
          "Pratique régulière recommandée",
        ];
      } else if (value >= 20) {
        lines = [
          "Notions acquises",
          "Exercices et apprentissage",
          "Stage / pratique en cours",
        ];
      } else {
        lines = [
          "Découverte",
          "Apprentissage en cours",
          "Peu d\u2019expérience",
        ];
      }

      // Remove existing block if any
      const existing = card.querySelector(".skill-realizations");
      if (existing) existing.remove();

      const container = document.createElement("div");
      container.className = "skill-realizations";

      lines.forEach((txt) => {
        const p = document.createElement("p");
        p.className = "realization-line";
        p.textContent = txt;
        container.appendChild(p);
      });

      // Insert after the image when possible, otherwise append
      const img = card.querySelector("img");
      if (img && img.parentNode)
        img.insertAdjacentElement("afterend", container);
      else card.appendChild(container);
    });
  }

  generateSkillRealizations();

  // Documents: open doc/pdf links as an in-page modal popup
  const docLinkSelector = "a[href]";
  const docHrefRe = /(^|\/)(doc\/)|\.pdf(\?|#|$)/i;

  function shouldOpenInNewTab(evt) {
    return (
      evt.button === 1 ||
      evt.metaKey ||
      evt.ctrlKey ||
      evt.shiftKey ||
      evt.altKey
    );
  }

  function ensureDocModal() {
    let modal = document.getElementById("docModal");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "docModal";
    modal.className = "doc-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");

    modal.innerHTML = `
      <div class="doc-modal-backdrop" data-doc-close="true"></div>
      <div class="doc-modal-dialog" role="document">
        <div class="doc-modal-header">
          <div class="doc-modal-title" id="docModalTitle">Document</div>
          <button type="button" class="btn doc-modal-close" data-doc-close="true" aria-label="Fermer">
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
            Fermer
          </button>
        </div>
        <div class="doc-modal-content">
          <iframe class="doc-modal-frame" id="docModalFrame" title="Document"></iframe>
        </div>
      </div>
    `.trim();

    document.body.appendChild(modal);

    modal.addEventListener("click", (e) => {
      const target = e.target;
      if (
        target &&
        target.closest &&
        target.closest('[data-doc-close="true"]')
      ) {
        closeDocModal();
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeDocModal();
      }
    });

    return modal;
  }

  let lastActiveEl = null;
  let previousBodyOverflow = "";

  function openDocModal(url, titleText) {
    const modal = ensureDocModal();
    const frame = modal.querySelector("#docModalFrame");
    const title = modal.querySelector("#docModalTitle");
    const closeBtn = modal.querySelector(".doc-modal-close");

    lastActiveEl = document.activeElement;
    previousBodyOverflow = document.body.style.overflow || "";
    document.body.style.overflow = "hidden";

    title.textContent = (titleText || "Document").trim();
    frame.setAttribute("src", url);
    frame.setAttribute("title", title.textContent);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    if (closeBtn) closeBtn.focus();
  }

  function closeDocModal() {
    const modal = document.getElementById("docModal");
    if (!modal) return;
    const frame = modal.querySelector("#docModalFrame");

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");

    // Stop PDF/video/audio from continuing in the background
    if (frame) frame.setAttribute("src", "about:blank");

    document.body.style.overflow = previousBodyOverflow;

    if (lastActiveEl && lastActiveEl.focus) {
      try {
        lastActiveEl.focus();
      } catch (_) {
        // no-op
      }
    }
  }

  const docLinks = Array.from(
    document.querySelectorAll(docLinkSelector),
  ).filter((a) => {
    const href = (a.getAttribute("href") || "").trim();
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    )
      return false;
    if (a.getAttribute("data-doc-popup") === "false") return false;
    return docHrefRe.test(href);
  });

  if (docLinks.length) {
    docLinks.forEach((a) => {
      a.addEventListener("click", (e) => {
        if (shouldOpenInNewTab(e)) return;
        // Allow normal behavior if user explicitly asked for a new tab
        if (a.target && a.target.toLowerCase() === "_blank") {
          // Still open as modal unless modifier keys are used
        }

        e.preventDefault();
        const title =
          a.getAttribute("data-doc-title") || a.textContent || "Document";
        openDocModal(a.href, title);
      });
    });
  }
})();
