/** Prefix passed as the first argument to every `console.warn` / `console.error` call. */
export const LOG_PREFIX = "[TransferList]";

/** Fallback label for the left panel when the property is empty. */
export const DEFAULT_LEFT_LABEL = "Available";

/** Fallback label for the right panel when the property is empty. */
export const DEFAULT_RIGHT_LABEL = "Selected";

/** Fallback height for the scrollable panel body when the property is empty. */
export const DEFAULT_PANEL_HEIGHT = "300px";

/** Placeholder text shown inside the search input when it is empty. */
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
