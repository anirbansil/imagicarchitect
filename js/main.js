/* ==========================================================================
   IMAGIC — Site behavior & motion
   ========================================================================== */
(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------------
     Scroll progress bar + sticky header + active nav link
     --------------------------------------------------------------------- */
  const progressBar = document.getElementById("scrollProgress");
  const siteHeader = document.getElementById("siteHeader");
  const headerContainer = document.getElementById("headerContainer");
  const headerBar = document.getElementById("headerBar");
  const navLinks = document.querySelectorAll(".nav-link");
  const sections = Array.from(document.querySelectorAll("main > section[id], footer[id]"));

  function onScroll() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY;
    const max = doc.scrollHeight - doc.clientHeight;
    const progress = max > 0 ? scrollTop / max : 0;
    progressBar.style.transform = `scaleX(${progress})`;

    const scrolled = scrollTop > 24;
    siteHeader.classList.toggle("is-scrolled", scrolled);
    headerContainer.classList.toggle("is-scrolled", scrolled);
    headerBar.classList.toggle("is-scrolled", scrolled);

    let current = sections[0] && sections[0].id;
    const scrollPos = scrollTop + 140;
    sections.forEach((sec) => {
      if (scrollPos >= sec.offsetTop) current = sec.id;
    });
    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.charAt(0) !== "#") return; // real page links keep whatever state the page set
      link.classList.toggle("active", href === "#" + current);
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------------------
     Desktop mega menu
     --------------------------------------------------------------------- */
  const megaWrap = document.getElementById("megaMenuWrap");
  const megaTrigger = document.getElementById("megaMenuTrigger");
  const megaPanel = document.getElementById("megaMenuPanel");
  const megaChevron = document.getElementById("megaChevron");
  let megaOpen = false;
  let megaCloseTimer = null;

  function setMegaOpen(open) {
    megaOpen = open;
    megaPanel.classList.toggle("open", open);
    megaChevron.style.transform = open ? "rotate(180deg)" : "";
    megaTrigger.setAttribute("aria-expanded", String(open));
  }
  function openMegaMenu() {
    clearTimeout(megaCloseTimer);
    setMegaOpen(true);
  }
  function scheduleMegaClose() {
    clearTimeout(megaCloseTimer);
    megaCloseTimer = setTimeout(() => setMegaOpen(false), 150);
  }
  [megaWrap, megaPanel].forEach((el) => {
    el.addEventListener("mouseenter", openMegaMenu);
    el.addEventListener("mouseleave", scheduleMegaClose);
  });
  megaTrigger.addEventListener("focus", openMegaMenu);
  document.addEventListener("click", (e) => {
    if (megaOpen && !megaWrap.contains(e.target) && !megaPanel.contains(e.target)) setMegaOpen(false);
  });
  document.querySelectorAll(".mega-item").forEach((a) => {
    a.addEventListener("click", () => setMegaOpen(false));
  });

  /* ---------------------------------------------------------------------
     Mobile menu
     --------------------------------------------------------------------- */
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenuClose = document.getElementById("mobileMenuClose");
  const mobileMenuBackdrop = document.getElementById("mobileMenuBackdrop");
  const mobileServicesToggle = document.getElementById("mobileServicesToggle");
  const mobileServicesList = document.getElementById("mobileServicesList");
  const mobileServicesChevron = document.getElementById("mobileServicesChevron");

  function openMobileMenu() {
    mobileMenu.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeMobileMenu() {
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
  }
  mobileMenuBtn.addEventListener("click", openMobileMenu);
  mobileMenuClose.addEventListener("click", closeMobileMenu);
  mobileMenuBackdrop.addEventListener("click", closeMobileMenu);
  document.querySelectorAll(".mobile-nav-links").forEach((a) => {
    if (a.tagName === "A") a.addEventListener("click", closeMobileMenu);
  });
  mobileServicesToggle.addEventListener("click", () => {
    const isOpen = mobileServicesList.classList.toggle("flex");
    mobileServicesList.classList.toggle("hidden", !isOpen);
    mobileServicesChevron.style.transform = isOpen ? "rotate(180deg)" : "";
    mobileServicesToggle.setAttribute("aria-expanded", String(isOpen));
  });

  /* ---------------------------------------------------------------------
     Scroll reveal (GSAP + ScrollTrigger)
     --------------------------------------------------------------------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    if (!reducedMotion) {
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      heroTl
        .to("#home [data-reveal]:first-of-type", { opacity: 1, y: 0, duration: 0.7, delay: 0.15 })
        .to(".hero-line", { y: "0%", duration: 0.9, stagger: 0.12 }, "-=0.35")
        .to("#home p[data-reveal]", { opacity: 1, y: 0, duration: 0.7 }, "-=0.45")
        .to("#home .flex-wrap[data-reveal]", { opacity: 1, y: 0, duration: 0.6 }, "-=0.4")
        .to("#home .aspect-\\[4\\/5\\]", { opacity: 1, y: 0, duration: 0.9 }, "-=0.5");

      gsap.set("#home [data-reveal], .hero-line, .aspect-\\[4\\/5\\][data-reveal]", { opacity: 0, y: 24 });
      gsap.set(".hero-line", { y: "110%", opacity: 1 });

      document.querySelectorAll("[data-reveal]").forEach((el) => {
        if (el.closest("#home")) return;
        gsap.fromTo(
          el,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          }
        );
      });

      document.querySelectorAll("[data-process]").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 78%",
          onEnter: () => el.querySelector(".dot").classList.add("in-view"),
        });
      });

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => ScrollTrigger.refresh());
      }
      window.addEventListener("load", () => ScrollTrigger.refresh());
    } else {
      document.querySelectorAll("[data-reveal], .hero-line").forEach((el) => {
        el.style.opacity = 1;
        el.style.transform = "none";
      });
    }
  }

  /* ---------------------------------------------------------------------
     Animated counters
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
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => counterObserver.observe(el));

  /* ---------------------------------------------------------------------
     Services accordion + sticky panel
     --------------------------------------------------------------------- */
  const svcRows = document.querySelectorAll(".svc-row");
  const svcPanelImg = document.getElementById("svcPanelImg");
  const svcPanelNum = document.getElementById("svcPanelNum");
  const svcPanelTitle = document.getElementById("svcPanelTitle");
  const svcPanelTags = document.getElementById("svcPanelTags");
  const svcPanelLink = document.getElementById("svcPanelLink");

  const svcData = [
    { num: "01", title: "Web &amp; Software Development", img: "assets/images/code-network.jpg", tags: ["Custom Web Applications", "SaaS Platform Development", "API &amp; Integrations"], linkText: "Explore Web &amp; Software Development", href: "services/web-software-development.html" },
    { num: "02", title: "Product Development", img: "assets/images/dashboard-cube.jpg", tags: ["Discovery &amp; Strategy", "MVP Development", "Scaling &amp; Iteration"], linkText: "Explore Product Development", href: "#services" },
    { num: "03", title: "UI/UX Design", img: "assets/images/device-mockups.jpg", tags: ["User Research", "Interface Design", "Prototyping"], linkText: "Explore UI/UX Design", href: "#services" },
    { num: "04", title: "Video Editing", img: "assets/images/silk-ribbon.jpg", tags: ["Motion Graphics", "Color Grading", "Sound Design"], linkText: "Explore Video Editing", href: "#services" },
    { num: "05", title: "SEO &amp; Digital Marketing", img: "assets/images/glass-macro.webp", tags: ["Technical SEO", "Content Strategy", "Paid Media"], linkText: "Explore SEO &amp; Marketing", href: "#services" },
    { num: "06", title: "Brand Building", img: "assets/images/silk-ribbon.jpg", tags: ["Brand Strategy", "Visual Identity", "Logo &amp; Kit"], linkText: "Explore Brand Building", href: "#services" },
    { num: "07", title: "Data Security", img: "assets/images/security-shield.jpg", tags: ["Security Audits", "Penetration Testing", "Compliance"], linkText: "Explore Data Security", href: "#services" },
  ];

  function setActiveService(index) {
    svcRows.forEach((row) => row.classList.toggle("active", row.dataset.panel === String(index)));
    const data = svcData[index];

    const applyPanel = () => {
      svcPanelImg.src = data.img;
      svcPanelNum.textContent = data.num;
      svcPanelTitle.innerHTML = data.title;
      svcPanelTags.innerHTML = data.tags.map((t) => `<span class="text-[0.7rem] font-medium px-2.5 py-1 rounded-full glass-dark text-ivory/90">${t}</span>`).join("");
      svcPanelLink.href = data.href;
      svcPanelLink.innerHTML = data.linkText + svcPanelLink.querySelector("svg").outerHTML;
    };

    if (window.gsap) {
      gsap.to(svcPanelImg, { opacity: 0, duration: 0.2, onComplete: () => {
        applyPanel();
        gsap.to(svcPanelImg, { opacity: 1, duration: 0.35 });
      }});
    } else {
      applyPanel();
    }
  }

  svcRows.forEach((row) => {
    const link = row.querySelector("a");
    row.addEventListener("mouseenter", () => setActiveService(row.dataset.panel));
    link.addEventListener("focus", () => setActiveService(row.dataset.panel));
  });

  /* ---------------------------------------------------------------------
     Testimonial carousel — prev/next + dots
     --------------------------------------------------------------------- */
  const testimonials = [
    { quote: "They grew our organic traffic by sixty percent in two quarters — with a strategy we could actually sustain ourselves.", name: "David Park", role: "Marketing Director, Pulse Commerce", tag: "SEO &amp; Digital Marketing" },
    { quote: "IMAGIC didn't just build our platform — they understood the business behind it. The result felt like it was always meant to exist.", name: "Sarah Chen", role: "Chief Product Officer, Northwind Finance", tag: "Web &amp; Software Development" },
    { quote: "The redesign paid for itself in months. Support tickets dropped and our customers finally say the product feels effortless.", name: "Elena Rossi", role: "Head of Product, Atlas Reef", tag: "UI/UX Design" },
    { quote: "From idea to launch in a fraction of the time we expected. They treated our product like their own and it shows in every detail.", name: "Marcus Chen", role: "Founder, Verde Collective", tag: "Product Development" },
  ];

  const testiQuote = document.getElementById("testiQuote");
  const testiDotsWrap = document.getElementById("testiDots");

  if (testiQuote && testiDotsWrap) {
    const testiName = document.getElementById("testiName");
    const testiRole = document.getElementById("testiRole");
    const testiTag = document.getElementById("testiTag");
    let testiIndex = 0;

    testimonials.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "h-1 rounded-full transition-all bg-burgundy/20";
      dot.setAttribute("aria-label", `Go to testimonial ${i + 1}`);
      dot.addEventListener("click", () => showTesti(i));
      testiDotsWrap.appendChild(dot);
    });

    function showTesti(index) {
      testiIndex = (index + testimonials.length) % testimonials.length;
      const t = testimonials[testiIndex];
      const apply = () => {
        testiQuote.innerHTML = `&ldquo;${t.quote}&rdquo;`;
        testiName.textContent = t.name;
        testiRole.textContent = t.role;
        testiTag.innerHTML = t.tag;
      };
      if (window.gsap) {
        gsap.to("#testiContent", { opacity: 0, duration: 0.2, onComplete: () => {
          apply();
          gsap.to("#testiContent", { opacity: 1, duration: 0.35 });
        }});
      } else {
        apply();
      }
      Array.from(testiDotsWrap.children).forEach((dot, i) => {
        dot.classList.toggle("w-10", i === testiIndex);
        dot.classList.toggle("w-4", i !== testiIndex);
        dot.classList.toggle("bg-imagic-yellow", i === testiIndex);
        dot.classList.toggle("bg-burgundy/20", i !== testiIndex);
      });
    }
    document.getElementById("testiPrev").addEventListener("click", () => showTesti(testiIndex - 1));
    document.getElementById("testiNext").addEventListener("click", () => showTesti(testiIndex + 1));
    showTesti(0);
  }

  /* ---------------------------------------------------------------------
     Portfolio filters (portfolio.html only)
     --------------------------------------------------------------------- */
  const filterBtns = document.querySelectorAll(".filter-btn");
  const portfolioCards = document.querySelectorAll(".portfolio-card");

  if (filterBtns.length && portfolioCards.length) {
    const emptyMsg = document.getElementById("portfolioEmpty");

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterBtns.forEach((b) => b.classList.toggle("is-active", b === btn));

        const filter = btn.dataset.filter;
        let visibleCount = 0;
        portfolioCards.forEach((card) => {
          const categories = (card.dataset.categories || "").split(" ");
          const show = filter === "all" || categories.includes(filter);
          card.style.display = show ? "" : "none";
          if (show) visibleCount++;
        });
        if (emptyMsg) emptyMsg.classList.toggle("hidden", visibleCount > 0);
      });
    });
  }

  /* ---------------------------------------------------------------------
     Contact form (contact.html only) — no backend, simulate success
     --------------------------------------------------------------------- */
  const contactForm = document.getElementById("contactForm");
  const contactSuccess = document.getElementById("contactSuccess");
  if (contactForm && contactSuccess) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      contactForm.classList.add("hidden");
      contactSuccess.classList.remove("hidden");
    });
  }

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
      const offset = window.innerWidth < 1024 ? 84 : 100;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: reducedMotion ? "auto" : "smooth" });
    });
  });
})();
