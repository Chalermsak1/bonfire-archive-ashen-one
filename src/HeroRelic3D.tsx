import { useEffect, useRef, useState, useCallback, type PointerEvent as ReactPointerEvent } from "react";
import * as THREE from "three";

interface HeroRelic3DProps {
  flipped: boolean;
  onFlip: () => void;
  lightMode: "ember" | "moon" | "prism";
  autoSpin: boolean;
  onReady?: () => void;
  className?: string;
  onFpsUpdate?: (fps: number) => void;
}

export function HeroRelic3D({ flipped, onFlip, lightMode, autoSpin, onReady, className = "", onFpsUpdate }: HeroRelic3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fpsCallbackRef = useRef(onFpsUpdate);
  fpsCallbackRef.current = onFpsUpdate;
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;
  const lightModeRef = useRef(lightMode);
  const autoSpinRef = useRef(autoSpin);
  lightModeRef.current = lightMode;
  autoSpinRef.current = autoSpin;
  const [webglSupported, setWebglSupported] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Drag & pointer tracking state
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    startRotX: number;
    startRotY: number;
    moved: boolean;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startRotX: 0,
    startRotY: 0,
    moved: false,
  });

  // Showcase resting angle
  const REST_ROT_X = -0.05;
  const REST_ROT_Y = 0.09;

  // Physics state
  const physicsRef = useRef({
    currentRotX: REST_ROT_X,
    currentRotY: REST_ROT_Y,
    targetRotX: REST_ROT_X,
    targetRotY: flipped ? Math.PI : REST_ROT_Y,
    currentTiltX: 0,
    currentTiltY: 0,
    targetTiltX: 0,
    targetTiltY: 0,
    lightX: 0.2,
    lightY: 0.6,
  });

  // Update target rotation when `flipped` prop changes
  useEffect(() => {
    physicsRef.current.targetRotY = flipped ? Math.PI : REST_ROT_Y;
    physicsRef.current.targetRotX = REST_ROT_X;
  }, [flipped]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // 1. Verify WebGL support & create renderer
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
    } catch {
      setWebglSupported(false);
      onReadyRef.current?.();
      return;
    }

    // 2. Scene & Camera setup - closer camera distance (~20% larger card presence)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 9.5);

    // 3. Texture Loading Manager for guaranteed seamless appearance
    const manager = new THREE.LoadingManager();
    manager.onLoad = () => {
      setIsLoaded(true);
      onReadyRef.current?.();
    };

    const textureLoader = new THREE.TextureLoader(manager);
    const loadTex = (url: string) => {
      const tex = textureLoader.load(url);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      return tex;
    };

    const ruinsTex = loadTex("/archive/ruins.webp");
    const knightTex = loadTex("/archive/knight.webp");
    const frameTex = loadTex("/archive/frame.webp");
    const backTex = loadTex("/archive/card-back.webp");
    const sigilTex = loadTex("/archive/sigil.webp");

    // 4. High-DPI Text Canvas Texture for Crisp Gold Typography
    const textCanvas = document.createElement("canvas");
    textCanvas.width = 1024;
    textCanvas.height = 1536;
    const ctx = textCanvas.getContext("2d");
    if (ctx) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Top Title Banner (Precisely centered in the engraved cartouche plaque at y = 210)
      ctx.font = "700 42px 'Cinzel Archive', 'Cinzel', Georgia, serif";
      ctx.fillStyle = "#edd59e";
      ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.letterSpacing = "6px";
      ctx.fillText("THE ASHEN ONE", 512, 210);

      // Bottom Crest Banner (Precisely centered in the bottom cartouche plaque at y = 1340)
      ctx.font = "600 32px 'Cinzel Archive', 'Cinzel', Georgia, serif";
      ctx.fillStyle = "#dfc386";
      ctx.shadowColor = "rgba(0, 0, 0, 0.95)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;
      ctx.letterSpacing = "7px";
      ctx.fillText("LINK THE FIRE", 512, 1340);
    }
    const textTex = new THREE.CanvasTexture(textCanvas);
    textTex.colorSpace = THREE.SRGBColorSpace;

    // Back Text Canvas
    const backTextCanvas = document.createElement("canvas");
    backTextCanvas.width = 1024;
    backTextCanvas.height = 1536;
    const bCtx = backTextCanvas.getContext("2d");
    if (bCtx) {
      bCtx.textAlign = "center";
      bCtx.textBaseline = "middle";
      bCtx.font = "600 40px 'Cinzel Archive', Georgia, serif";
      bCtx.fillStyle = "#edd299";
      bCtx.shadowColor = "#ff7820";
      bCtx.shadowBlur = 20;
      bCtx.shadowOffsetY = 2;
      bCtx.letterSpacing = "8px";
      bCtx.fillText("THE EMBER REMAINS", 512, 1308);
    }
    const backTextTex = new THREE.CanvasTexture(backTextCanvas);
    backTextTex.colorSpace = THREE.SRGBColorSpace;

    // 5. Card Dimensions (Aspect Ratio ~2:3)
    const cardWidth = 3.6;
    const cardHeight = 5.4;
    const cardThickness = 0.16;

    // Root Card Pivot Group
    const cardGroup = new THREE.Group();
    cardGroup.rotation.set(REST_ROT_X, REST_ROT_Y, 0);
    scene.add(cardGroup);

    // Front Side Group
    const frontGroup = new THREE.Group();
    cardGroup.add(frontGroup);

    // Layer 1: Ruins Background Plane (Layered Depth Z = -0.05)
    const ruinsMat = new THREE.MeshStandardMaterial({
      map: ruinsTex,
      roughness: 0.72,
      metalness: 0.1,
    });
    const ruinsPlane = new THREE.Mesh(new THREE.PlaneGeometry(cardWidth * 0.88, cardHeight * 0.82), ruinsMat);
    ruinsPlane.position.set(0, 0, -0.05);
    frontGroup.add(ruinsPlane);

    // Layer 2: Knight Character Plane (Layered Depth Z = 0.03 with distinct parallax)
    // Controlled roughness & metalness to preserve artwork details without blown-out specular wash
    const knightMat = new THREE.MeshStandardMaterial({
      map: knightTex,
      transparent: true,
      alphaTest: 0.02,
      roughness: 0.48,
      metalness: 0.32,
    });
    const knightPlane = new THREE.Mesh(new THREE.PlaneGeometry(cardWidth * 0.94, cardHeight * 0.77), knightMat);
    knightPlane.position.set(0, -0.22, 0.03);
    frontGroup.add(knightPlane);

    // Layer 3: Ornate Engraved Gold Frame Plane (Layered Depth Z = 0.08)
    // Higher metalness on the frame to emphasize gold relief and filigree edges
    const frameMat = new THREE.MeshBasicMaterial({
      map: frameTex,
      transparent: true,
      alphaTest: 0.02,
    });
    const framePlane = new THREE.Mesh(new THREE.PlaneGeometry(cardWidth, cardHeight), frameMat);
    framePlane.position.set(0, 0, 0.08);
    frontGroup.add(framePlane);

    // Layer 4: Text Titles Plane (Layered Depth Z = 0.085)
    const textMat = new THREE.MeshBasicMaterial({
      map: textTex,
      transparent: true,
    });
    const textPlane = new THREE.Mesh(new THREE.PlaneGeometry(cardWidth, cardHeight), textMat);
    textPlane.position.set(0, 0, 0.085);
    frontGroup.add(textPlane);

    // Layer 5: Prismatic Holographic Foil Shader Plane
    const foilUniforms = {
      uLightPos: { value: new THREE.Vector3(0.2, 0.6, 4.2) },
      uTime: { value: 0 },
      uSpectral: { value: 0.35 },
      uTint: { value: new THREE.Color("#ebc77a") },
    };

    const foilShaderMat = new THREE.ShaderMaterial({
      uniforms: foilUniforms,
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
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
          vec3 lightDir = normalize(uLightPos - vec3((vUv.x - 0.5) * 3.6, (vUv.y - 0.5) * 5.4, 0.2));
          vec3 halfVector = normalize(lightDir + viewDir);

          float NdotH = max(dot(normal, halfVector), 0.0);
          float spec = pow(NdotH, 32.0);

          // Iridescent holographic spectrum with restrained luxury dispersion
          float angle = dot(normal, viewDir);
          vec3 spectrum = 0.5 + 0.5 * cos(vec3(0.0, 0.33, 0.67) * 6.28318 + angle * 3.2 + vUv.y * 2.8 + uTime * 0.2);
          vec3 foil = mix(uTint, spectrum, uSpectral) * spec * 1.1;

          // Subtle corner glint hotspot
          float dist = distance(vUv, vec2(0.5 + uLightPos.x * 0.1, 0.5 + uLightPos.y * 0.1));
          float hotspot = smoothstep(0.38, 0.0, dist) * 0.18;

          vec3 finalColor = foil + vec3(0.95, 0.75, 0.35) * hotspot;
          float alpha = clamp(spec * 0.85 + hotspot * 0.4, 0.0, 0.65);

          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const foilPlane = new THREE.Mesh(new THREE.PlaneGeometry(cardWidth * 0.96, cardHeight * 0.96), foilShaderMat);
    foilPlane.position.set(0, 0, 0.09);
    frontGroup.add(foilPlane);

    // Reverse Face Group (Rotated 180° around Y)
    const backGroup = new THREE.Group();
    backGroup.rotation.y = Math.PI;
    cardGroup.add(backGroup);

    // Back Plate Texture
    const backMat = new THREE.MeshBasicMaterial({
      map: backTex,
    });
    const backPlane = new THREE.Mesh(new THREE.PlaneGeometry(cardWidth, cardHeight), backMat);
    backPlane.position.set(0, 0, 0.04);
    backGroup.add(backPlane);

    // Sigil Emblem (Emissive Ember Glow)
    const sigilMat = new THREE.MeshBasicMaterial({
      map: sigilTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sigilPlane = new THREE.Mesh(new THREE.PlaneGeometry(cardWidth * 0.82, cardHeight * 0.56), sigilMat);
    sigilPlane.position.set(0, 0.25, 0.06);
    backGroup.add(sigilPlane);

    // Back Text Banner
    const backTextMat = new THREE.MeshBasicMaterial({
      map: backTextTex,
      transparent: true,
    });
    const backTextPlane = new THREE.Mesh(new THREE.PlaneGeometry(cardWidth, cardHeight), backTextMat);
    backTextPlane.position.set(0, 0, 0.07);
    backGroup.add(backTextPlane);

    // 6. Extruded Antique Bronze & Gold Edges (Genuine Physical 3D Thickness)
    const edgeMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#9e7c46"),
      roughness: 0.24,
      metalness: 0.88,
    });

    const edgeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.06, cardHeight, cardThickness), edgeMat);
    edgeLeft.position.set(-cardWidth / 2 + 0.03, 0, 0);
    cardGroup.add(edgeLeft);

    const edgeRight = new THREE.Mesh(new THREE.BoxGeometry(0.06, cardHeight, cardThickness), edgeMat);
    edgeRight.position.set(cardWidth / 2 - 0.03, 0, 0);
    cardGroup.add(edgeRight);

    const edgeTop = new THREE.Mesh(new THREE.BoxGeometry(cardWidth, 0.06, cardThickness), edgeMat);
    edgeTop.position.set(0, cardHeight / 2 - 0.03, 0);
    cardGroup.add(edgeTop);

    const edgeBottom = new THREE.Mesh(new THREE.BoxGeometry(cardWidth, 0.06, cardThickness), edgeMat);
    edgeBottom.position.set(0, -cardHeight / 2 + 0.03, 0);
    cardGroup.add(edgeBottom);

    // 7. Dynamic Floating Ambient Shadow Plane
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const sCtx = shadowCanvas.getContext("2d");
    if (sCtx) {
      const grad = sCtx.createRadialGradient(256, 256, 60, 256, 256, 240);
      grad.addColorStop(0, "rgba(0, 0, 0, 0.88)");
      grad.addColorStop(0.5, "rgba(0, 0, 0, 0.42)");
      grad.addColorStop(1, "transparent");
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 512, 512);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(cardWidth * 1.55, cardHeight * 1.55),
      new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, opacity: 0.78, depthWrite: false })
    );
    shadowPlane.position.set(0.12, -0.22, -0.85);
    scene.add(shadowPlane);

    // 8. Volumetric 3D Floating Embers Particles (Restrained luxury dust)
    const emberCount = 22;
    const emberGeo = new THREE.BufferGeometry();
    const emberPositions = new Float32Array(emberCount * 3);
    const emberVelocities = new Float32Array(emberCount * 3);

    for (let i = 0; i < emberCount; i++) {
      emberPositions[i * 3] = (Math.random() - 0.5) * 6.5;
      emberPositions[i * 3 + 1] = (Math.random() - 0.5) * 8.5;
      emberPositions[i * 3 + 2] = (Math.random() - 0.5) * 4.5;

      emberVelocities[i * 3] = (Math.random() - 0.5) * 0.005;
      emberVelocities[i * 3 + 1] = 0.007 + Math.random() * 0.012;
      emberVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
    }

    emberGeo.setAttribute("position", new THREE.BufferAttribute(emberPositions, 3));

    // Circular particle texture with soft falloff
    const pCanvas = document.createElement("canvas");
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext("2d");
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 2, 32, 32, 30);
      grad.addColorStop(0, "#fff5d0");
      grad.addColorStop(0.35, "#e59f42");
      grad.addColorStop(0.7, "rgba(200, 95, 25, 0.35)");
      grad.addColorStop(1, "transparent");
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const particleTex = new THREE.CanvasTexture(pCanvas);

    const emberMat = new THREE.PointsMaterial({
      size: 0.13,
      map: particleTex,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.85,
    });
    const embers = new THREE.Points(emberGeo, emberMat);
    scene.add(embers);

    // 9. Scene Lighting - Museum Gallery Calibration
    // Warm Key PointLight (Gentle champagne highlight that tracks cursor)
    const cursorLight = new THREE.PointLight(0xffdfa8, 1.85, 16, 1.4);
    cursorLight.position.set(0.2, 0.6, 4.2);
    scene.add(cursorLight);

    // Subtle Shrine Candle Ambient
    const ambientLight = new THREE.AmbientLight(0x2d2720, 1.35);
    scene.add(ambientLight);

    // Rim Directional Light - Defines edge filigree without blowing out surfaces
    const rimLight = new THREE.DirectionalLight(0xd9b878, 1.45);
    rimLight.position.set(-4, 3, 2.5);
    scene.add(rimLight);

    // 10. Responsive Resize Handler
    const updateSize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight || 560;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);

    // 11. Intersection Observer to PAUSE rendering when off-screen (Battery & GPU preservation)
    let isVisible = true;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry?.isIntersecting ?? true;
      },
      { rootMargin: "60px" }
    );
    observer.observe(container);

    // 12. Main 60 FPS Physics & Render Loop
    let animId = 0;
    const clock = new THREE.Clock();
    let frameCount = 0;
    let lastFpsTime = performance.now();
    let spinAngle = 0;
    const lightPresets = {
      ember: { key: "#ffb95d", rim: "#d9b878", tint: "#ebc77a", spectral: 0.18 },
      moon: { key: "#9dcaff", rim: "#94b5e9", tint: "#a9c9f3", spectral: 0.12 },
      prism: { key: "#ecc7ff", rim: "#9ddbe0", tint: "#e1b7ef", spectral: 0.95 },
    } as const;
    let currentLight = "";

    const renderLoop = () => {
      animId = requestAnimationFrame(renderLoop);
      if (!isVisible) return;

      frameCount++;
      const now = performance.now();
      if (now - lastFpsTime >= 1000) {
        const measured = Math.round((frameCount * 1000) / (now - lastFpsTime));
        fpsCallbackRef.current?.(measured);
        frameCount = 0;
        lastFpsTime = now;
      }

      const elapsedTime = clock.getElapsedTime();
      const p = physicsRef.current;
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (currentLight !== lightModeRef.current) {
        currentLight = lightModeRef.current;
        const preset = lightPresets[lightModeRef.current];
        cursorLight.color.set(preset.key);
        rimLight.color.set(preset.rim);
        foilUniforms.uTint.value.set(preset.tint);
        foilUniforms.uSpectral.value = preset.spectral;
      }

      if (!prefersReducedMotion) {
        // Subtle floating levitation breathing
        const floatY = Math.sin(elapsedTime * 1.5) * 0.08;
        const floatRotZ = Math.cos(elapsedTime * 1.1) * 0.015;

        // Smooth spring physics for rotation
        const lerpFactor = dragRef.current.isDragging ? 0.35 : 0.075;
        p.currentRotX += (p.targetRotX - p.currentRotX) * lerpFactor;
        p.currentRotY += (p.targetRotY - p.currentRotY) * lerpFactor;

        p.currentTiltX += (p.targetTiltX - p.currentTiltX) * 0.08;
        p.currentTiltY += (p.targetTiltY - p.currentTiltY) * 0.08;

        // Apply rotation to card
        cardGroup.rotation.x = p.currentRotX + p.currentTiltX;
        if (autoSpinRef.current && !dragRef.current.isDragging) {
          spinAngle += 0.008;
          if (spinAngle > Math.PI) spinAngle -= Math.PI * 2;
        }
        else spinAngle *= 0.92;
        cardGroup.rotation.y = p.currentRotY + p.currentTiltY + spinAngle;
        cardGroup.rotation.z = floatRotZ;
        cardGroup.position.y = floatY;

        // Dynamic Parallax between internal layers:
        // As the card turns, the knight shifts noticeably relative to the frame and ruins
        const parX = -Math.sin(cardGroup.rotation.y) * 0.22;
        const parY = cardGroup.rotation.x * 0.18;
        knightPlane.position.x = parX * 1.5;
        knightPlane.position.y = -0.22 + parY * 1.2;
        ruinsPlane.position.x = -parX * 0.8;
        ruinsPlane.position.y = -parY * 0.6;

        // Smooth cursor light movement
        cursorLight.position.x += (p.lightX - cursorLight.position.x) * 0.08;
        cursorLight.position.y += (p.lightY - cursorLight.position.y) * 0.08;

        // Foil shader time & light update
        foilUniforms.uTime.value = elapsedTime;
        foilUniforms.uLightPos.value.copy(cursorLight.position);

        // Shadow follows card inverse
        shadowPlane.position.x = -Math.sin(cardGroup.rotation.y) * 0.35 + 0.1;
        shadowPlane.position.y = cardGroup.position.y - 0.25 + cardGroup.rotation.x * 0.25;

        // Animate floating embers
        const posAttr = emberGeo.attributes.position as THREE.BufferAttribute;
        const posArray = posAttr.array as Float32Array;
        for (let i = 0; i < emberCount; i++) {
          posArray[i * 3] += emberVelocities[i * 3];
          posArray[i * 3 + 1] += emberVelocities[i * 3 + 1];
          posArray[i * 3 + 2] += emberVelocities[i * 3 + 2];

          // Wrap back to bottom
          if (posArray[i * 3 + 1] > 4.5) {
            posArray[i * 3 + 1] = -4.5;
            posArray[i * 3] = (Math.random() - 0.5) * 6.5;
          }
        }
        posAttr.needsUpdate = true;
      } else {
        cardGroup.rotation.x = 0;
        cardGroup.rotation.y = p.targetRotY;
        cardGroup.position.set(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    renderLoop();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", updateSize);
      resizeObserver.disconnect();
      observer.disconnect();

      // Dispose Three.js resources
      renderer.dispose();
      ruinsTex.dispose();
      knightTex.dispose();
      frameTex.dispose();
      backTex.dispose();
      sigilTex.dispose();
      textTex.dispose();
      backTextTex.dispose();
      shadowTex.dispose();
      particleTex.dispose();
      scene.clear();
    };
  }, []);

  // Pointer Interaction Handlers
  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    const p = physicsRef.current;
    const drag = dragRef.current;

    if (drag.isDragging) {
      const deltaX = e.clientX - drag.startX;
      const deltaY = e.clientY - drag.startY;
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        drag.moved = true;
      }

      // Convert drag pixel distance to angular rotation
      p.targetTiltY = drag.startRotY + (deltaX / rect.width) * 3.4;
      p.targetTiltX = drag.startRotX + (-deltaY / rect.height) * 1.6;

      p.lightX = (x * 2.8);
      p.lightY = (-y * 3.4);
    } else {
      // Gentle pointer hover tilt
      p.targetTiltX = -y * 0.45;
      p.targetTiltY = x * 0.58;

      p.lightX = x * 3.2;
      p.lightY = -y * 3.8 + 0.3;
    }
  }, []);

  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const container = containerRef.current;
    if (!container) return;

    const p = physicsRef.current;
    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      startRotX: p.targetTiltX,
      startRotY: p.targetTiltY,
      moved: false,
    };
    container.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const p = physicsRef.current;

    if (drag.isDragging) {
      // If dragged significantly horizontally, flip the card
      const deltaX = e.clientX - drag.startX;
      if (drag.moved && Math.abs(deltaX) > 40) {
        onFlip();
      } else if (!drag.moved) {
        // Pure click/tap flips the card
        onFlip();
      }
    }

    drag.isDragging = false;
    drag.moved = false;

    // Reset tilt offset smoothly on release
    p.targetTiltX = 0;
    p.targetTiltY = 0;

    const container = containerRef.current;
    if (container && container.hasPointerCapture(e.pointerId)) {
      container.releasePointerCapture(e.pointerId);
    }
  }, [onFlip]);

  const handlePointerLeave = useCallback(() => {
    const p = physicsRef.current;
    const drag = dragRef.current;
    if (!drag.isDragging) {
      p.targetTiltX = 0;
      p.targetTiltY = 0;
      p.lightX = 0.2;
      p.lightY = 0.6;
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " " || e.key === "f" || e.key === "F") {
      e.preventDefault();
      onFlip();
    }
  }, [onFlip]);

  const placeholder = (
    <div className="hero-card-placeholder" aria-hidden="true">
      {flipped ? (
        <div className="hero-card-placeholder__back"><img src="/archive/sigil.webp" alt="" /><span>THE EMBER REMAINS</span></div>
      ) : (
        <div className="hero-card-placeholder__front">
          <div className="hero-card-placeholder__world" />
          <img className="hero-card-placeholder__knight" src="/archive/knight.webp" alt="" />
          <img className="hero-card-placeholder__frame" src="/archive/frame.webp" alt="" />
          <span className="hero-card-placeholder__name">THE ASHEN ONE</span>
          <span className="hero-card-placeholder__footer">LINK THE FIRE</span>
        </div>
      )}
    </div>
  );

  if (!webglSupported) {
    return <div className={`hero-relic-fallback${className ? ` ${className}` : ""}`}>{placeholder}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={`hero-relic-3d${className ? ` ${className}` : ""}`}
      tabIndex={0}
      role="button"
      aria-label={flipped ? "The Ashen One Relic (Reverse Face). Click or press F to flip to front." : "The Ashen One Relic. Click or press F to flip to reverse."}
      aria-pressed={flipped}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        dragRef.current.isDragging = false;
        dragRef.current.moved = false;
        physicsRef.current.targetTiltX = 0;
        physicsRef.current.targetTiltY = 0;
      }}
      onPointerLeave={handlePointerLeave}
      onKeyDown={handleKeyDown}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        cursor: "grab",
        touchAction: "pan-y",
      }}
    >
      {!isLoaded && placeholder}
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.4s ease-out",
        }}
      />
    </div>
  );
}
