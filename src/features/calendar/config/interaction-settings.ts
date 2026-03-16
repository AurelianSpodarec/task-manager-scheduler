/** Radius from selection origin after which hover selection is dismissed. */
export const MOUSE_AWAY_RADIUS_PX = 250

/** Horizontal edge zone ratio used to advance to adjacent day while dragging. */
export const DRAG_HORIZONTAL_ADVANCE_ZONE = 0.15

/** Horizontal commit ratio used when entering adjacent day columns. */
export const DRAG_HORIZONTAL_COMMIT_ZONE = 0.35

/** Minimum horizontal pointer delta before snap logic can advance day. */
export const DRAG_HORIZONTAL_MIN_DELTA_PX = 2

/** Vertical commit ratio used when moving to adjacent time slots. */
export const DRAG_VERTICAL_COMMIT_ZONE = 0.35

/** Minimum vertical pointer delta before vertical snap logic can advance slot. */
export const DRAG_VERTICAL_MIN_DELTA_PX = 2

/** Minimum vertical commit distance to avoid hypersensitive slot changes. */
export const DRAG_VERTICAL_MIN_COMMIT_PX = 4
