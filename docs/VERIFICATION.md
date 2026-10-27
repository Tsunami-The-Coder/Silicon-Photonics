# Prototype verification — 26 October 2026

## Scope

The user journey is: open the scroll story → reveal package layers → enter a magnified PIC schematic → open the free explorer → select components and manipulate the teaching model. There are no API, authentication, AI or database boundaries in this release.

## Checks performed

- TypeScript check passed.
- Optimized Next.js production build passed; `/` and `/explore` were statically prerendered.
- Both local routes returned HTTP 200.
- Browser rendered the actual WebGL package and circuit, not just a placeholder.
- Story chapter buttons moved to the package and SOI chapters and changed the narrative and scene scale.
- Explorer package/circuit switching updated the part list, selected component and scene.
- Selecting a microring displayed its mechanism and source references.
- Disabling two wavelength channels changed the displayed illustrative capacity from 100 Gb/s to 50 Gb/s.
- The separation slider accepted its 100% endpoint; light pause changed to an Animate light control.
- Component hide/show controls changed state, and reset restored controls.
- The native source dialog opened and closed with Escape.
- The WDM knowledge question revealed its reviewed explanation.
- Keyboard activation of the scale switch worked.
- No horizontal document overflow was observed at browser-reported widths of 337 and 695 CSS pixels. A wider story layout was also inspected. These are desktop-browser checks, not tests on a physical phone.
- After replacing the label helper, the checked interactions produced no new browser console errors. React Three Fiber still emits an upstream Three.js Clock deprecation warning in development; rendering works.

## Issue resolved

The default development bundler could not start a macOS FSEvent stream in this execution environment. Production compilation succeeded. Local development was verified with `WATCHPACK_POLLING=true pnpm dev --webpack` instead.

Drei's original HTML-label helper emitted React synchronous-unmount warnings during development. Projected labels now use a scene-owned DOM overlay, avoiding separate React roots. Their event listeners and nodes are removed when the labels unmount.

## Limits

Reduced-motion behavior and the no-WebGL fallback are implemented and source-reviewed; explicit media emulation and forced WebGL failure were not tested. No measured frame-rate, battery-use or physical-device benchmark is claimed. This model is not a physics simulator or a fabrication layout. Remote GitHub upload and Vercel deployment are separate steps and must be confirmed from their actual results.
