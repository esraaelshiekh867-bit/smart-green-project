/* =========================================================
   SIWES — script.js
   Vanilla JS only. Handles: language toggle (EN/AR, no reload),
   sticky navbar state, mobile menu, scroll-reveal animations,
   animated counters, the signature flow-line progress + dots,
   and button ripple micro-interactions.
   ========================================================= */

(() => {
  "use strict";

  /* ---------- Progressive enhancement flag ----------
     Only elements under html.js-ready start hidden (see style.css).
     This line runs first: if anything below throws, content the user
     already sees stays visible instead of being stuck at opacity:0. */
  document.documentElement.classList.add("js-ready");

  /* ---------- Footer year ---------- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Language switching ---------- */
  const body = document.body;
  const html = document.documentElement;
  const langSwitch = document.getElementById("langSwitch");

  function setLanguage(lang) {
    if (lang === "ar") {
      body.classList.remove("lang-en");
      body.classList.add("lang-ar");
      html.setAttribute("lang", "ar");
      html.setAttribute("dir", "rtl");
    } else {
      body.classList.remove("lang-ar");
      body.classList.add("lang-en");
      html.setAttribute("lang", "en");
      html.setAttribute("dir", "ltr");
    }
    localStorage.setItem("siwes-lang", lang);
  }

  const savedLang = (() => {
    try { return localStorage.getItem("siwes-lang"); } catch (e) { return null; }
  })();
  if (savedLang === "ar") setLanguage("ar");

  if (langSwitch) {
    langSwitch.addEventListener("click", () => {
      const next = body.classList.contains("lang-ar") ? "en" : "ar";
      setLanguage(next);
    });
  }

  /* ---------- Sticky navbar background on scroll ---------- */
  const navbar = document.getElementById("navbar");
  function handleNavbarScroll() {
    if (window.scrollY > 40) navbar.classList.add("is-scrolled");
    else navbar.classList.remove("is-scrolled");
  }
  handleNavbarScroll();
  window.addEventListener("scroll", handleNavbarScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  function closeMobileMenu() {
    hamburger.classList.remove("is-open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
  }
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = hamburger.classList.toggle("is-open");
      hamburger.setAttribute("aria-expanded", String(isOpen));
      mobileMenu.classList.toggle("is-open", isOpen);
    });
    mobileMenu.querySelectorAll(".mobile-link").forEach((link) => {
      link.addEventListener("click", closeMobileMenu);
    });
  }

  /* ---------- Smooth scroll cue ---------- */
  const scrollCue = document.getElementById("scrollCue");
  if (scrollCue) {
    scrollCue.addEventListener("click", () => {
      const about = document.getElementById("about");
      if (about) about.scrollIntoView({ behavior: "smooth" });
    });
  }

  /* ---------- Scroll-reveal via IntersectionObserver ---------- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18, rootMargin: "0px 0px -60px 0px" }
  );
  revealEls.forEach((el) => revealObserver.observe(el));

  // Safety net: force-reveal anything still hidden after 2.5s (covers
  // edge cases like elements the observer never triggers for).
  window.setTimeout(() => {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }, 2500);

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.getAttribute("data-count"), 10) || 0;
        const duration = 1400;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  /* ---------- Signature flow-line: scroll progress + active dots ---------- */
  const journey = document.getElementById("journey");
  const flowPath = document.getElementById("flowPath");
  const flowDots = document.querySelectorAll(".flow-dot");

  function updateFlowLine() {
    if (!journey || !flowPath) return;
    const rect = journey.getBoundingClientRect();
    const viewportH = window.innerHeight;
    const total = rect.height + viewportH;
    const scrolled = viewportH - rect.top;
    const progress = Math.min(Math.max(scrolled / total, 0), 1);

    const pathLength = 2400;
    const offset = pathLength - pathLength * progress;
    flowPath.style.strokeDashoffset = String(offset);
  }

  const dotObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("is-active");
        else entry.target.classList.remove("is-active");
      });
    },
    { threshold: 0.6 }
  );
  flowDots.forEach((dot) => dotObserver.observe(dot));

  window.addEventListener("scroll", updateFlowLine, { passive: true });
  window.addEventListener("resize", updateFlowLine);
  updateFlowLine();

  /* ---------- Cursor glow (desktop ambient effect) ---------- */
  const cursorGlow = document.querySelector(".cursor-glow");
  if (cursorGlow && window.matchMedia("(min-width: 900px)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursorGlow.style.left = e.clientX + "px";
      cursorGlow.style.top = e.clientY + "px";
    });
  }

  /* ---------- Button ripple micro-interaction ---------- */
  document.querySelectorAll(".ripple").forEach((btn) => {
    btn.addEventListener("click", function (e) {
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const dot = document.createElement("span");
      dot.className = "ripple-dot";
      dot.style.width = dot.style.height = size + "px";
      dot.style.left = e.clientX - rect.left - size / 2 + "px";
      dot.style.top = e.clientY - rect.top - size / 2 + "px";
      btn.appendChild(dot);
      window.setTimeout(() => dot.remove(), 650);
    });
  });
})();