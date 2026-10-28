# Bonfire Archive — The Ashen One

A responsive interactive showcase built around the exact ThreeUI Dark Souls Holo Card source. Visitors see a fast static introduction, then choose when to load the full WebGL scene.

**Live site:** https://bonfire-archive-ashen-one.indigofern4096.chatgpt.site

## Run locally

```bash
npm install
npm run dev
```

Run `npm run build` to check TypeScript and create the production site in `dist/`. Deploy the `dist` directory to a static host.

## Experience

- Explore a two-relic collection and enter either The Ashen One or Cindermane shrine. The original Ashen One is selected by default.
- Turn the real-time Three.js hero, choose its lighting, and optionally enable ambient sound and subtle interface accents (off by default). The interactive chronicle lets visitors select chapters directly or scroll through three cinematic scenes; a skip button leads straight to the shrine.
- Inspect three details of The Ashen One, zoom in, see a magnified detail and target scan, flip the card, compare both faces side by side, and reset the view.
- Behind the Build explains the artwork layers, shader, integration choices, and links to the source for interview discussion.
- Keyboard-accessible controls, visible focus, responsive layouts, reduced-motion support, and a static preview when WebGL is unavailable support different browsing needs. These provisions are not a substitute for a full accessibility audit.

## How it is built

- **React 19 + TypeScript + Vite** provide the responsive interface and build tooling.
- **Three.js r180 and GLSL** render the custom layered hero. The original ThreeUI shrine is hosted in its own document, using the registered component and source files below.
- The collection uses a museum-inspired display with separate artwork layers, pointer-reactive parallax, ambient light and sparse embers, with touch scrolling on mobile. Selecting a relic transitions to the shrine. Three field notes provide optional interactive details about the Ashen One shrine. Scroll-led story scenes add drifting mist and light; decorative animations pause off screen and in hidden tabs, and reduced-motion preferences disable them. The shrine is mounted on demand and unmounted when off-screen or when the page is hidden. The custom hero also pauses its render loop off-screen or in a hidden tab. Scene resources are released on cleanup.
- Artwork for the shell is extracted from the registered source assets. The site is an unofficial fan-made showcase; Dark Souls and related artwork belong to their respective owners. ThreeUI supplies the original shrine component.

### Design trade-offs

The full shrine requires WebGL and an internet connection: its original HTML loads Three.js modules from a CDN, and Cindermane also loads its original assets from Supabase. A static preview and the workbench remain available if WebGL is unavailable; the custom hero also falls back to layered artwork if its textures fail to load. The comparison and hotspot views use layered 2D artwork rather than the shrine's 3D scene.

### Interview walkthrough

1. Show the collection and launch each variant; explain the original component and asset dependencies.
2. Navigate the story and demonstrate the workbench's hotspots, zoom, flip, comparison, and reset.
3. Open Behind the Build to discuss the shader and the decision to pause rendering outside the viewport.
4. Run `npm run build` and inspect the source-integrity hashes below. The local source alias is intentional, as explained below.

## Source integrity

The four registered ThreeUI source files are preserved byte for byte:

| File | SHA-256 |
| --- | --- |
| `src/shaders/dark-souls-holo-card/DarkSoulsHoloCard.tsx` | `8ec70d08f25b0e10d62afa3fe4cc68415acf67607041307a8e53c34153b997a5` |
| `public/landing-pages/dark-souls-holo-card.html` | `4373734e87a17720a853e4e6d36df174e0db59d668de2607f5dc9fb5927b109d` |
| `public/landing-pages/dark-souls-holo-card-cindermane.html` | `a34740e8810600de8e4c15bb96a4b14e177ab8735a84163521c90095403cb150` |
| `src/shaders/threeui.css` | `efe4447139f1358dd8e9be68edf6fa46cbefbd1de423a4d6c439ca61d2c8eccf` |

The npm release `@designcodeio/threeui@1.2.0` does not export this component, so Vite and TypeScript aliases resolve the requested import path to the registered local source. The Ashen One HTML embeds its images, models, and fonts. Its pinned Three.js r180 modules load from jsDelivr at runtime, so the 3D scene needs internet access. The archive shell uses small images and fonts extracted from the verified source for the initial view.
