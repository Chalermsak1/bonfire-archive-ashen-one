import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { DarkSoulsHoloCard } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";
import "./app.css";

const sourceUrl = "https://threeui.com/hero/dark-souls-holo-card";
const repositoryUrl = "https://github.com/Chalermsak1/bonfire-archive-ashen-one";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="arrow-icon">
      {diagonal ? (
        <path d="M4 16 16 4M6 4h10v10" stroke="currentColor" strokeWidth="1.4" />
      ) : (
        <path d="M2 10h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.4" />
      )}
    </svg>
  );
}

function ArchiveCard({ compact = false, flipped = false }: { compact?: boolean; flipped?: boolean }) {
  return (
    <div className={`archive-card${compact ? " archive-card--compact" : ""}`} data-flipped={flipped} aria-hidden="true">
      <div className="archive-card__inner">
        <span className="archive-card__edge archive-card__edge--left" />
        <span className="archive-card__edge archive-card__edge--right" />
        <span className="archive-card__edge archive-card__edge--top" />
        <span className="archive-card__edge archive-card__edge--bottom" />
        <div className="archive-card__face archive-card__front">
          <div className="archive-card__world" />
          <img className="archive-card__knight" src="/archive/knight.webp" alt="" decoding="async" />
          <img className="archive-card__frame" src="/archive/frame.webp" alt="" decoding="async" />
          <div className="archive-card__shine" />
          <div className="archive-card__name">THE ASHEN ONE</div>
          <div className="archive-card__footer">LINK THE FIRE</div>
        </div>
        <div className="archive-card__face archive-card__back">
          <img src="/archive/sigil.webp" alt="" decoding="async" />
          <span>THE EMBER REMAINS</span>
        </div>
      </div>
    </div>
  );
}

const cardDetails = [
  { number: "01", title: "Engraved border", text: "A dark frame edged in worn gold gives the artwork the weight of a physical relic." },
  { number: "02", title: "Layered figure", text: "The figure sits apart from its backdrop, creating parallax as the card turns." },
  { number: "03", title: "Foil and fire", text: "Highlights travel across the face while the shrine casts a warmer light nearby." },
];

const craftNotes = [
  {
    number: "01",
    title: "Layered artwork",
    text: "The frame, figure, atmosphere, and foil highlights sit on separate layers so the card responds with a sense of depth.",
  },
  {
    number: "02",
    title: "Light that follows",
    text: "Pointer movement changes the tilt and the glint across the surface. A drag turns the object; a flip reveals its reverse.",
  },
  {
    number: "03",
    title: "A shrine beside it",
    text: "The sword, candles, and drifting embers give the card a setting. The scene becomes a small place to explore.",
  },
];

