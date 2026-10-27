import { useEffect, useRef, useState } from "react";
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

function ArchiveCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`archive-card${compact ? " archive-card--compact" : ""}`} aria-hidden="true">
      <div className="archive-card__world" />
      <img className="archive-card__knight" src="/archive/knight.webp" alt="" decoding="async" />
      <img className="archive-card__frame" src="/archive/frame.webp" alt="" decoding="async" />
      <div className="archive-card__name">THE ASHEN ONE</div>
      <div className="archive-card__footer">LINK THE FIRE</div>
    </div>
  );
}

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
  const experienceRef = useRef<HTMLElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);

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
          <div className="hero__content">
            <div className="eyebrow"><span className="eyebrow__line" /> The Ashen Collection <span className="eyebrow__number">No. 001</span></div>
            <h1 id="hero-title">The <span>Ashen</span><br />One<span className="hero__period">.</span></h1>
            <p className="hero__lead">A relic of ash, light, and memory. Turn it in your hands. Follow the embers. See what remains.</p>
            <div className="hero__actions">
              <button className="button button--gold" type="button" onClick={enterExperience}>Explore the card <Arrow /></button>
              <a className="text-link" href="#story">Discover the story <span aria-hidden="true">↓</span></a>
            </div>
            <p className="hero__load-note"><span aria-hidden="true">✦</span> Interactive 3D loads when you enter</p>
            <div className="hero__index" aria-label="Interactive digital collectible, edition one of one">
              <span>INTERACTIVE RELIC</span><span className="hero__index-rule" /><span>EDITION 001 / 001</span>
            </div>
          </div>
          <div className="hero__art">
            <div className="hero__halo" aria-hidden="true" />
            <ArchiveCard />
            <span className="hero__art-label hero__art-label--top">A WORLD<br />BETWEEN FLAME<br />AND ASH</span>
            <span className="hero__art-label hero__art-label--bottom">01 — THE RELIC</span>
          </div>
          <a className="scroll-cue" href="#story"><span className="scroll-cue__line" /> Scroll to discover</a>
        </section>

        <section className="introduction section-shell" id="story" aria-labelledby="story-title">
          <div className="section-heading">
            <span className="section-kicker">01 / The story</span>
            <h2 id="story-title">Some embers<br /><em>refuse to fade.</em></h2>
          </div>
          <div className="introduction__body">
            <p className="introduction__opening">A collectible artifact suspended between a fading world and the next spark.</p>
            <p>At its heart is The Ashen One: a holographic card whose engraved border, layered illustration, and changing light invite a closer look. Beside it, a candlelit sword shrine turns a single object into an atmosphere.</p>
            <a className="inline-link" href="#experience">See the relic in motion <Arrow /></a>
          </div>
        </section>

        <section className="experience section-shell" id="experience" ref={experienceRef} aria-labelledby="experience-title">
          <div className="experience__heading">
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
            <div className="anatomy__card"><ArchiveCard compact /></div>
            <span className="anatomy__visual-index">ARTIFACT STUDY / FRONT FACE</span>
          </div>
          <div className="anatomy__copy">
            <span className="section-kicker">03 / The details</span>
            <h2 id="anatomy-title">Made to be<br /><em>looked at twice.</em></h2>
            <p className="anatomy__intro">The front is a portrait. The back holds a quiet emblem. Between them, every shift of light changes the object you see.</p>
            <div className="detail-list">
              <div><span>01</span><p><strong>Engraved border</strong><br />A dark frame edged in worn gold gives the artwork the weight of a physical relic.</p></div>
              <div><span>02</span><p><strong>Layered figure</strong><br />The figure sits apart from its backdrop, creating parallax as the card turns.</p></div>
              <div><span>03</span><p><strong>Foil and fire</strong><br />Highlights travel across the face while the shrine casts a warmer light nearby.</p></div>
            </div>
          </div>
        </section>

        <section className="craft section-shell" id="craft" aria-labelledby="craft-title">
          <div className="craft__intro">
            <span className="section-kicker">04 / Behind the build</span>
            <h2 id="craft-title">An illusion with<br /><em>something to touch.</em></h2>
            <p>The visual is only part of the experience. The card reacts to gestures, adapts to the viewport, and gives the visitor control over when the 3D scene runs.</p>
          </div>
          <div className="craft-grid">
            {craftNotes.map((note) => (
              <article className="craft-card" key={note.number}>
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
