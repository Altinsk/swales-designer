// Shared canvas-scale constant. Lives in its own tiny, side-effect-free
// module (not just exported from GardenCanvas.tsx) so app/page.tsx can
// import it with a normal static import without also pulling in
// GardenCanvas's heavy canvas/Konva code - that component is loaded via
// next/dynamic specifically to avoid bundling/SSR-ing it eagerly, and a
// second, non-dynamic import path into the same module would defeat that.
//
// Previously app/page.tsx re-declared this as a bare `40` in two places
// (its scale-ruler indicator) instead of importing GardenCanvas's real
// value - the same copy-paste-drift risk already found and fixed once this
// session for swales-services' ANNUAL_DEMAND_KWH: if this number ever
// changes in one place and not the other, the on-screen scale ruler would
// silently show an incorrect real-world scale for what's actually drawn.
export const PIXELS_PER_METER = 40;
