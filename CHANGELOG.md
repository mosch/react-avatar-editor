# Changelog

## 15.1.0 (2026-03-21)

### Features

- **`useAvatarEditor` hook** — new hook that provides `getImage()`, `getImageScaledToCanvas()`, and `getCroppingRect()` without manual ref management. All methods return `null` safely when no image is loaded.
- **`getCroppingRect()` on ref** — now exposed on the imperative ref alongside `getImage` and `getImageScaledToCanvas`.
- **`onLoadStart` callback** — fires when image loading begins, complementing the existing `onLoadSuccess`/`onLoadFailure`.
- **Loading indicator** — the canvas shows a subtle pulsating fill while an image is loading.

### Bug Fixes

- **Fix color overlay on exported image on Windows** ([#420](https://github.com/mosch/react-avatar-editor/issues/420)) — `getImageScaledToCanvas()` no longer uses `destination-over` compositing which caused color artifacts on some Windows GPU drivers.
- **Fix touch drag in DevTools responsive mode** ([#403](https://github.com/mosch/react-avatar-editor/issues/403)) — touch event listeners are now always registered instead of being gated behind a one-time `isTouchDevice` check. Also guards `preventDefault()` with `e.cancelable` to avoid console errors.

## 15.0.0 (2026-03-21)

### Breaking Changes

- **Removed `...rest` prop forwarding** — unknown props are no longer spread onto the `<canvas>` element. If you relied on passing custom HTML attributes (e.g. `id`, `className`, `data-*`) directly to the canvas, this will no longer work.
- **`getCroppingRect()` return change** — returns `{x:0, y:0, width:1, height:1}` instead of throwing when no image is loaded.
- **`getInitialSize()` precision** — returns exact floating-point values instead of rounded integers, fixing off-by-one pixel issues.
- **Core bundled into lib** — `@react-avatar-editor/core` is no longer a separate npm dependency; it's bundled into `react-avatar-editor`.

### Features

- **`useAvatarEditor` hook** — new ergonomic API for accessing editor methods.
- **`onLoadStart` callback** — fires when image loading begins.
- **Loading indicator** — pulsating canvas fill during image load.
- **`showGrid` / `gridColor` props** — rule-of-thirds grid overlay (existed in source but was non-functional in v13/v14 npm releases).
- **`borderColor` prop** — draw a 1px border around the crop mask.

### Bug Fixes

- **Fix #389** — `getCroppingRect()` no longer returns NaN when no image is loaded.
- **Fix #429** — square cropper no longer produces off-by-one pixel dimensions.
- **Fix #431** — drag/pan now works correctly in React 17 (stale closure fix).
- **Fix #402** — canvas no longer clipped on Windows with display scaling > 100%.
- **Fix #432** — added `repository` field to package.json.
- **Fix #406** — unknown props no longer leak to the canvas DOM element.
- **Fix canvas repaint** — all visual props now correctly trigger canvas re-render.

### Tooling

- Migrated from ESLint + Prettier to oxlint + oxfmt.
- Migrated from tsdown to Vite for library builds.
- 123 unit tests (84 core + 39 component) + 8 Playwright visual regression tests.
- TypeScript 5.9, Vite 8, React 19 (dev).
