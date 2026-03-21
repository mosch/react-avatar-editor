export const isTouchDevice =
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0)
