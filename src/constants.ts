/** Prefix passed as the first argument to every `console.warn` / `console.error` call. */
export const LOG_PREFIX = "[TransferList]";

/** Default numeric height for the panel body (matches XML defaultValue). */
export const DEFAULT_PANEL_HEIGHT = 300;

/** Default CSS unit for the panel body height (matches XML defaultValue). */
export const DEFAULT_PANEL_HEIGHT_UNIT = "px";

/**
 * Keys for the `panelHeightMode` enumeration property.
 * Must stay in sync with `<enumerationValue>` keys in `TransferList.xml`.
 */
export const PANEL_HEIGHT_MODES = {
    FIXED: "fixed",
    FILL: "fill"
} as const;

/** Union of all valid panel height mode values. */
export type PanelHeightMode = (typeof PANEL_HEIGHT_MODES)[keyof typeof PANEL_HEIGHT_MODES];

/** Placeholder text shown inside the search input when it is empty and no custom placeholder is configured. */
export const SEARCH_PLACEHOLDER = "Search…";

/** Text shown inside the panel body when there are no items to display. */
export const EMPTY_PLACEHOLDER = "No items";

/**
 * Keys for the `interactionMode` enumeration property.
 * These values must stay in sync with the `<enumerationValue>` keys in `TransferList.xml`.
 */
export const INTERACTION_MODES = {
    CLICK: "click",
    DOUBLE_CLICK: "dblclick",
    MULTISELECT: "multiselect",
    DRAG_DROP: "dragdrop"
} as const;

/** Union of all valid interaction-mode values. */
export type InteractionMode = (typeof INTERACTION_MODES)[keyof typeof INTERACTION_MODES];

/** Identifies which of the two panels an event or drag originates from. */
export type PanelSide = "left" | "right";

/**
 * Number of items above which a bulk-move operation (Move All / Move Selected) will
 * emit a console.warn advising the developer to consider nanoflows or pagination.
 * Each item triggers one action call; with microflows this means one XHR per item.
 */
export const BULK_MOVE_WARN_THRESHOLD = 20;

/**
 * Maximum milliseconds to show the bulk-move spinner before clearing it automatically.
 * Acts as a safety net when the Mendix datasource never cycles through a loading state
 * (e.g. the action was a no-op or Studio Pro preview mode).
 */
export const BULK_MOVE_SAFETY_TIMEOUT_MS = 5000;

/**
 * Minimum number of items that must be transferred for the bulk-move spinner
 * to appear in the controls column. Single-item or very small moves do not
 * warrant a loading indicator.
 */
export const BULK_MOVE_SPINNER_THRESHOLD = 5;
