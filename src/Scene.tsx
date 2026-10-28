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
          <img className="archive-card__knight" src="/archive/knight.webp" alt="" loading="lazy" decoding="async" />
          <img className="archive-card__frame" src="/archive/frame.webp" alt="" loading="lazy" decoding="async" />
          <div className="archive-card__shine" />
          <div className="archive-card__highlight-ring" />
          <div className="archive-card__name">THE ASHEN ONE</div>
          <div className="archive-card__footer">LINK THE FIRE</div>
        </div>

        {/* Back Face */}
        <div className="archive-card__face archive-card__back">
          <img src="/archive/sigil.webp" alt="" loading="lazy" decoding="async" />
          <div className="archive-card__back-flame" />
          <span>THE EMBER REMAINS</span>
        </div>
      </div>
    </div>
  );
}

const storyMoments = [
  { number: "01", label: "The fading world", title: "A world in twilight.", text: "The old world stands in the shadow of a fading flame. Among its ruins, a single ember still holds the promise of what comes next.", image: "/archive/ashen-cathedral.jpg" },
  { number: "02", label: "The Ashen One", title: "The one who rises.", text: "From the ashes comes an Unkindled champion. This relic captures that journey in layers of worn gold, shadow, and light.", image: "/archive/ruins.webp" },
  { number: "03", label: "The last ember", title: "The fire awaits.", text: "A coiled sword and the glow of a bonfire mark a place to pause. Step closer, turn the card, and discover the story in its details.", image: "/archive/ashen-cathedral.jpg" },
];

const storySceneLines = [
  "Stone arches and empty halls hold the traces of a world that has outlived its age. Follow the light through the ruins and discover what still remains.",
  "Within the frame, armor and landscape are held on separate layers. As the relic turns, the figure seems to move against the world behind it.",
  "At the hearth, a sword and a circle of fire offer a moment of stillness. Enter the shrine and look closer at the relic in the light of the embers.",
];

const shrineSecrets = [
  { symbol: "⚔", label: "The coiled sword", title: "A blade at rest.", text: "At the heart of the shrine, the sword anchors the composition and draws the eye toward the fire." },
  { symbol: "✦", label: "The bonfire", title: "A spark in the dark.", text: "Warm candlelight and drifting embers give the scene its quiet contrast to the cool darkness surrounding it." },
  { symbol: "◉", label: "The dark sign", title: "The mark on the reverse.", text: "Turn the relic to discover its circular seal. Its restrained design offers a counterpoint to the ornate front." },
];

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

function AmbientSound() {
  const contextRef = useRef<AudioContext | null>(null);
  const [playing, setPlaying] = useState(false);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const playAccent = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("button, a") : null;
      const context = contextRef.current;
      if (!target || target.closest("[data-sound-toggle]") || !context || context.state !== "running") return;
      const tone = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      tone.type = "sine";
      tone.frequency.setValueAtTime(target.closest(".workbench-plinth-wrap, .workbench-focals") ? 570 : 410, now);
      tone.frequency.exponentialRampToValueAtTime(220, now + .16);
      gain.gain.setValueAtTime(.0001, now);
      gain.gain.exponentialRampToValueAtTime(.025, now + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .2);
      tone.connect(gain).connect(context.destination);
      tone.start(now); tone.stop(now + .21);
      tone.onended = () => { tone.disconnect(); gain.disconnect(); };
    };
    document.addEventListener("click", playAccent);
    return () => document.removeEventListener("click", playAccent);
  }, [playing]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden && contextRef.current?.state === "running") {
        void contextRef.current.suspend();
        setPlaying(false);
      }
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => {
      document.removeEventListener("visibilitychange", pauseWhenHidden);
      if (contextRef.current && contextRef.current.state !== "closed") void contextRef.current.close();
    };
  }, []);

  async function toggleSound() {
    try {
      if (playing && contextRef.current) {
        await contextRef.current.suspend();
        setPlaying(false);
        return;
      }
      if (!contextRef.current) {
        const AudioConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioConstructor) {
          setUnavailable(true);
          return;
        }
        const context = new AudioConstructor();
        contextRef.current = context;
        const master = context.createGain();
        master.gain.value = 0.08;
        master.connect(context.destination);
        const noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
        const samples = noise.getChannelData(0);
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
        const source = context.createBufferSource();
        source.buffer = noise;
        source.loop = true;
        const filter = context.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 420;
        const noiseGain = context.createGain();
        noiseGain.gain.value = 0.45;
        source.connect(filter).connect(noiseGain).connect(master);
        source.start();
        const drone = context.createOscillator();
        drone.type = "sine";
        drone.frequency.value = 58;
        const droneGain = context.createGain();
        droneGain.gain.value = 0.12;
        drone.connect(droneGain).connect(master);
        drone.start();
      }
      await contextRef.current.resume();
      setPlaying(contextRef.current.state === "running");
    } catch {
      setUnavailable(true);
      setPlaying(false);
    }
  }

  return (
    <button data-sound-toggle type="button" aria-pressed={playing} disabled={unavailable} onClick={() => void toggleSound()} title={unavailable ? "Sound is unavailable in this browser" : "Toggle ambient sound"}>
      <span aria-hidden="true">♫</span> {unavailable ? "Sound unavailable" : playing ? "Sound on" : "Sound off"}
    </button>
  );
}

