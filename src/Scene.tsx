import { useEffect, useRef, useState, useCallback, type PointerEvent as ReactPointerEvent } from "react";
import { DarkSoulsHoloCard, type DarkSoulsHoloCardVariant } from "@designcodeio/threeui";
import { HeroRelic3D } from "./HeroRelic3D";
import "@designcodeio/threeui/style.css";
import "./app.css";

const sourceUrl = "https://threeui.com/hero/dark-souls-holo-card";
const repositoryUrl = "https://github.com/Chalermsak1/bonfire-archive-ashen-one";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="arrow-icon">
      {diagonal ? (
        <path d="M4 16 16 4M6 4h10v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M2 10h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="arrow-icon">
      <path d="M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlameIcon({ kindled = false }: { kindled?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className={`flame-icon${kindled ? " flame-icon--kindled" : ""}`}>
      <path
        d="M12 2c0 4-5 7-5 12a7 7 0 0 0 14 0c0-4.5-4-8-5.5-10.5-.5 2.5-2.5 4-4 4 0-2 1-4.2.5-5.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {kindled && (
        <circle cx="12" cy="15" r="3" fill="var(--ember-hot)" opacity="0.6" />
      )}
    </svg>
  );
}

function ArchiveCard({
  compact = false,
  flipped = false,
  highlightIndex,
}: {
  compact?: boolean;
  flipped?: boolean;
  highlightIndex?: number;
}) {
  return (
    <div
      className={`archive-card${compact ? " archive-card--compact" : ""}${highlightIndex !== undefined ? ` archive-card--highlight-${highlightIndex}` : ""}`}
      data-flipped={flipped}
      aria-hidden="true"
    >
      <div className="archive-card__inner">
        <span className="archive-card__edge archive-card__edge--left" />
        <span className="archive-card__edge archive-card__edge--right" />
        <span className="archive-card__edge archive-card__edge--top" />
        <span className="archive-card__edge archive-card__edge--bottom" />

        {/* Front Face */}
        <div className="archive-card__face archive-card__front">
          <div className="archive-card__world" />
          <img className="archive-card__knight" src="/archive/knight.webp" alt="" decoding="async" />
          <img className="archive-card__frame" src="/archive/frame.webp" alt="" decoding="async" />
          <div className="archive-card__shine" />
          <div className="archive-card__highlight-ring" />
          <div className="archive-card__name">THE ASHEN ONE</div>
          <div className="archive-card__footer">LINK THE FIRE</div>
        </div>

        {/* Back Face */}
        <div className="archive-card__face archive-card__back">
          <img src="/archive/sigil.webp" alt="" decoding="async" />
          <div className="archive-card__back-flame" />
          <span>THE EMBER REMAINS</span>
        </div>
      </div>
    </div>
  );
}

const cardDetails = [
  {
    number: "01",
    tag: "METALLURGIC RELIEF",
    title: "Engraved Gilded Border",
    spec: "Ornate frame · Gold-toned finish",
    text: "An ornate border surrounds the figure, with warm highlights that give the frame a weathered, gilded appearance.",
  },
  {
    number: "02",
    tag: "SPATIAL ENTITY",
    title: "The Champion of Ash",
    spec: "Layered artwork · Parallax",
    text: "The figure and the ruins sit on separate layers, creating a sense of depth as the card turns.",
  },
  {
    number: "03",
    tag: "DIFFRACTION GRATING",
    title: "Prismatic Foil & Embers",
    spec: "Interactive light · GLSL shader",
    text: "A shifting highlight moves across the surface as you explore the card.",
  },
];

const craftNotes = [
  {
    number: "01",
    badge: "PARALLAX GEOMETRY",
    metric: "4 Separate Depths",
    title: "Layered Dimensional Plane",
    text: "Chassis, warrior, ruins, and specular highlights exist as distinct spatial layers, delivering physical weight and optical parallax upon every tilt.",
  },
  {
    number: "02",
    badge: "DYNAMIC SPECULAR",
    metric: "GLSL Foil Shader",
    title: "Living Light Response",
    text: "Pointer-reactive angular calculations calculate micro-facet light bounce, transforming the card into a tactile, shifting metallic artifact.",
  },
  {
    number: "03",
    badge: "SANCTUARY AMBIANCE",
    metric: "Real-time Shrine",
    title: "Atmospheric Bonfire Setting",
    text: "A coiled sword, dripped tallow candles, and ember drifts ground the relic within a physical dark-fantasy altar rendered in real time.",
  },
];