export function Scene() {
  const [active, setActive] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false);
  const [heroFlipped, setHeroFlipped] = useState(false);
  const [studyFlipped, setStudyFlipped] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(0);
  const experienceRef = useRef<HTMLElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const heroDragRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const ignoreHeroClickRef = useRef(false);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("webgl2");
      setWebglAvailable(Boolean(context));
      context?.getExtension("WEBGL_lose_context")?.loseContext();
    } catch {
      setWebglAvailable(false);
    }
  }, []);

  useEffect(() => {
    let frame = 0;
    const updateSection = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const current = ["story", "experience", "craft"].reduce((section, id) => {
          const top = document.getElementById(id)?.getBoundingClientRect().top ?? Infinity;
          return top <= window.innerHeight * 0.38 ? id : section;
        }, "top");
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

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    setFullscreenAvailable(Boolean(document.fullscreenEnabled));
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  useEffect(() => {
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    items.forEach((item) => {
      item.classList.add("reveal-ready");
      observer.observe(item);
    });
    return () => observer.disconnect();
  }, []);

  function enterExperience() {
    setMenuOpen(false);
    if (webglAvailable) setActive(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    experienceRef.current?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
  }

  function openFullscreen() {
    if (!stageWrapRef.current) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stageWrapRef.current.requestFullscreen();
  }

  function stopExperience() {
    if (document.fullscreenElement === stageWrapRef.current) void document.exitFullscreen();
    setActive(false);
  }

  function moveHeroCard(event: ReactPointerEvent<HTMLButtonElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const drag = heroDragRef.current;
    if (drag) {
      const deltaX = event.clientX - drag.x;
      const deltaY = event.clientY - drag.y;
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) drag.moved = true;
      event.currentTarget.style.setProperty("--orbit-x", `${Math.max(-22, Math.min(22, -deltaY / rect.height * 52)).toFixed(2)}deg`);
      event.currentTarget.style.setProperty("--orbit-y", `${Math.max(-145, Math.min(145, deltaX / rect.width * 230)).toFixed(2)}deg`);
      event.currentTarget.dataset.dragging = drag.moved ? "true" : "false";
    } else if (event.pointerType !== "touch") {
      event.currentTarget.style.setProperty("--orbit-x", `${(-y * 13).toFixed(2)}deg`);
      event.currentTarget.style.setProperty("--orbit-y", `${(x * 18).toFixed(2)}deg`);
    }
    event.currentTarget.style.setProperty("--glint-x", `${((x + 0.5) * 100).toFixed(0)}%`);
    event.currentTarget.style.setProperty("--glint-y", `${((y + 0.5) * 100).toFixed(0)}%`);
  }

  function resetHeroCard(event: ReactPointerEvent<HTMLButtonElement>) {
    if (heroDragRef.current) return;
    event.currentTarget.style.removeProperty("--orbit-x");
    event.currentTarget.style.removeProperty("--orbit-y");
    event.currentTarget.style.removeProperty("--glint-x");
    event.currentTarget.style.removeProperty("--glint-y");
  }

  function startHeroDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    heroDragRef.current = { x: event.clientX, y: event.clientY, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function endHeroDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = heroDragRef.current;
    if (drag?.moved) {
      ignoreHeroClickRef.current = true;
      window.setTimeout(() => { ignoreHeroClickRef.current = false; }, 0);
      if (Math.abs(event.clientX - drag.x) > 42) setHeroFlipped((flipped) => !flipped);
    }
    heroDragRef.current = null;
    delete event.currentTarget.dataset.dragging;
    event.currentTarget.style.removeProperty("--orbit-x");
    event.currentTarget.style.removeProperty("--orbit-y");
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function flipHeroCard() {
    if (ignoreHeroClickRef.current) {
      ignoreHeroClickRef.current = false;
      return;
    }
    setHeroFlipped((flipped) => !flipped);
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Bonfire Archive, back to top" onClick={() => setMenuOpen(false)}>
          <span className="brand__mark" aria-hidden="true">✦</span>
          <span className="brand__text">BONFIRE <em>ARCHIVE</em></span>
        </a>
        <nav className="desktop-nav" aria-label="Main navigation">
          <a href="#story" aria-current={activeSection === "story" ? "location" : undefined}>The story</a>
          <a href="#experience" aria-current={activeSection === "experience" ? "location" : undefined}>The relic</a>
          <a href="#craft" aria-current={activeSection === "craft" ? "location" : undefined}>Behind the build</a>
        </nav>
        <button className="header-cta" type="button" onClick={enterExperience}>
          Enter the archive <Arrow diagonal />
        </button>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"}<span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
        </button>
        {menuOpen && (
          <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">
            <a href="#story" aria-current={activeSection === "story" ? "location" : undefined} onClick={() => setMenuOpen(false)}>The story</a>
            <a href="#experience" aria-current={activeSection === "experience" ? "location" : undefined} onClick={() => setMenuOpen(false)}>The relic</a>
            <a href="#craft" aria-current={activeSection === "craft" ? "location" : undefined} onClick={() => setMenuOpen(false)}>Behind the build</a>
            <button type="button" onClick={enterExperience}>Enter the archive <Arrow /></button>
          </nav>
        )}
      </header>

      <main id="main">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero__landscape" aria-hidden="true" />
          <div className="hero__veil" aria-hidden="true" />
          <div className="hero__grain" aria-hidden="true" />
          <div className="hero__embers" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>
          <div className="hero__content">
            <div className="eyebrow"><span className="eyebrow__line" /> The Ashen Collection <span className="eyebrow__number">No. 001</span></div>
            <h1 id="hero-title">The <span>Ashen</span><br />One<span className="hero__period">.</span></h1>
            <p className="hero__lead">A relic of ash, light, and memory. Turn it in your hands. Follow the embers. See what remains.</p>
            <div className="hero__actions">
              <button className="button button--gold" type="button" onClick={enterExperience}>Explore the card <Arrow /></button>
              <a className="text-link" href="#story">Discover the story <span aria-hidden="true">↓</span></a>
            </div>
            <p className="hero__load-note"><span aria-hidden="true">✦</span> The full 3D shrine loads when you enter</p>
            <div className="hero__index" aria-label="Interactive digital collectible, edition one of one">
              <span>INTERACTIVE RELIC</span><span className="hero__index-rule" /><span>EDITION 001 / 001</span>
            </div>
          </div>
          <div className="hero__art">
            <div className="hero__halo" aria-hidden="true" />
            <div className="hero__card-wrap">
              <button className="hero__card-button" type="button" aria-pressed={heroFlipped} aria-label={heroFlipped ? "Show the front of The Ashen One card" : "Flip The Ashen One card to reveal its reverse"} onClick={flipHeroCard} onPointerDown={startHeroDrag} onPointerMove={moveHeroCard} onPointerUp={endHeroDrag} onPointerCancel={endHeroDrag} onPointerLeave={resetHeroCard}>
                <ArchiveCard flipped={heroFlipped} />
              </button>
            </div>
            <span className="hero__flip-hint" aria-hidden="true">{heroFlipped ? "DRAG TO TURN · TAP FOR FRONT" : "DRAG TO TURN · TAP TO FLIP"} <span>↗</span></span>
          </div>
        </section>

        <section className="introduction section-shell" id="story" aria-labelledby="story-title">
          <div className="section-heading" data-reveal>
            <span className="section-kicker">01 / The story</span>
            <h2 id="story-title">Some embers<br /><em>refuse to fade.</em></h2>
          </div>
          <div className="introduction__body" data-reveal>
            <p className="introduction__opening">A collectible artifact suspended between a fading world and the next spark.</p>
            <p>At its heart is The Ashen One: a holographic card whose engraved border, layered illustration, and changing light invite a closer look. Beside it, a candlelit sword shrine turns a single object into an atmosphere.</p>
            <a className="inline-link" href="#experience">See the relic in motion <Arrow /></a>
          </div>
        </section>

        <section className="experience section-shell" id="experience" ref={experienceRef} aria-labelledby="experience-title">
          <div className="experience__heading" data-reveal>
            <div>
              <span className="section-kicker">02 / The relic</span>
              <h2 id="experience-title">Hold the <em>moment.</em></h2>
            </div>
            <p>Move closer. The surface catches your light, the card follows your hand, and the world answers in embers.</p>
          </div>
            <div className="stage-wrap" ref={stageWrapRef}>
            <div className="stage-toolbar">
              <span><i className={`status-light${active ? " status-light--live" : ""}`} aria-hidden="true" /> {active ? "SCENE ACTIVE" : "INTERACTIVE SCENE"}</span>
              <span>THE ASHEN ONE / 001</span>
            </div>
            <div className="experience-stage">
              {active && webglAvailable ? (
                <DarkSoulsHoloCard variant="ashen-one" />
              ) : (
                <div className="stage-preview">
                  <div className="stage-preview__backdrop" />
                  <div className="stage-preview__ornament" aria-hidden="true">✦</div>
                  <ArchiveCard compact />
                  <div className="stage-preview__copy">
                    <span className="stage-preview__eyebrow">AN INTERACTIVE 3D RELIC</span>
                    <h3>The flame awaits.</h3>
                    <p>{webglAvailable ? "Turn the card, follow the light, and reveal its hidden face. The 3D scene loads when you enter." : "Your browser cannot open this WebGL scene. Explore the artwork and story below instead."}</p>
                    {webglAvailable && <button className="button button--gold" type="button" onClick={() => setActive(true)}>Awaken the card <Arrow /></button>}
                  </div>
                </div>
              )}
            </div>
            <div className="stage-footer">
              <span>RENDERED IN REAL TIME · THREE.JS / WEBGL</span>
              <div className="stage-footer__actions">
                {active && <button type="button" onClick={stopExperience}>Stop 3D scene</button>}
                {active && fullscreenAvailable && <button type="button" onClick={openFullscreen}>{isFullscreen ? "Exit fullscreen" : "Fullscreen"} <span aria-hidden="true">↗</span></button>}
              </div>
            </div>
          </div>
          <div className="controls" aria-label="Scene controls">
            <div className="controls__label">HOW TO EXPLORE <span>↘</span></div>
            <ul>
              <li><span className="controls__icon" aria-hidden="true">↗</span><strong>Move</strong><span>Tilt &amp; light</span></li>
              <li><span className="controls__icon" aria-hidden="true">⟲</span><strong>Drag</strong><span>Rotate</span></li>
              <li><span className="controls__icon" aria-hidden="true">◇</span><strong>Double-click / F</strong><span>Flip</span></li>
              <li><span className="controls__icon" aria-hidden="true">＋</span><strong>Scroll</strong><span>Zoom</span></li>
              <li><span className="controls__icon" aria-hidden="true">R</span><strong>Press R</strong><span>Reset</span></li>
            </ul>
          </div>
        </section>

        <section className="anatomy section-shell" id="anatomy" aria-labelledby="anatomy-title">
          <div className="anatomy__visual">
            <div className="anatomy__card" data-detail={selectedDetail}>
              <ArchiveCard compact flipped={studyFlipped} />
              {!studyFlipped && cardDetails.map((detail, index) => (
                <button key={detail.number} className={`anatomy__hotspot anatomy__hotspot--${index + 1}${selectedDetail === index ? " is-selected" : ""}`} type="button" aria-label={`Explore ${detail.title}`} aria-pressed={selectedDetail === index} onClick={() => setSelectedDetail(index)}>{detail.number}</button>
              ))}
            </div>
            <span className="anatomy__visual-index">ARTIFACT STUDY / {studyFlipped ? "REVERSE FACE" : "FRONT FACE"}</span>
            <button className="anatomy__turn" type="button" aria-pressed={studyFlipped} onClick={() => setStudyFlipped((flipped) => !flipped)}><span aria-hidden="true">⟲</span> {studyFlipped ? "Show front" : "Reveal reverse"}</button>
          </div>
          <div className="anatomy__copy" data-reveal>
            <span className="section-kicker">03 / The details</span>
            <h2 id="anatomy-title">Made to be<br /><em>looked at twice.</em></h2>
            <p className="anatomy__intro">Choose a detail to inspect the artwork, then turn the card to discover its reverse.</p>
            <div className="detail-list">
              {cardDetails.map((detail, index) => (
                <button type="button" key={detail.number} className={selectedDetail === index && !studyFlipped ? "is-selected" : ""} aria-pressed={selectedDetail === index && !studyFlipped} onClick={() => { setStudyFlipped(false); setSelectedDetail(index); }}>
                  <span>{detail.number}</span><span><strong>{detail.title}</strong><span>{detail.text}</span></span><span className="detail-list__arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="craft section-shell" id="craft" aria-labelledby="craft-title">
          <div className="craft__intro" data-reveal>
            <span className="section-kicker">04 / Behind the build</span>
            <h2 id="craft-title">An illusion with<br /><em>something to touch.</em></h2>
            <p>The visual is only part of the experience. The card reacts to gestures, adapts to the viewport, and gives the visitor control over when the 3D scene runs.</p>
          </div>
          <div className="craft-grid">
            {craftNotes.map((note) => (
              <article className="craft-card" key={note.number} data-reveal>
                <span className="craft-card__number">{note.number} / 03</span>
                <span className="craft-card__symbol" aria-hidden="true">{note.number === "01" ? "◈" : note.number === "02" ? "✧" : "✦"}</span>
                <h3>{note.title}</h3>
                <p>{note.text}</p>
              </article>
            ))}
          </div>
          <div className="build-note">
            <div>
              <span className="build-note__label">THE BUILD</span>
              <p>React + TypeScript host · Three.js r180 · Custom GLSL · Vite</p>
            </div>
            <p>The original renderer and embedded assets remain byte exact. This archive is the responsive experience around them.</p>
          </div>
          <a className="source-link" href={repositoryUrl} target="_blank" rel="noopener noreferrer">
            <span><small>OPEN SOURCE / PROJECT REPOSITORY</small><strong>Explore the code behind the archive</strong></span>
            <Arrow diagonal />
          </a>
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <div className="closing__glow" aria-hidden="true" />
          <span className="section-kicker">The archive remains open</span>
          <h2 id="closing-title">The fire<br /><em>is yours to find.</em></h2>
          <button className="button button--gold" type="button" onClick={enterExperience}>Return to the relic <Arrow /></button>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand brand--footer" href="#top"><span className="brand__mark" aria-hidden="true">✦</span><span className="brand__text">BONFIRE <em>ARCHIVE</em></span></a>
        <p>An independent interactive showcase built around the original <a href={sourceUrl} target="_blank" rel="noreferrer">ThreeUI Dark Souls Holo Card <Arrow diagonal /></a>.</p>
        <a href="#top" className="back-top">Back to top ↑</a>
      </footer>
    </>
  );
}
