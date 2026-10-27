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

- Editorial introduction, interactive relic, artifact details, and build notes
- Scene loads on request, preserving the original renderer and allowing visitors to stop it
- Compact mobile hero, current-section navigation, accessible menu controls, and a fullscreen view with visible exit controls
- Direct GitHub source link in the page for reviewers
- Click or tap the hero card to open the exact ThreeUI 3D scene in place; the static preview follows the pointer before activation
- Move from the hero scene to the full stage without running two WebGL scenes at once
- Inspect three card details using accessible hotspots or the detail list, and turn the study card over
- Subtle ember particles and scroll reveals add motion while respecting reduced-motion preferences
- Responsive layout, keyboard focus states, reduced-motion support, and a static fallback when WebGL2 is unavailable
- In the scene: move to tilt, drag to rotate, double-click or press F to flip, scroll to zoom, and press R to reset

## Source integrity

The four registered ThreeUI source files are preserved byte for byte:

| File | SHA-256 |
| --- | --- |
| `src/shaders/dark-souls-holo-card/DarkSoulsHoloCard.tsx` | `8ec70d08f25b0e10d62afa3fe4cc68415acf67607041307a8e53c34153b997a5` |
| `public/landing-pages/dark-souls-holo-card.html` | `4373734e87a17720a853e4e6d36df174e0db59d668de2607f5dc9fb5927b109d` |
| `public/landing-pages/dark-souls-holo-card-cindermane.html` | `a34740e8810600de8e4c15bb96a4b14e177ab8735a84163521c90095403cb150` |
| `src/shaders/threeui.css` | `efe4447139f1358dd8e9be68edf6fa46cbefbd1de423a4d6c439ca61d2c8eccf` |

The npm release `@designcodeio/threeui@1.2.0` does not export this component, so Vite and TypeScript aliases resolve the requested import path to the registered local source. The Ashen One HTML embeds its images, models, and fonts. Its pinned Three.js r180 modules load from jsDelivr at runtime, so the 3D scene needs internet access. The archive shell uses small images and fonts extracted from the verified source for the initial view.
