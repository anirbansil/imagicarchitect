/* ==========================================================================
   IMAGIC — Site behavior & motion
   ========================================================================== */
(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Sticky header: solid on scroll + active link highlight
     --------------------------------------------------------------------- */
  const header = document.getElementById("siteHeader");
  const navLinks = document.querySelectorAll(".imagic-nav-link");
  const sections = Array.from(document.querySelectorAll("section[id]"));

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 24);

    let current = sections[0] && sections[0].id;
    const scrollPos = window.scrollY + 140;
    sections.forEach((sec) => {
      if (scrollPos >= sec.offsetTop) current = sec.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------------
     Mobile off-canvas nav + mega menu toggle (touch/click)
     --------------------------------------------------------------------- */
  const mobileToggle = document.getElementById("mobileNavToggle");
  const navBackdrop = document.getElementById("navBackdrop");

  function closeMobileNav() {
    header.classList.remove("nav-open");
  }
  mobileToggle.addEventListener("click", () => {
    header.classList.toggle("nav-open");
  });
  navBackdrop.addEventListener("click", closeMobileNav);

  document.querySelectorAll(".imagic-nav-collapse .imagic-nav-link:not(#megaMenuTrigger), .mega-menu-item").forEach((a) => {
    a.addEventListener("click", () => {
      if (window.innerWidth < 992) closeMobileNav();
    });
  });

  const megaWrap = document.getElementById("megaMenuWrap");
  const megaTrigger = document.getElementById("megaMenuTrigger");
  megaTrigger.addEventListener("click", (e) => {
    if (window.innerWidth < 992) {
      e.preventDefault();
      e.stopImmediatePropagation();
      megaWrap.classList.toggle("open");
    }
  });

  /* ---------------------------------------------------------------------
     Scroll reveal (GSAP + ScrollTrigger) — fade/translate, staggered
     --------------------------------------------------------------------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    if (!reducedMotion) {
      // Hero entrance sequence on load
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .to(".hero .eyebrow", { opacity: 1, y: 0, duration: 0.7, delay: 0.2 })
        .to(".hero-headline .line-inner", { y: "0%", duration: 0.9, stagger: 0.12 }, "-=0.35")
        .to(".hero-lead", { opacity: 1, y: 0, duration: 0.7 }, "-=0.45")
        .to(".hero-actions", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
        .to(".hero-visual", { opacity: 1, y: 0, duration: 0.9 }, "-=0.5");

      // Generic reveal-up / reveal-fade for everything below the fold
      document.querySelectorAll("[data-reveal]").forEach((el) => {
        if (el.closest(".hero")) return; // hero handled by timeline above
        gsap.fromTo(
          el,
          { opacity: 0, y: el.classList.contains("reveal-fade") ? 0 : 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      // Process steps: sequential highlight of the dot as each enters view
      document.querySelectorAll("[data-process]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 75%",
          onEnter: () => el.classList.add("in-view"),
        });
      });
    } else {
      document.querySelectorAll("[data-reveal], .hero-lead, .hero-actions, .hero-visual, .hero .eyebrow, .line-inner").forEach((el) => {
        el.style.opacity = 1;
        el.style.transform = "none";
      });
    }
  }

  /* ---------------------------------------------------------------------
     Animated counters — trigger once when in viewport
     --------------------------------------------------------------------- */
  const counters = document.querySelectorAll("[data-count-to]");
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        counterObserver.unobserve(el);
        const target = parseFloat(el.getAttribute("data-count-to"));
        const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
        const suffix = el.getAttribute("data-suffix") || "";

        if (reducedMotion) {
          el.textContent = target.toFixed(decimals) + suffix;
          return;
        }

        const duration = 1400;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = target * eased;
          el.textContent = value.toFixed(decimals) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  /* ---------------------------------------------------------------------
     Interactive services switcher (click a row -> swap panel content)
     --------------------------------------------------------------------- */
  const svcRows = document.querySelectorAll(".svc-row");
  const svcPanelImgs = document.querySelectorAll(".svc-panel-img");
  const svcTags = document.getElementById("svcTags");
  const svcCta = document.getElementById("svcCta");

  const svcData = [
    { tags: ["Website UI", "Mobile UI", "Dashboard", "Software"], cta: "Explore Web & Software" },
    { tags: ["Discovery", "Prototype", "MVP", "Scale"], cta: "Explore Product Development" },
    { tags: ["Wireframes", "UI Kit", "Prototyping", "Testing"], cta: "Explore UI/UX Design" },
    { tags: ["Motion Graphics", "Color Grade", "Sound Design", "Edit"], cta: "Explore Video Editing" },
    { tags: ["Technical SEO", "Content Strategy", "Paid Media"], cta: "Explore SEO & Marketing" },
    { tags: ["Brand Strategy", "Visual Identity", "Logo & Kit"], cta: "Explore Brand Building" },
    { tags: ["Security Audit", "Penetration Testing", "Compliance"], cta: "Explore Data Security" },
  ];

  function setActiveService(index) {
    svcRows.forEach((row) => row.classList.toggle("active", row.dataset.panel === String(index)));
    svcPanelImgs.forEach((img) => img.classList.toggle("active", img.dataset.panelImg === String(index)));

    const data = svcData[index];
    if (window.gsap) {
      gsap.to(svcTags, { opacity: 0, duration: 0.18, onComplete: () => {
        svcTags.innerHTML = data.tags.map((t) => `<span>${t}</span>`).join("");
        gsap.to(svcTags, { opacity: 1, duration: 0.25 });
      }});
      gsap.to(svcCta, { opacity: 0, y: 6, duration: 0.18, onComplete: () => {
        svcCta.innerHTML = data.cta + ' <span class="arrow">&rarr;</span>';
        gsap.to(svcCta, { opacity: 1, y: 0, duration: 0.25 });
      }});
    } else {
      svcTags.innerHTML = data.tags.map((t) => `<span>${t}</span>`).join("");
      svcCta.innerHTML = data.cta + ' <span class="arrow">&rarr;</span>';
    }
  }

  svcRows.forEach((row) => {
    row.addEventListener("click", () => setActiveService(row.dataset.panel));
    row.addEventListener("mouseenter", () => {
      if (window.innerWidth >= 992) setActiveService(row.dataset.panel);
    });
  });

  /* ---------------------------------------------------------------------
     Testimonial carousel — auto-rotate + dot navigation
     --------------------------------------------------------------------- */
  const testiSlides = document.querySelectorAll(".testi-slide");
  const testiDots = document.querySelectorAll("#testiDots button");
  let testiIndex = 0;
  let testiTimer;

  function showTesti(index) {
    testiIndex = (index + testiSlides.length) % testiSlides.length;
    testiSlides.forEach((s, i) => s.classList.toggle("active", i === testiIndex));
    testiDots.forEach((d, i) => d.classList.toggle("active", i === testiIndex));
  }
  function startTestiAuto() {
    clearInterval(testiTimer);
    testiTimer = setInterval(() => showTesti(testiIndex + 1), 6000);
  }
  testiDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showTesti(parseInt(dot.dataset.slide, 10));
      startTestiAuto();
    });
  });
  if (testiSlides.length) startTestiAuto();

  /* ---------------------------------------------------------------------
     Smooth-scroll offset for fixed header on anchor links
     --------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = window.innerWidth < 992 ? 84 : 100;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
    });
  });
})();