export function Scene() {
  const [active, setActive] = useState(false);
  const [stageVariant, setStageVariant] = useState<DarkSoulsHoloCardVariant>("ashen-one");
  const [webglAvailable, setWebglAvailable] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("top");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false);
  const [heroFlipped, setHeroFlipped] = useState(false);
  const [lightMode, setLightMode] = useState<"ember" | "moon" | "prism">("ember");
  const [autoSpin, setAutoSpin] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [heroFullscreen, setHeroFullscreen] = useState(false);
  const [storyMoment, setStoryMoment] = useState(0);
  const [studyFlipped, setStudyFlipped] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState(0);
  const [studyZoomed, setStudyZoomed] = useState(false);
  const [studyCompare, setStudyCompare] = useState(false);
  const [hearthKindled, setHearthKindled] = useState(false);
  const [kindlePulse, setKindlePulse] = useState(false);
  const [shrineSecret, setShrineSecret] = useState(0);
  const [shrineState, setShrineState] = useState("loading");
  const [shrineSlow, setShrineSlow] = useState(false);
  const [enteringRelic, setEnteringRelic] = useState<DarkSoulsHoloCardVariant | null>(null);
  const transitionTimer = useRef<number | undefined>(undefined);
  const transitionEndTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => { window.clearTimeout(transitionTimer.current); window.clearTimeout(transitionEndTimer.current); }, []);

  const experienceRef = useRef<HTMLElement>(null);
  const stageWrapRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const heroArtRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  // Fragment targets are rendered by React, after the browser's initial anchor lookup.
  useEffect(() => {
    if (!window.location.hash) return;
    let id: string;
    try {
      id = decodeURIComponent(window.location.hash.slice(1));
    } catch {
      return;
    }
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

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
        const sections = ["collection", "chronicle", "story", "sanctuary", "experience", "anatomy", "foundry", "craft"];
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
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
        document.documentElement.style.setProperty("--page-progress", String(progress));
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
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) setAutoSpin(false);
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  // Observe the registered renderer wrapper: ready means its document loaded, not that all 3D assets finished.
  useEffect(() => {
    if (!active || !webglAvailable) return;
    setShrineState("loading");
    setShrineSlow(false);
    const viewport = stageWrapRef.current?.querySelector(".vault-viewport");
    if (!viewport) return;
    const update = () => {
      const state = viewport.querySelector(".dark-souls-holo-card")?.getAttribute("data-state") ?? "loading";
      setShrineState(state);
    };
    const observer = new MutationObserver(update);
    observer.observe(viewport, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-state"] });
    update();
    const timer = window.setTimeout(() => setShrineSlow(true), 10000);
    return () => { observer.disconnect(); window.clearTimeout(timer); };
  }, [active, webglAvailable, stageVariant]);

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
    const updateFullscreen = () => {
      setIsFullscreen(document.fullscreenElement === stageWrapRef.current);
      setHeroFullscreen(document.fullscreenElement === heroArtRef.current);
    };
    setFullscreenAvailable(Boolean(document.fullscreenEnabled));
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);

  // Pause decorative motion when the scene is off screen or the tab is hidden.
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-ambient]"));
    const visible = new WeakSet<Element>();
    const sync = (item: HTMLElement) => { item.dataset.ambientActive = String(!document.hidden && visible.has(item)); };
    if (typeof IntersectionObserver === "undefined") {
      items.forEach((item) => { visible.add(item); sync(item); });
      const update = () => items.forEach(sync);
      document.addEventListener("visibilitychange", update);
      return () => document.removeEventListener("visibilitychange", update);
    }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
      sync(entry.target as HTMLElement);
    }), { rootMargin: "40px" });
    items.forEach((item) => observer.observe(item));
    const update = () => items.forEach(sync);
    document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
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
    hero.style.setProperty("--cursor-x", `${((x + 0.5) * 100).toFixed(1)}%`);
    hero.style.setProperty("--cursor-y", `${((y + 0.5) * 100).toFixed(1)}%`);
  }, []);

  function moveCollectionLight(event: ReactPointerEvent<HTMLElement>) {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--gallery-x", `${((event.clientX - rect.left) / rect.width * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty("--gallery-y", `${((event.clientY - rect.top) / rect.height * 100).toFixed(1)}%`);
    event.currentTarget.style.setProperty("--gallery-shift-x", `${(((event.clientX - rect.left) / rect.width - .5) * 14).toFixed(1)}px`);
    event.currentTarget.style.setProperty("--gallery-shift-y", `${(((event.clientY - rect.top) / rect.height - .5) * 10).toFixed(1)}px`);
  }
  function resetCollectionLight(event: ReactPointerEvent<HTMLElement>) {
    event.currentTarget.style.removeProperty("--gallery-x");
    event.currentTarget.style.removeProperty("--gallery-y");
    event.currentTarget.style.removeProperty("--gallery-shift-x");
    event.currentTarget.style.removeProperty("--gallery-shift-y");
  }

  function enterExperience() {
    setMenuOpen(false);
    if (webglAvailable) setActive(true);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    experienceRef.current?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
    experienceRef.current?.focus({ preventScroll: true });
  }

  function openRelic(variant: DarkSoulsHoloCardVariant) {
    if (enteringRelic) return;
    setStageVariant(variant);
    setEnteringRelic(variant);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) { setEnteringRelic(null); enterExperience(); return; }
    transitionTimer.current = window.setTimeout(() => {
      if (webglAvailable) setActive(true);
      experienceRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
      experienceRef.current?.focus({ preventScroll: true });
    }, 350);
    transitionEndTimer.current = window.setTimeout(() => setEnteringRelic(null), 1050);
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

  function flipHero() {
    setAutoSpin(false);
    setHeroFlipped((flipped) => !flipped);
  }

  function moveWorkbenchLight(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, (event.clientX - rect.left) / rect.width * 100));
    const y = Math.max(0, Math.min(100, (event.clientY - rect.top) / rect.height * 100));
    event.currentTarget.style.setProperty("--inspect-x", `${x.toFixed(1)}%`);
    event.currentTarget.style.setProperty("--inspect-y", `${y.toFixed(1)}%`);
  }

  function toggleHeroFullscreen() {
    if (document.fullscreenElement === heroArtRef.current) {
      void document.exitFullscreen().catch(() => {});
    } else if (heroArtRef.current) {
      void heroArtRef.current.requestFullscreen().catch(() => {});
    }
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

      {enteringRelic && <div className={`relic-passage relic-passage--${enteringRelic}`} aria-hidden="true"><span>✦</span></div>}
      <div className="sr-only" role="status" aria-live="polite">{enteringRelic ? `Entering ${enteringRelic === "ashen-one" ? "The Ashen One" : "Cindermane"} shrine` : ""}</div>

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
            <a href="#collection" className={`reliquary-nav__link${activeSection === "collection" ? " is-active" : ""}`} aria-current={activeSection === "collection" ? "location" : undefined}>Collection</a>
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
            <a href="#collection" onClick={() => setMenuOpen(false)}><span className="mobile-nav-drawer__roman">✦</span><span>The collection</span></a>
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

      <main id="main" tabIndex={-1}>
        {/* ====================================================================
            2. HERO SECTION — MONUMENTAL CENTRAL ALTAR ARCHITECTURE
            ==================================================================== */}
        <section
          className={`hero-monument${kindlePulse ? " hero-monument--pulse" : ""}`}
          id="monument"
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          aria-labelledby="hero-title"
          data-light={lightMode}
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
              <p className="hero-editorial__lead">A relic of ash, light, and memory. Turn the card and discover the world within.</p>
              <div className="hero-editorial__actions">
                <button className="button-luxury button-relic-gold" type="button" onClick={enterExperience}>
                  <span>Explore the shrine</span><Arrow />
                </button>
                <a className="hero-editorial__story" href="#collection">Explore the collection <span aria-hidden="true">↓</span></a>
              </div>
              <p className="hero-editorial__note"><span aria-hidden="true">✦</span> Drag or tap the card to explore</p>
            </div>
            <div className="hero-editorial__art" ref={heroArtRef} data-light={lightMode}>
              <div className="hero-editorial__halo" aria-hidden="true" />
              <div className="hero-relic-canvas-wrap">
                <HeroRelic3D flipped={heroFlipped} onFlip={flipHero} lightMode={lightMode} autoSpin={autoSpin} onReady={() => window.dispatchEvent(new Event("bonfire:ready"))} />
              </div>
              <div className="hero-editorial__controls">
                <span>DRAG TO ROTATE · TAP TO FLIP</span>
                <button type="button" onClick={flipHero} aria-pressed={heroFlipped}>
                  <span aria-hidden="true">⟲</span> {heroFlipped ? "Show front" : "Turn card"}
                </button>
                <AmbientSound />
                {heroFullscreen && <button type="button" onClick={toggleHeroFullscreen}>Exit full view</button>}
              </div>
              <details className="relic-settings">
                <summary><span><span aria-hidden="true">✧</span> Personalize your relic</span><span className="relic-settings__expand" aria-hidden="true">＋</span></summary>
              <div className="relic-lab" aria-label="Card effects">
                <div className="relic-lab__lighting" role="group" aria-label="Choose lighting">
                  <span className="relic-lab__label">LIGHT</span>
                  {(["ember", "moon", "prism"] as const).map((mode) => (
                    <button key={mode} type="button" className="relic-lab__mode" aria-pressed={lightMode === mode} disabled={!webglAvailable} onClick={() => setLightMode(mode)}>
                      <span className={`relic-lab__dot relic-lab__dot--${mode}`} aria-hidden="true" />{mode}
                    </button>
                  ))}
                </div>
                <div className="relic-lab__actions">
                  <button type="button" aria-pressed={autoSpin} disabled={reducedMotion || !webglAvailable} title={reducedMotion ? "Auto rotation is unavailable while reduced motion is enabled" : undefined} onClick={() => setAutoSpin((spinning) => !spinning)}>
                    <span aria-hidden="true">⟳</span> {autoSpin ? "Stop spin" : "Auto spin"}
                  </button>
                  {fullscreenAvailable && (
                    <button type="button" onClick={toggleHeroFullscreen}><ExpandIcon /> {heroFullscreen ? "Exit view" : "Full view"}</button>
                  )}
                </div>
              </div>
              </details>
            </div>
            <div className="hero-editorial__foot"><span>AN INTERACTIVE RELIC</span><span>EDITION 001 / 001</span></div>
          </div>
        </section>

        <nav className="journey-strip" aria-label="Explore the archive">
          <div className="journey-strip__intro"><span>THE ARCHIVE</span><strong>Choose your path<span aria-hidden="true"> ↘</span></strong></div>
          <a href="#chronicle" className="journey-strip__item">
            <span className="journey-strip__number">01</span><span><strong>The story</strong><small>A world of flame and ash</small></span><span className="journey-strip__arrow" aria-hidden="true">↗</span>
          </a>
          <button type="button" className="journey-strip__item" onClick={enterExperience}>
            <span className="journey-strip__number">02</span><span><strong>The shrine</strong><small>Enter the interactive scene</small></span><span className="journey-strip__arrow" aria-hidden="true">↗</span>
          </button>
          <a href="#anatomy" className="journey-strip__item">
            <span className="journey-strip__number">03</span><span><strong>The details</strong><small>Look closer at the relic</small></span><span className="journey-strip__arrow" aria-hidden="true">↗</span>
          </a>
        </nav>

        <section className="relic-collection" id="collection" aria-labelledby="collection-title">
          <div className="relic-collection__inner">
            <div className="collection-heading" data-reveal>
              <div><p className="collection-eyebrow">✦ &nbsp; THE ARCHIVE / 002 RELICS</p><h2 id="collection-title">Two tales. <em>One flame.</em></h2></div>
              <p>Two relics, two worlds. Choose an artifact and step into its interactive shrine.</p>
            </div>
            <p className="collection-mobile-hint">Swipe to explore the collection <span aria-hidden="true">→</span></p>
            <div className="collection-grid" role="group" aria-label="Relic collection, swipe or use the arrow keys to scroll" tabIndex={0}>
              <article className={`collection-relic${enteringRelic === "ashen-one" ? " is-entering" : ""}`} data-reveal data-ambient onPointerDown={moveCollectionLight} onPointerMove={moveCollectionLight} onPointerLeave={resetCollectionLight} onPointerCancel={resetCollectionLight}>
                <div className="collection-relic__art collection-relic__art--ash"><img className="collection-relic__scene" src="/archive/ruins.webp" alt="" loading="lazy" decoding="async" /><img className="collection-relic__subject" src="/archive/knight.webp" alt="" loading="lazy" decoding="async" /><span className="collection-relic__number" aria-hidden="true">01 / ASH</span><div className="ambient-particles" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div><div className="collection-atmosphere" /><div className="collection-pedestal" /><button className="collection-art-action" type="button" onClick={() => openRelic("ashen-one")} aria-label="Explore The Ashen One shrine"><span aria-hidden="true">ENTER THE SHRINE ↗</span></button></div>
                <div className="collection-relic__content"><p>THE UNKINDLED · NO. 001</p><h3>The Ashen One</h3><p>An ember endures among the ruins. Discover the champion and the gilded relic that holds their story.</p><button type="button" onClick={() => openRelic("ashen-one")}>Explore The Ashen One <Arrow diagonal /></button></div>
              </article>
              <article className={`collection-relic collection-relic--cinder${enteringRelic === "cindermane" ? " is-entering" : ""}`} data-reveal data-ambient onPointerDown={moveCollectionLight} onPointerMove={moveCollectionLight} onPointerLeave={resetCollectionLight} onPointerCancel={resetCollectionLight}>
                <div className="collection-relic__art collection-relic__art--cinder"><img className="collection-relic__scene" src="/archive/cindermane/background.webp" alt="" loading="lazy" decoding="async" /><img className="collection-relic__subject" src="/archive/cindermane/subject.webp" alt="" loading="lazy" decoding="async" /><span className="collection-relic__number" aria-hidden="true">02 / CINDER</span><div className="ambient-particles" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div><div className="collection-atmosphere" /><div className="collection-pedestal" /><button className="collection-art-action" type="button" onClick={() => openRelic("cindermane")} aria-label="Explore Cindermane shrine"><span aria-hidden="true">ENTER THE SHRINE ↗</span></button></div>
                <div className="collection-relic__content"><p>THE BLAZING RELIC · NO. 002</p><h3>Cindermane</h3><p>A different relic burns within the archive. Enter a second scene forged in flame and shadow.</p><button type="button" onClick={() => openRelic("cindermane")}>Explore Cindermane <Arrow diagonal /></button></div>
              </article>
            </div>
            <p className="collection-footnote">TWO RELICS &nbsp; / &nbsp; SELECT ONE TO ENTER THE SHRINE <span aria-hidden="true">↗</span></p>
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
              <span className="chapter-crest__sub">AN INTERACTIVE CHRONICLE</span>
            </div>

            <div className="echo-exhibit" data-moment={storyMoment} data-reveal>
              <div className="echo-exhibit__visual" aria-hidden="true">
                <img key={storyMoment} className="echo-exhibit__landscape" src={storyMoments[storyMoment].image} alt="" />
                {storyMoment === 1 && <img className="echo-exhibit__figure" src="/archive/knight.webp" alt="" />}
                <span className="echo-exhibit__visual-index">THE ASHEN COLLECTION <span> / </span> {storyMoments[storyMoment].number}</span>
                <span className="echo-exhibit__visual-mark">✦</span>
              </div>
              <div className="echo-exhibit__content">
                <div className="echo-exhibit__top"><span>A WORLD BETWEEN FLAME &amp; ASH</span><span>{storyMoments[storyMoment].number} / 03</span></div>
                <div className="echo-exhibit__story" key={storyMoment} aria-live="polite" aria-atomic="true">
                  <p className="echo-exhibit__label">{storyMoments[storyMoment].label}</p>
                  <h3>{storyMoments[storyMoment].title}</h3>
                  <p>{storyMoments[storyMoment].text}</p>
                </div>
                <div className="echo-exhibit__controls">
                  <button type="button" aria-label="Previous chapter" onClick={() => setStoryMoment((moment) => (moment + storyMoments.length - 1) % storyMoments.length)}>←</button>
                  <span>EXPLORE THE CHRONICLE</span>
                  <button type="button" aria-label="Next chapter" onClick={() => setStoryMoment((moment) => (moment + 1) % storyMoments.length)}>→</button>
                </div>
              </div>
            </div>
            <div className="echo-moments" role="group" aria-label="Choose a story chapter">
              {storyMoments.map((moment, index) => (
                <button key={moment.number} type="button" className="echo-moments__item" aria-pressed={storyMoment === index} onClick={() => setStoryMoment(index)}>
                  <span>{moment.number}</span><strong>{moment.label}</strong><span aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
            <button className="story-next" type="button" onClick={enterExperience}>Skip to the shrine <Arrow diagonal /></button>
            <div className="chronicle-sequence" aria-label="The journey through ash and flame">
              <p className="chronicle-sequence__intro">THE JOURNEY CONTINUES <span aria-hidden="true">↓</span></p>
              {storyMoments.map((moment, index) => (
                <article className={`chronicle-scene chronicle-scene--${index + 1}`} key={moment.number} data-ambient>
                  <div className="chronicle-scene__image" aria-hidden="true"><img src={moment.image} alt="" loading="lazy" decoding="async" />{index === 1 && <img className="chronicle-scene__figure" src="/archive/knight.webp" alt="" loading="lazy" decoding="async" />}<div className="chronicle-atmosphere" /><div className="ambient-particles" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div></div>
                  <div className="chronicle-scene__copy"><span>CHAPTER {moment.number} / 03</span><h3>{moment.title}</h3><p>{storySceneLines[index]}</p><button type="button" onClick={() => { setStoryMoment(index); document.querySelector(".echo-exhibit")?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "center" }); }}>Revisit this chapter <Arrow diagonal /></button></div>
                </article>
              ))}
            </div>
            <button className="story-next" type="button" onClick={enterExperience}>Continue to the shrine <Arrow diagonal /></button>
          </div>
        </section>

        {/* ====================================================================
            4. SECTION 02 — THE GRAND RELIQUARY SANCTUARY (THE RELIC)
            ==================================================================== */}
        <section className="sanctuary-chamber" id="sanctuary" ref={experienceRef} tabIndex={-1} aria-labelledby="sanctuary-title">
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
                  <>
                  <DarkSoulsHoloCard
                    variant={stageVariant}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                    }}
                  />
                  <p className="shrine-loading-status" data-state={shrineState} role="status" aria-live="polite">{shrineState === "loading" ? (shrineSlow ? "The shrine is taking longer to load. Check your connection." : "Opening the shrine…") : shrineState === "ready" ? "Shrine opened. Artwork may continue loading." : "Shrine paused while outside the viewport."}</p>
                  </>
                ) : (
                  <div className="vault-dormant-altar">
                    <div className="vault-dormant-altar__glow" />
                    <div className="vault-dormant-altar__card-wrap">
                      <ArchiveCard compact />
                    </div>
                    <div className="vault-dormant-altar__content">
                      <span className="vault-dormant-altar__kicker">{stageVariant === "cindermane" ? "CINDERMANE SELECTED · ASHEN ONE PREVIEW" : "RELIQUARY CHAMBER"}</span>
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
                    <strong className="hud-desktop">Scroll wheel</strong><span className="hud-desktop">Zoom in &amp; out</span>
                    <strong className="hud-touch">Look closer</strong><span className="hud-touch">Use the Workbench below</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="shrine-discovery" aria-labelledby="shrine-discovery-title" data-reveal>
              <div className="shrine-discovery__intro"><span>THE SHRINE / FIELD NOTES</span><h3 id="shrine-discovery-title">Look closer.<br /><em>Find the meaning.</em></h3><p>Select a symbol to uncover a detail of the Ashen One shrine.</p></div>
              <div className="shrine-discovery__body"><div className="shrine-symbols" role="group" aria-label="Explore shrine details">{shrineSecrets.map((secret, index) => <button type="button" key={secret.label} aria-pressed={shrineSecret === index} onClick={() => setShrineSecret(index)}><span aria-hidden="true">{secret.symbol}</span><small>{secret.label}</small></button>)}</div><div className="shrine-secret" aria-live="polite" aria-atomic="true" key={shrineSecret}><span>FIELD NOTE / 0{shrineSecret + 1}</span><h4>{shrineSecrets[shrineSecret].title}</h4><p>{shrineSecrets[shrineSecret].text}</p>{shrineSecret === 2 && <a href="#anatomy" onClick={() => { setStudyCompare(false); setStudyFlipped(true); }}>Inspect the reverse in the workbench <Arrow diagonal /></a>}</div></div>
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
                Choose a point to inspect the border, figure, or light. Zoom in, compare both sides, and reset whenever you wish.
              </p>
            </div>

            {/* Precision Workbench Layout */}
            <div className="workbench-grid">
              {/* Left Column: Curatorial Analysis Dossier */}
              <div className="workbench-dossier" data-reveal>
                <div className="workbench-dossier__badge">CURATORIAL REPORT <span aria-hidden="true">✦</span></div>
                <div className="workbench-dossier__card" aria-live="polite" aria-atomic="true">
                  {studyCompare ? (
                    <div className="dossier-entry" key="comparison"><div className="dossier-entry__header"><span className="dossier-entry__tag">SIDE BY SIDE</span><span className="dossier-entry__index">TWO FACES</span></div><h3 className="dossier-entry__title">A relic, both sides.</h3><p className="dossier-entry__desc">Compare the gilded portrait with the quiet sigil on its reverse. Select a detail to return to the close-up view.</p><div className="dossier-entry__meta"><span>LEFT: FRONT</span><span>RIGHT: REVERSE</span></div></div>
                  ) : studyFlipped ? (
                    <div className="dossier-entry dossier-entry--sigil" key="reverse">
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
                    <div className="dossier-entry" key={selectedDetail}>
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
                  onClick={() => { setStudyCompare(false); setStudyFlipped((f) => !f); }}
                  aria-pressed={studyFlipped}
                >
                  <span className="workbench-turntable-btn__icon" aria-hidden="true">⟲</span>
                  <span>{studyFlipped ? "Inspect Front Foil Face" : "Inspect Reverse Dark Sign"}</span>
                </button>
              </div>

              {/* Center Column: The Mounted Artifact Plinth */}
              <div className="workbench-plinth-wrap" data-reveal>
                <div
                  className="workbench-plinth"
                  data-detail={studyFlipped ? "reverse" : selectedDetail}
                  data-zoomed={studyZoomed}
                  onPointerMove={moveWorkbenchLight}
                  onPointerLeave={(event) => {
                    event.currentTarget.style.removeProperty("--inspect-x");
                    event.currentTarget.style.removeProperty("--inspect-y");
                  }}
                >
                  <div className="workbench-light" aria-hidden="true" />
                  <div className="workbench-scan" key={`${studyCompare}-${studyFlipped ? "reverse" : selectedDetail}`} aria-hidden="true" />
                  <div className="workbench-plinth__grid" aria-hidden="true">
                    <span className="workbench-coord workbench-coord--tl">X: 001.4</span>
                    <span className="workbench-coord workbench-coord--tr">Y: 002.8</span>
                    <span className="workbench-coord workbench-coord--bl">Z: +0.08</span>
                    <span className="workbench-coord workbench-coord--br">VIEW: {studyZoomed ? "1.45×" : "1×"}</span>
                  </div>

                  {studyCompare ? <div className="workbench-comparison" aria-label="Front and reverse of The Ashen One card"><figure><ArchiveCard compact /><figcaption>FRONT / PORTRAIT</figcaption></figure><figure><ArchiveCard compact flipped /><figcaption>REVERSE / SIGIL</figcaption></figure></div> : <div className="workbench-card-housing">
                    <ArchiveCard compact flipped={studyFlipped} highlightIndex={studyFlipped ? undefined : selectedDetail} />
                    {!studyFlipped && <><span className="workbench-focus-halo" key={selectedDetail} aria-hidden="true" /><span className="workbench-target-beam" key={`beam-${selectedDetail}`} aria-hidden="true" /></>}

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
                  </div>}
                </div>
                <div className="workbench-tools" role="group" aria-label="Card view controls">
                  <button type="button" className="workbench-tool" aria-pressed={studyZoomed} disabled={studyCompare} onClick={() => setStudyZoomed((zoomed) => !zoomed)}>
                    <span aria-hidden="true">{studyZoomed ? "−" : "+"}</span> {studyZoomed ? "Show full card" : "Zoom selected detail"}
                  </button>
                  <button type="button" className="workbench-tool" aria-pressed={studyCompare} onClick={() => { setStudyZoomed(false); setStudyCompare((value) => !value); }}><span aria-hidden="true">◫</span> {studyCompare ? "Exit comparison" : "Compare faces"}</button>
                  <button type="button" className="workbench-tool workbench-tool--reset" onClick={() => { setStudyZoomed(false); setStudyFlipped(false); setStudyCompare(false); setSelectedDetail(0); }}>
                    <span aria-hidden="true">↺</span> Reset view
                  </button>
                </div>
                {!studyCompare && !studyFlipped && <div className="detail-loupe" data-detail={selectedDetail} aria-hidden="true"><div className="detail-loupe__crop"><div className="detail-loupe__card"><ArchiveCard compact /></div></div><div className="detail-loupe__caption"><span>MAGNIFIED STUDY / {cardDetails[selectedDetail].number}</span><strong>{cardDetails[selectedDetail].title}</strong><small>A closer look at the selected area</small></div></div>}
                <div className="workbench-reading" aria-live="polite"><span>INSPECTION / {studyCompare ? "COMPARING FACES" : studyFlipped ? "REVERSE" : `DETAIL ${cardDetails[selectedDetail].number}`}</span><strong>{studyCompare ? "Front and reverse" : studyFlipped ? "The reverse seal" : cardDetails[selectedDetail].title}</strong><small>{studyZoomed ? "Magnified view" : "Select a detail or zoom for a closer look"}</small></div>
              </div>

              {/* Right Column: Focal Detail Selectors */}
              <div className="workbench-focals" data-reveal>
                <div className="workbench-focals__title">SELECT FOCAL RETICLE</div>
                <div className="focal-list" role="group" aria-label="Choose a card detail">
                  {cardDetails.map((detail, index) => (
                    <button
                      key={detail.number}
                      type="button"
                        className={`focal-item${!studyCompare && !studyFlipped && selectedDetail === index ? " is-selected" : ""}`}
                      aria-pressed={!studyCompare && !studyFlipped && selectedDetail === index}
                      onClick={() => {
                        setStudyCompare(false);
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
                    className={`focal-item focal-item--sigil${!studyCompare && studyFlipped ? " is-selected" : ""}`}
                    aria-pressed={!studyCompare && studyFlipped}
                    onClick={() => { setStudyCompare(false); setStudyFlipped(true); }}
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
                <div className="blueprint-stack" aria-hidden="true">
                  <span className="blueprint-stack__plane blueprint-stack__plane--back" />
                  <span className="blueprint-stack__plane blueprint-stack__plane--figure" />
                  <span className="blueprint-stack__plane blueprint-stack__plane--frame" />
                  <span className="blueprint-stack__caption">ARTWORK · DEPTH · LIGHT</span>
                </div>
                <details className="shader-disclosure">
                  <summary>Explore the shader <span aria-hidden="true">＋</span></summary>
                <div className="shader-code-box">
                  <pre className="shader-code">
                    <code>
{`// Production Shader: src/HeroRelic3D.tsx (GLSL Fragment)
uniform vec3 uLightPos;
uniform float uTime;
uniform float uSpectral;
uniform vec3 uTint;
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
  vec3 foil = mix(uTint, spectrum, uSpectral) * spec * 1.1;

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
                </details>
              </div>
            </div>

            <div className="build-case" data-reveal>
              <div className="build-case__header"><p>THE MAKING OF THE ARCHIVE</p><h3>From source to <em>experience.</em></h3><span>A closer look at the decisions behind the project.</span></div>
              <div className="build-case__grid">
                <article><span>01 / FOUNDATION</span><h4>Respect the original</h4><p>The interactive shrine uses the registered ThreeUI component and its original HTML sources. The Ashen One remains the default; Cindermane is an optional second variant.</p></article>
                <article><span>02 / INTEGRATION</span><h4>Build a world around it</h4><p>React and TypeScript bring together a layered Three.js hero, a chapter-based story, and an interactive inspection workbench.</p></article>
                <article><span>03 / DESIGN DECISIONS</span><h4>Depth with intention</h4><p>The shrine loads on request, the hero pauses when off screen, and motion-sensitive visitors receive a quieter experience. The shrine requires WebGL and an internet connection for its external assets.</p></article>
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
        <section className={`crypt-conclusion${kindlePulse ? " crypt-conclusion--pulse" : ""}`} id="pyre" data-kindled={hearthKindled} data-ambient aria-labelledby="closing-title">
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
              aria-label={hearthKindled ? "Rekindle the bonfire" : "Kindle the bonfire"}
            >
              <span className="last-ember-art" aria-hidden="true">
                <svg viewBox="0 0 160 230" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M80 10 73 33 76 154 80 169 84 154 87 33 80 10Z" fill="#42372a" stroke="#d1ae74" strokeWidth="1.5"/><path d="M80 18v133M48 158q32 14 64 0M62 164l2 11 16-3 16 3 2-11M76 174v26l-5 5 9 8 9-8-5-5v-26" stroke="#d1ae74" strokeWidth="2" strokeLinecap="round"/><path d="M39 211q41-19 82 0M48 218q32-13 64 0" stroke="#ac764a" strokeWidth="2" strokeLinecap="round"/></svg>
                <span className="last-ember-art__flame last-ember-art__flame--one" /><span className="last-ember-art__flame last-ember-art__flame--two" /><span className="last-ember-art__spark">✦</span>
              </span>
              <span className="bonfire-altar-btn__hint">{hearthKindled ? "THE EMBER GLOWS · KINDLE AGAIN" : "KINDLE THE LAST EMBER"}</span>
            </button>

            <div className="section-kicker">
              <span className="kicker-gem">✦</span>
              <span>{hearthKindled ? "The Sanctuary Remains Rekindled" : "A final spark awaits"}</span>
            </div>

            <h2 id="closing-title" className="crypt-conclusion__title">
              {hearthKindled ? <>Even when the fire fades, <br /><em>the memory of ash endures.</em></> : <>A spark remains <br /><em>in the darkness.</em></>}
            </h2>

            <p className="last-ember-status" aria-live="polite">{hearthKindled ? "The last ember is alight. The archive awaits your return." : "Select the ember to rekindle the fire."}</p>
            <div className="crypt-conclusion__actions">
              <button className="button-luxury button-relic-gold" type="button" onClick={enterExperience}>
                <span>Return to the shrine</span>
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
