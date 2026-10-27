# Silicon-Photonics

**3D Visual** — silicon photonics, made visible.

An educational silicon-photonics explorer for a TKS build project. Follow a scroll-controlled journey from a co-packaged optics assembly into a magnified photonic circuit, then explore independently.

The intended audience is moderately technical. This release includes no AI tutor, accounts, Supabase, database, or API keys.

## Run locally

Use Node.js 22 or newer and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://127.0.0.1:3000. No environment variables are required.

If a sandboxed Mac cannot start the file-watching stream, use `WATCHPACK_POLLING=true pnpm dev --webpack` for local development.

```sh
pnpm typecheck
pnpm build
pnpm start
```

## Experience

- `/`: six scroll-controlled story chapters, chapter navigation, explicit change of scale, and a direct link to free exploration.
- `/explore`: package and circuit views, orbit/pan/zoom, selection, hide/show components, exploded layers, independent layer lift, wavelength controls, animation pause, labels, top view and reset.
- Source notes, scientific limitations, primary reference links and three learning questions are included in the UI.
- Reduced-motion preferences pause moving signal markers and use stepped story positions. Text descriptions remain usable if WebGL is unavailable.

Package components include a substrate, electrical interposer, representative microbumps, compute die, two optical engines with supporting electronics, external multi-wavelength laser, fibers and remote link endpoints. The magnified PIC includes a schematic SOI stack, waveguides, microring modulators, WDM channels, receiver filters, Ge detectors and TIAs.

## Deploy to Vercel

1. Push this project directory as the repository root.
2. Import the GitHub repository into Vercel and select Next.js.
3. Keep the default build command (`pnpm build`). No environment variables or storage resources are required.
4. Review the generated preview URL. Use the selected production branch for publication.

The current pages are statically prerendered; there are no server API routes in this release. Vercel hosting does not render the WebGL scene—the visitor's browser does.

## Project map

```text
app/                 Routes, layout, styles, icon
components/story.tsx Scroll story and chapter controls
components/explorer.tsx  Free exploration UI
components/scene.tsx     Procedural models, fibers, signal markers and cameras
components/chrome.tsx    Navigation, sources and footer
lib/content.ts       Reviewed component explanations, channels and references
docs/                Build plan, science notes and verification record
public/              Third-party license notices
```

## Scientific scope

This is an original, generic educational architecture, not a commercial product model, foundry layout or physical simulation. Package layers and the PIC's own SOI layers are distinct. The chosen interposer is electrical. Other real CPO architectures differ.

Infrared light is shown in false color. Wavelength strands are separated visually for clarity but coexist in one guide. Moving markers illustrate signal progression, not individual photons. Dimensions, separations and motion are exaggerated. The four wavelengths and 25 Gb/s per lane are illustrative; aggregate gross line rate is not measured product throughput or useful payload.

The detector generates analog current. Receiver electronics recover symbols. Source power, optical loss, thermal tuning, noise, polarization, packaging and electronic overheads are not numerically simulated.

The user's 75-page field guide and its text companion informed the curated explanations. The originals are not uploaded or publicly redistributed. See `docs/SCIENCE.md` and the in-app sources dialog for references.

## Reuse and licenses

The application and procedural geometry are original. No application code or assets were copied from the evaluated PC Digital Twin and 3D Product Explorer projects. See `THIRD_PARTY_NOTICES.md` for dependency and reference-project details. Select a license for the original project code before distributing it as open-source software; repository visibility is controlled by its owner.