export function Scene() {
  const [active, setActive] = useState(false);
  const [stageVariant, setStageVariant] = useState<DarkSoulsHoloCardVariant>("ashen-one");
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false);
  const [heroFlipped, setHeroFlipped] = useState(false);
  const [studyFlipped, setStudyFlipped] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(0);
  const [hearthKindled, setHearthKindled] = useState(true);
  const [kindlePulse, setKindlePulse] = useState(false);

  const experienceRef = useRef<HTMLElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  // Check WebGL availability
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
      setWebglAvailable(Boolean(context));
      const ext = context?.getExtension("WEBGL_lose_context");
      ext?.loseContext();
    } catch {
      setWebglAvailable(false);
    }
  }, []);

  // Active section tracking with requestAnimationFrame throttle
  useEffect(() => {
    let frame = 0;
    const updateSection = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const sections = ["chronicle", "story", "sanctuary", "experience", "anatomy", "foundry", "craft"];
        let current = "top";
        for (const id of sections) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.15) {
              current = id;
            }
          }
        }
        setActiveSection(current);
      });
    };

    updateSection();
    window.addEventListener("scroll", updateSection, { passive: true });
    window.addEventListener("resize", updateSection);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateSection);
      window.removeEventListener("resize", updateSection);
    };
  }, []);

  // Keep keyboard focus inside the mobile menu while it is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    items[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
      if (event.key !== "Tab" || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      menuToggleRef.current?.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  // Fullscreen change listener
  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    setFullscreenAvailable(Boolean(document.fullscreenEnabled));
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  // Reveal observer with immediate check to prevent stuck invisible elements
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach((item) => {
        item.classList.add("reveal-ready", "is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            entry.target.classList.remove("reveal-pending");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "300px 0px 300px 0px", threshold: 0 }
    );

    items.forEach((item) => {
      item.classList.add("reveal-ready");
      const rect = item.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.5 && rect.bottom > -200) {
        item.classList.add("is-visible");
      } else {
        item.classList.add("reveal-pending");
        observer.observe(item);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Subtle ambient mouse parallax in hero section
  const handleHeroMouseMove = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const hero = heroRef.current;
    if (!hero) return;
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    hero.style.setProperty("--parallax-x", `${(x * 20).toFixed(2)}px`);
    hero.style.setProperty("--parallax-y", `${(y * 14).toFixed(2)}px`);
  }, []);

  function enterExperience() {
    setMenuOpen(false);
    if (webglAvailable) setActive(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    experienceRef.current?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
  }

  function openFullscreen() {
    if (!stageWrapRef.current) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void stageWrapRef.current.requestFullscreen();
    }
  }

  function stopExperience() {
    if (document.fullscreenElement === stageWrapRef.current) {
      void document.exitFullscreen();
    }
    setActive(false);
  }

  function handleKindleHearth() {
    setKindlePulse(true);
    setHearthKindled(true);
    setTimeout(() => setKindlePulse(false), 1200);
  }

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {/* Atmospheric Global Grain & Vignette */}
      <div className="global-vignette" aria-hidden="true" />

      {/* ====================================================================
          1. RELIQUARY NAVIGATION HEADER
          ==================================================================== */}
      <header className="reliquary-header">
        <div className="reliquary-header__inner">
          {/* Brand Mark */}
          <a className="reliquary-brand" href="#top" aria-label="Bonfire Archive, back to top" onClick={() => setMenuOpen(false)}>
            <div className="reliquary-brand__icon" aria-hidden="true">
              <FlameIcon kindled={hearthKindled} />
              <div className="reliquary-brand__halo" />
            </div>
            <div className="reliquary-brand__titles">
              <span className="reliquary-brand__name">
                BONFIRE <em>ARCHIVE</em>
              </span>
              
            </div>
          </a>

          {/* Desktop Museum Navigation Bar */}
          <nav className="reliquary-nav" aria-label="Primary navigation">
            <a
              href="#chronicle"
              className={`reliquary-nav__link${activeSection === "chronicle" || activeSection === "story" ? " is-active" : ""}`}
              aria-current={activeSection === "chronicle" || activeSection === "story" ? "location" : undefined}
            >
              <span className="reliquary-nav__roman">I</span>
              <span className="reliquary-nav__text">The story</span>
            </a>
            <span className="reliquary-nav__divider" aria-hidden="true">✦</span>
            <a
              href="#sanctuary"
              className={`reliquary-nav__link${activeSection === "sanctuary" || activeSection === "experience" ? " is-active" : ""}`}
              aria-current={activeSection === "sanctuary" || activeSection === "experience" ? "location" : undefined}
            >
              <span className="reliquary-nav__roman">II</span>
              <span className="reliquary-nav__text">The relic</span>
            </a>
            <span className="reliquary-nav__divider" aria-hidden="true">✦</span>
            <a
              href="#anatomy"
              className={`reliquary-nav__link${activeSection === "anatomy" ? " is-active" : ""}`}
              aria-current={activeSection === "anatomy" ? "location" : undefined}
            >
              <span className="reliquary-nav__roman">III</span>
              <span className="reliquary-nav__text">Anatomy</span>
            </a>
            <span className="reliquary-nav__divider" aria-hidden="true">✦</span>
            <a
              href="#foundry"
              className={`reliquary-nav__link${activeSection === "foundry" || activeSection === "craft" ? " is-active" : ""}`}
              aria-current={activeSection === "foundry" || activeSection === "craft" ? "location" : undefined}
            >
              <span className="reliquary-nav__roman">IV</span>
              <span className="reliquary-nav__text">The build</span>
            </a>
          </nav>

          {/* Actions & Controls */}
          <div className="reliquary-header__actions">
            <button className="button-luxury button-relic-gold" type="button" onClick={enterExperience}>
              <span>Enter the shrine</span>
              <Arrow />
            </button>

            {/* Mobile Hamburger Button */}
            <button
              className="menu-toggle"
              type="button"
              ref={menuToggleRef}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? "Close menu" : "Open navigation menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="menu-toggle__line" />
              <span className="menu-toggle__line" />
            </button>
          </div>
        </div>
      </header>

      {/* Fullscreen Mobile Drawer */}
      {menuOpen && (
        <nav className="mobile-nav-drawer" id="mobile-nav" ref={menuRef} aria-label="Mobile navigation">
          <div className="mobile-nav-drawer__header">
            <span className="mobile-nav-drawer__title">ARCHIVE CODEX</span>
            <button
              type="button"
              className="mobile-nav-drawer__close"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          <div className="mobile-nav-drawer__links">
            <a href="#chronicle" onClick={() => setMenuOpen(false)}>
              <span className="mobile-nav-drawer__roman">I</span>
              <span>The story</span>
            </a>
            <a href="#sanctuary" onClick={() => setMenuOpen(false)}>
              <span className="mobile-nav-drawer__roman">II</span>
              <span>The relic</span>
            </a>
            <a href="#anatomy" onClick={() => setMenuOpen(false)}>
              <span className="mobile-nav-drawer__roman">III</span>
              <span>Artifact Anatomy</span>
            </a>
            <a href="#foundry" onClick={() => setMenuOpen(false)}>
              <span className="mobile-nav-drawer__roman">IV</span>
              <span>The Relic Foundry</span>
            </a>
          </div>
          <button className="button-luxury button-relic-gold mobile-nav-drawer__cta" type="button" onClick={enterExperience}>
            <span>Enter 3D Sanctuary</span>
            <Arrow />
          </button>
        </nav>
      )}

      <main id="main">
        {/* ====================================================================
            2. HERO SECTION — MONUMENTAL CENTRAL ALTAR ARCHITECTURE
            ==================================================================== */}
        <section
          className={`hero-monument${kindlePulse ? " hero-monument--pulse" : ""}`}
          id="monument"
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          aria-labelledby="hero-title"
        >
          <div id="top" className="scroll-anchor" />
          <div id="hero" className="scroll-anchor" />
          {/* Ambient Lighting & Particles */}
          <div className="hero-monument__backdrop" aria-hidden="true" />
          <div className="hero-monument__godray" aria-hidden="true" />
          <div className="hero-monument__hearth-glow" aria-hidden="true" />

          {/* Floating Embers in 3D Space */}
          <div className="hero-monument__embers" aria-hidden="true">
            {Array.from({ length: 22 }, (_, index) => (
              <i key={index} className={`hero-ember hero-ember--${(index % 5) + 1}`} />
            ))}
          </div>

          <div className="hero-editorial">
            <div className="hero-editorial__copy" data-reveal>
              <p className="hero-editorial__eyebrow"><span /> THE ASHEN COLLECTION <span className="hero-editorial__edition">NO. 001</span></p>
              <h1 id="hero-title">The Ashen <em>One.</em></h1>
              <p className="hero-editorial__lead">A relic of ash, light, and memory. Turn the card, follow the embers, and discover what remains.</p>
              <div className="hero-editorial__actions">
                <button className="button-luxury button-relic-gold" type="button" onClick={enterExperience}>
                  <span>Explore the shrine</span><Arrow />
                </button>
                <a className="hero-editorial__story" href="#chronicle">Discover the story <span aria-hidden="true">↓</span></a>
              </div>
              <p className="hero-editorial__note"><span aria-hidden="true">✦</span> An interactive digital collectible</p>
            </div>
            <div className="hero-editorial__art">
              <div className="hero-editorial__halo" aria-hidden="true" />
              <div className="hero-relic-canvas-wrap">
                <HeroRelic3D flipped={heroFlipped} onFlip={() => setHeroFlipped((f) => !f)} />
              </div>
              <div className="hero-editorial__controls">
                <span>DRAG TO ROTATE · TAP TO FLIP</span>
                <button type="button" onClick={() => setHeroFlipped((f) => !f)} aria-pressed={heroFlipped}>
                  <span aria-hidden="true">⟲</span> {heroFlipped ? "Show front" : "Turn card"}
                </button>
              </div>
            </div>
            <div className="hero-editorial__foot"><span>AN INTERACTIVE RELIC</span><span>EDITION 001 / 001</span></div>
          </div>
        </section>

        {/* ====================================================================
            3. SECTION 01 — THE ILLUMINATED ARCHAEOLOGICAL CODEX (CHRONICLE)
            ==================================================================== */}
        <section className="chronicle-codex" id="chronicle" aria-labelledby="chronicle-title">
          <div id="story" className="scroll-anchor" />
          <div className="chronicle-codex__container">
            {/* Chapter Header */}
            <div className="chapter-crest" data-reveal>
              <div className="chapter-crest__number">
                <span>✦</span>
                <span>CHAPTER I</span>
                <span>✦</span>
              </div>
              <h2 id="chronicle-title" className="chapter-crest__title">
                The Ember That Would Not Die
              </h2>
              <span className="chapter-crest__sub">HISTORICAL RECORD OF THE KILN ARTIFACT</span>
            </div>

            {/* Monumental Italic Pull-Quote */}
            <blockquote className="chronicle-quote" data-reveal>
              <p>
                "When the fire fades, the lords go without thrones. In the twilight of Lothric, an Unkindled champion arose—bound not by destiny, but by the relentless hunger of ash."
              </p>
            </blockquote>

            {/* Staggered Archaeological Narrative Fragments */}
            <div className="codex-fragments">
              {/* Fragment 01 */}
              <article className="codex-fragment codex-fragment--left" data-reveal>
                <div className="codex-fragment__seal">
                  <span className="codex-fragment__latin">CINIS AD CINEREM</span>
                  <span className="codex-fragment__num">§ 01</span>
                </div>
                <h3 className="codex-fragment__heading">The Forging at the Kiln</h3>
                <p className="codex-fragment__text">
                  <span className="drop-cap">W</span>hen the flame begins to fade, the Ashen One rises from the ashes. This digital relic captures that journey in a frame of worn gold, shadow, and light.
                </p>
                <div className="codex-fragment__rule" />
              </article>

              {/* Fragment 02 */}
              <article className="codex-fragment codex-fragment--right" data-reveal>
                <div className="codex-fragment__seal">
                  <span className="codex-fragment__latin">IGNIS REVERBERAT</span>
                  <span className="codex-fragment__num">§ 02</span>
                </div>
                <h3 className="codex-fragment__heading">The Coiled Sword Sanctuary</h3>
                <p className="codex-fragment__text">
                  A coiled sword and candlelight give the card a place in the world. Turn the relic to watch the light move across its surface and discover the mark on its reverse.
                </p>
                <div className="codex-fragment__rule" />
              </article>
            </div>

            {/* Full-width Curatorial Dimension Ledger */}
            <div className="reliquary-ledger" data-reveal>
              <div className="reliquary-ledger__header">
                <span className="reliquary-ledger__badge">CURATORIAL SPECIFICATION MATRIX</span>
                <span className="reliquary-ledger__code">ARCHIVE REGISTRY // LOTHRIC-001</span>
              </div>
              <div className="reliquary-ledger__grid">
                <div className="reliquary-ledger__cell">
                  <span className="reliquary-ledger__num">I</span>
                  <span className="reliquary-ledger__label">FORMAT</span>
                  <strong className="reliquary-ledger__val">DIGITAL COLLECTIBLE</strong>
                  <span className="reliquary-ledger__sub">AN INTERACTIVE EXPERIENCE</span>
                </div>
                <div className="reliquary-ledger__cell">
                  <span className="reliquary-ledger__num">II</span>
                  <span className="reliquary-ledger__label">ARTWORK</span>
                  <strong className="reliquary-ledger__val">GOLD-TONED FRAME</strong>
                  <span className="reliquary-ledger__sub">ORNATE DIGITAL ARTWORK</span>
                </div>
                <div className="reliquary-ledger__cell">
                  <span className="reliquary-ledger__num">III</span>
                  <span className="reliquary-ledger__label">OPTICAL CORE</span>
                  <strong className="reliquary-ledger__val">4-DEPTH SPATIAL PARALLAX</strong>
                  <span className="reliquary-ledger__sub">GLSL DIFFRACTION SHADER</span>
                </div>
                <div className="reliquary-ledger__cell">
                  <span className="reliquary-ledger__num">IV</span>
                  <span className="reliquary-ledger__label">SACRIFICIAL SEAL</span>
                  <strong className="reliquary-ledger__val">GOLDEN REVERSE SIGIL</strong>
                  <span className="reliquary-ledger__sub">"THE EMBER REMAINS"</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            4. SECTION 02 — THE GRAND RELIQUARY SANCTUARY (THE RELIC)
            ==================================================================== */}
        <section className="sanctuary-chamber" id="sanctuary" ref={experienceRef} aria-labelledby="sanctuary-title">
          <div id="experience" className="scroll-anchor" />
          <div id="vault" className="scroll-anchor" />
          <div className="sanctuary-chamber__container">
            {/* Header */}
            <div className="sanctuary-chamber__header" data-reveal>
              <div className="section-kicker">
                <span className="kicker-gem">✦</span>
                <span>02 / The Relic Stage</span>
              </div>
              <h2 id="sanctuary-title" className="sanctuary-chamber__title">
                The Sacred <em>Reliquary.</em>
              </h2>
              <p className="sanctuary-chamber__lead">
                Step inside the sacred chamber. Turn the card across three dimensions, inspect the metallic rim-light, and uncover its eternal dark sign.
              </p>
            </div>

            {/* Sanctuary Showcase Stage Wrap */}
            <div className="sanctuary-vault-stage" ref={stageWrapRef} data-reveal>
              {/* Ornate Corner Brackets */}
              <span className="corner-bracket corner-bracket--tl" aria-hidden="true">⌜</span>
              <span className="corner-bracket corner-bracket--tr" aria-hidden="true">⌝</span>
              <span className="corner-bracket corner-bracket--bl" aria-hidden="true">⌞</span>
              <span className="corner-bracket corner-bracket--br" aria-hidden="true">⌟</span>

              {/* Stage Command Toolbar */}
              <div className="vault-toolbar">
                <div className="vault-toolbar__status">
                  <i className={`status-dot${active ? " status-dot--live" : ""}`} aria-hidden="true" />
                  <span>{active ? "3D SCENE ACTIVE" : "3D SCENE READY"}</span>
                </div>

                {/* Token Variant Selector */}
                <div className="vault-tokens" role="group" aria-label="Select relic variant">
                  <button
                    type="button"
                    className={`vault-token-btn${stageVariant === "ashen-one" ? " is-active" : ""}`}
                    aria-pressed={stageVariant === "ashen-one"}
                    onClick={() => { setStageVariant("ashen-one"); if (webglAvailable) setActive(true); }}
                  >
                    <span className="vault-token-btn__num">01</span>
                    <span>THE ASHEN ONE</span>
                  </button>
                  <button
                    type="button"
                    className={`vault-token-btn${stageVariant === "cindermane" ? " is-active" : ""}`}
                    aria-pressed={stageVariant === "cindermane"}
                    onClick={() => { setStageVariant("cindermane"); if (webglAvailable) setActive(true); }}
                  >
                    <span className="vault-token-btn__num">02</span>
                    <span>CINDERMANE EDITION</span>
                  </button>
                </div>

                {/* Actions */}
                <div className="vault-toolbar__actions">
                  {active && (
                    <button className="vault-action-btn" type="button" onClick={stopExperience}>
                      Close scene
                    </button>
                  )}
                  {active && fullscreenAvailable && (
                    <button className="vault-action-btn" type="button" onClick={openFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Vault"}>
                      <ExpandIcon />
                      <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Stage Viewport */}
              <div className="vault-viewport">
                {active && webglAvailable ? (
                  <DarkSoulsHoloCard
                    variant={stageVariant}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                    }}
                  />
                ) : (
                  <div className="vault-dormant-altar">
                    <div className="vault-dormant-altar__glow" />
                    <div className="vault-dormant-altar__card-wrap">
                      <ArchiveCard compact />
                    </div>
                    <div className="vault-dormant-altar__content">
                      <span className="vault-dormant-altar__kicker">RELIQUARY CHAMBER</span>
                      <h3>The hearth awaits your spark.</h3>
                      <p>
                        {webglAvailable
                          ? "Enter the scene to turn the card, explore the shrine, and watch the light move across its surface."
                          : "Your browser cannot display the 3D scene. Explore the card details below instead."}
                      </p>
                      {webglAvailable && (
                        <button className="button-luxury button-relic-gold" type="button" onClick={() => setActive(true)}>
                          <span>Kindle the 3D Shrine</span>
                          <Arrow />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Vault Astrolabe HUD */}
              <div className="vault-hud">
                <div className="vault-hud__cell">
                  <span className="vault-hud__icon" aria-hidden="true">↗</span>
                  <div className="vault-hud__info">
                    <strong>Move pointer</strong>
                    <span>Tilt &amp; light</span>
                  </div>
                </div>
                <div className="vault-hud__cell">
                  <span className="vault-hud__icon" aria-hidden="true">⟲</span>
                  <div className="vault-hud__info">
                    <strong>Drag</strong>
                    <span>Turn the card</span>
                  </div>
                </div>
                <div className="vault-hud__cell">
                  <span className="vault-hud__icon" aria-hidden="true">◇</span>
                  <div className="vault-hud__info">
                    <strong>Double-click / F</strong>
                    <span>Flip the card</span>
                  </div>
                </div>
                <div className="vault-hud__cell">
                  <span className="vault-hud__icon" aria-hidden="true">⊕</span>
                  <div className="vault-hud__info">
                    <strong>Scroll wheel</strong>
                    <span>Zoom in &amp; out</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            5. SECTION 03 — CONSERVATOR'S INSPECTION WORKBENCH (ANATOMY)
            ==================================================================== */}
        <section className="anatomy-studio" id="anatomy" aria-labelledby="anatomy-title">
          <div className="anatomy-studio__container">
            {/* Header */}
            <div className="anatomy-studio__header" data-reveal>
              <div className="section-kicker">
                <span className="kicker-gem">✦</span>
                <span>03 / Artifact Anatomy</span>
              </div>
              <h2 id="anatomy-title" className="anatomy-studio__title">
                The Conservator's <em>Workbench.</em>
              </h2>
              <p className="anatomy-studio__lead">
                Select a detail to take a closer look at the border, the figure, and the light on the card.
              </p>
            </div>

            {/* Precision Workbench Layout */}
            <div className="workbench-grid">
              {/* Left Column: Curatorial Analysis Dossier */}
              <div className="workbench-dossier" data-reveal>
                <div className="workbench-dossier__badge">CURATORIAL REPORT</div>
                <div className="workbench-dossier__card">
                  {studyFlipped ? (
                    <div className="dossier-entry dossier-entry--sigil">
                      <div className="dossier-entry__header">
                        <span className="dossier-entry__tag">REVERSE ARTIFACT SEAL</span>
                        <span className="dossier-entry__index">SEAL 01</span>
                      </div>
                      <h3 className="dossier-entry__title">The Sigil of the Unkindled</h3>
                      <p className="dossier-entry__desc">
                        A circular sigil and a quiet inscription complete the reverse side of the digital relic.
                      </p>
                      <div className="dossier-entry__meta">
                        <span>SIDE: REVERSE</span>
                        <span>DETAIL: GOLDEN SIGIL</span>
                      </div>
                    </div>
                  ) : (
                    <div className="dossier-entry">
                      <div className="dossier-entry__header">
                        <span className="dossier-entry__tag">{cardDetails[selectedDetail].tag}</span>
                        <span className="dossier-entry__index">DETAIL {cardDetails[selectedDetail].number}</span>
                      </div>
                      <h3 className="dossier-entry__title">{cardDetails[selectedDetail].title}</h3>
                      <p className="dossier-entry__desc">{cardDetails[selectedDetail].text}</p>
                      <div className="dossier-entry__meta">
                        <span>SPECIFICATION: {cardDetails[selectedDetail].spec}</span>
                        <span>DIGITAL RELIC · NO. 001</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Turntable Control */}
                <button
                  type="button"
                  className="workbench-turntable-btn"
                  onClick={() => setStudyFlipped((f) => !f)}
                  aria-pressed={studyFlipped}
                >
                  <span className="workbench-turntable-btn__icon" aria-hidden="true">⟲</span>
                  <span>{studyFlipped ? "Inspect Front Foil Face" : "Inspect Reverse Dark Sign"}</span>
                </button>
              </div>

              {/* Center Column: The Mounted Artifact Plinth */}
              <div className="workbench-plinth-wrap" data-reveal>
                <div className="workbench-plinth">
                  <div className="workbench-plinth__grid" aria-hidden="true">
                    <span className="workbench-coord workbench-coord--tl">X: 001.4</span>
                    <span className="workbench-coord workbench-coord--tr">Y: 002.8</span>
                    <span className="workbench-coord workbench-coord--bl">Z: +0.08</span>
                    <span className="workbench-coord workbench-coord--br">SCALE: 1:1</span>
                  </div>

                  <div className="workbench-card-housing">
                    <ArchiveCard compact flipped={studyFlipped} highlightIndex={studyFlipped ? undefined : selectedDetail} />

                    {/* Interactive Hotspot Reticles */}
                    {!studyFlipped &&
                      cardDetails.map((detail, index) => (
                        <button
                          key={detail.number}
                          type="button"
                          className={`reticle-pin reticle-pin--${index + 1}${selectedDetail === index ? " is-active" : ""}`}
                          aria-label={`Inspect ${detail.title}`}
                          aria-pressed={selectedDetail === index}
                          onClick={() => setSelectedDetail(index)}
                        >
                          <span className="reticle-pin__ring" />
                          <span className="reticle-pin__dot" />
                          <span className="reticle-pin__num">{detail.number}</span>
                        </button>
                      ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Focal Detail Selectors */}
              <div className="workbench-focals" data-reveal>
                <div className="workbench-focals__title">SELECT FOCAL RETICLE</div>
                <div className="focal-list" role="group" aria-label="Choose a card detail">
                  {cardDetails.map((detail, index) => (
                    <button
                      key={detail.number}
                      type="button"
                        className={`focal-item${!studyFlipped && selectedDetail === index ? " is-selected" : ""}`}
                      aria-pressed={!studyFlipped && selectedDetail === index}
                      onClick={() => {
                        setStudyFlipped(false);
                        setSelectedDetail(index);
                      }}
                    >
                      <div className="focal-item__num">{detail.number}</div>
                      <div className="focal-item__body">
                        <span className="focal-item__tag">{detail.tag}</span>
                        <strong className="focal-item__title">{detail.title}</strong>
                      </div>
                      <span className="focal-item__arrow" aria-hidden="true">↗</span>
                    </button>
                  ))}

                  <button
                    type="button"
                    className={`focal-item focal-item--sigil${studyFlipped ? " is-selected" : ""}`}
                    aria-pressed={studyFlipped}
                    onClick={() => setStudyFlipped(true)}
                  >
                    <div className="focal-item__num">✦</div>
                    <div className="focal-item__body">
                      <span className="focal-item__tag">REVERSE COVENANT</span>
                      <strong className="focal-item__title">Dark Sign Sacrificial Seal</strong>
                    </div>
                    <span className="focal-item__arrow" aria-hidden="true">↗</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            6. SECTION 04 — THE ARCHITECTURAL BLUEPRINT (THE FOUNDRY)
            ==================================================================== */}
        <section className="foundry-blueprint" id="foundry" aria-labelledby="foundry-title">
          <div id="craft" className="scroll-anchor" />
          <div className="foundry-blueprint__container">
            {/* Blueprint Header */}
            <div className="foundry-header" data-reveal>
              <div className="foundry-header__kicker">
                <span className="blueprint-tag">SPECIFICATION NO. R180</span>
                <span>ENGINEERING BLUEPRINT // ARCHITECT LEDGER</span>
              </div>
              <h2 id="foundry-title" className="foundry-header__title">
                The Anatomy of an <em>Illusion.</em>
              </h2>
              <p className="foundry-header__desc">
                Explore how layered artwork, lighting, and interactive motion bring the relic to life.
              </p>
            </div>

            {/* Split Schematic Matrix */}
            <div className="blueprint-matrix">
              {/* Left Panel: Spatial Pipeline Flowchart */}
              <div className="blueprint-panel blueprint-panel--pipeline" data-reveal>
                <div className="blueprint-panel__header">
                  <span className="blueprint-panel__tag">01 // PIPELINE DECONSTRUCTION</span>
                  <span className="blueprint-panel__grid-coord">GRID A-12</span>
                </div>
                <div className="pipeline-steps">
                  <div className="pipeline-step">
                    <span className="pipeline-step__num">01</span>
                    <div className="pipeline-step__content">
                      <strong>Asset Deconstruction</strong>
                      <p>The frame, figure, and ruined landscape are separated into layers to create depth.</p>
                    </div>
                  </div>
                  <div className="pipeline-connector">↓</div>
                  <div className="pipeline-step">
                    <span className="pipeline-step__num">02</span>
                    <div className="pipeline-step__content">
                      <strong>Quad-Plane Depth Projection</strong>
                      <p>Planes positioned at Z = -0.05, +0.03, +0.08, and +0.09. Motion and easing create a sense of parallax as the card turns.</p>
                    </div>
                  </div>
                  <div className="pipeline-connector">↓</div>
                  <div className="pipeline-step">
                    <span className="pipeline-step__num">03</span>
                    <div className="pipeline-step__content">
                      <strong>Custom GLSL Holographic Shader</strong>
                      <p>Surface normal dot light direction drives a spectral dispersion gradient, creating rainbow micro-facet foil highlights.</p>
                    </div>
                  </div>
                  <div className="pipeline-connector">↓</div>
                  <div className="pipeline-step">
                    <span className="pipeline-step__num">04</span>
                    <div className="pipeline-step__content">
                      <strong>ACES Tone Mapping &amp; Culling</strong>
                      <p>The scene pauses rendering when it is outside the viewport to reduce unnecessary work.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Panel: Live GLSL Shader Code Block */}
              <div className="blueprint-panel blueprint-panel--shader" data-reveal>
                <div className="blueprint-panel__header">
                  <span className="blueprint-panel__tag">02 // GLSL FRAGMENT SHADER</span>
                  <span className="blueprint-panel__grid-coord">SRC: HeroRelic3D.tsx</span>
                </div>
                <div className="shader-code-box">
                  <pre className="shader-code">
                    <code>
{`// Production Shader: src/HeroRelic3D.tsx (GLSL Fragment)
uniform vec3 uLightPos;
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  vec3 lightDir = normalize(uLightPos -
    vec3((vUv.x - 0.5) * 3.6, (vUv.y - 0.5) * 5.4, 0.2));
  vec3 halfVector = normalize(lightDir + viewDir);

  float NdotH = max(dot(normal, halfVector), 0.0);
  float spec = pow(NdotH, 32.0);

  // Iridescent holographic spectrum with restrained luxury dispersion
  float angle = dot(normal, viewDir);
  vec3 spectrum = 0.5 + 0.5 * cos(vec3(0.0, 0.33, 0.67) * 6.28318 +
    angle * 3.2 + vUv.y * 2.8 + uTime * 0.2);
  vec3 antiqueGold = vec3(0.92, 0.78, 0.48);
  vec3 foil = mix(antiqueGold, spectrum, 0.35) * spec * 1.1;

  // Subtle corner glint hotspot
  vec2 hotspotOrigin = vec2(0.5 + uLightPos.x * 0.1, 0.5 + uLightPos.y * 0.1);
  float dist = distance(vUv, hotspotOrigin);
  float hotspot = smoothstep(0.38, 0.0, dist) * 0.18;

  vec3 finalColor = foil + vec3(0.95, 0.75, 0.35) * hotspot;
  float alpha = clamp(spec * 0.85 + hotspot * 0.4, 0.0, 0.65);

  gl_FragColor = vec4(finalColor, alpha);
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Certified Immutable Repository Block */}
            <a className="verified-repo-block" href={repositoryUrl} target="_blank" rel="noopener noreferrer" data-reveal>
              <div className="verified-repo-block__info">
                <div className="verified-repo-block__badge">
                  <span className="git-dot" />
                  <span>OPEN SOURCE</span>
                </div>
                <strong className="verified-repo-block__title">Explore the source on GitHub</strong>
                <code className="verified-repo-block__cmd">git clone https://github.com/Chalermsak1/bonfire-archive-ashen-one.git</code>
              </div>
              <div className="verified-repo-block__arrow">
                <Arrow diagonal />
              </div>
            </a>
          </div>
        </section>

        {/* ====================================================================
            7. SECTION 05 — CEREMONIAL BONFIRE PYRE & CRYPT CONCLUSION
            ==================================================================== */}
        <section className={`crypt-conclusion${kindlePulse ? " crypt-conclusion--pulse" : ""}`} id="pyre" aria-labelledby="closing-title">
          <div className="crypt-conclusion__glow" aria-hidden="true" />
          <div className="crypt-conclusion__embers" aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <i key={i} className={`crypt-ember crypt-ember--${(i % 4) + 1}`} />
            ))}
          </div>

          <div className="crypt-conclusion__content" data-reveal>
            {/* Interactive Bonfire Trigger */}
            <button
              type="button"
              className="bonfire-altar-btn"
              onClick={handleKindleHearth}
              aria-label="Kindle the Sacred Bonfire"
            >
              <div className="bonfire-altar-btn__flame">
                <FlameIcon kindled={hearthKindled} />
              </div>
              <span className="bonfire-altar-btn__hint">CLICK TO KINDLE THE BONFIRE</span>
            </button>

            <div className="section-kicker">
              <span className="kicker-gem">✦</span>
              <span>The Sanctuary Remains Rekindled</span>
            </div>

            <h2 id="closing-title" className="crypt-conclusion__title">
              Even when the fire fades, <br />
              <em>the memory of ash endures.</em>
            </h2>

            <div className="crypt-conclusion__actions">
              <button className="button-luxury button-relic-gold" type="button" onClick={enterExperience}>
                <span>Ascend to the Relic</span>
                <Arrow />
              </button>
              <a className="button-luxury button-hollow" href={repositoryUrl} target="_blank" rel="noopener noreferrer">
                <span>View Source Code</span>
                <Arrow diagonal />
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ====================================================================
          8. THE CRYPT FOOTER
          ==================================================================== */}
      <footer className="crypt-footer">
        <div className="crypt-footer__inner">
          <div className="crypt-footer__brand">
            <a className="reliquary-brand" href="#top" aria-label="Bonfire Archive, back to top">
              <FlameIcon kindled={hearthKindled} />
              <span className="reliquary-brand__name">
                BONFIRE <em>ARCHIVE</em>
              </span>
            </a>
            <span className="crypt-footer__epigraph">A Digital Reliquary Dedicated to the Unkindled</span>
          </div>

          <div className="crypt-footer__provenance">
            <p>
              Independent interactive collectible showcase forged around the original{" "}
              <a href={sourceUrl} target="_blank" rel="noreferrer">
                ThreeUI Dark Souls Holo Card <Arrow diagonal />
              </a>
              . Preserving real-time Three.js r180 and custom GLSL diffraction mathematics byte-for-byte.
            </p>
          </div>

          <div className="crypt-footer__bottom">
            <span className="crypt-footer__year">ANNO DOMINI MMXXVI · COVENANT № 001</span>
            <a href="#top" className="crypt-footer__backtop">
              <span>Ascend to top</span>
              <span aria-hidden="true">↑</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
