# Changelog

## Unreleased

### Features

- **Responsive size** ([#399](https://github.com/mosch/react-avatar-editor/issues/399)) — `width` and `height` accept a percentage of the parent element (e.g. `width="100%"`), and the editor follows the parent when it resizes.

### Bug Fixes

- **`position` prop is respected again** ([#436](https://github.com/mosch/react-avatar-editor/issues/436), [#437](https://github.com/mosch/react-avatar-editor/pull/437)) — since v15 the prop was ignored and images always started centered. It now sets the initial position, and changing it moves the crop area, as in v14.
- **Changing `width` or `height` no longer reloads the image** — the loaded image is resized in place and keeps its position.
- **The image is loaded once on mount** — it was loaded twice, so `onLoadStart` and `onLoadSuccess` fired twice.

## 15.2.0 (2026-09-30)

### Features

- **Keyboard accessibility** ([#376](https://github.com/mosch/react-avatar-editor/issues/376), [#438](https://github.com/mosch/react-avatar-editor/issues/438)) — the canvas is now focusable (`tabIndex=0`, `role="application"`, ARIA labels). Arrow keys pan the image (`keyboardStep` px, ×10 with Shift), `+`/`-` zoom (0.1 step, 0.5 with Shift), Escape blurs the canvas. The canvas focuses on mousedown so keys work right after clicking.
- **Pinch-to-zoom** — two-finger pinch on touch devices zooms the image.
- **Wheel zoom** — opt-in mouse wheel / trackpad zoom via the new `enableWheelZoom` prop (default `false`).
- **`onRequestScaleChange` callback** — called with the requested scale for keyboard, pinch and wheel zoom. `scale` stays controlled, so update it in your state to apply the zoom.
- **`keyboardStep` prop** — pixels moved per arrow key press (default `1`).

### Chores

- Dependency bumps for security advisories.

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
