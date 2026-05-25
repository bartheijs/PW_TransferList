# TransferList — Feature Backlog

Possible future features for upcoming releases. Each item links to a detailed plan where one exists.

---

## 💡 Tips — read before picking the next feature

> **Selection already survives search changes at the data level.**
> The internal selection is a `Set<string>` of item IDs, and `handleMoveSelectedRight` / `handleMoveSelectedLeft` iterate the full unfiltered datasource — so checked items that are hidden by a search query are already moved correctly when the user clicks Move Selected. What is missing is making this _visible_: the count badge and the select-all checkbox both need to account for hidden-but-checked items. Pick this one together with **"Selection count badge"** and **"Select-all checkbox"** since all three touch the same part of the UI.

---

## Features

### 🔲 "Listen to widget" — Data View selection support
**Plan:** [feature-listen-to-dataview.md](feature-listen-to-dataview.md)

Allow a Mendix Data View (or any widget using "Listen to widget") to react to the item currently focused in either panel.

- Expose `leftSelection` and `rightSelection` properties of `type="selection"` in the widget XML.
- `Single` selection: fires on single click in `dblclick` and `dragdrop` modes; fires on checkbox toggle in `multiselect` mode.
- `Multi` selection: syncs the full checkbox set in `multiselect` mode.
- `click` mode: selection is actively cleared (stale data prevention) and a Studio Pro warning is shown.
- Requires Mendix 10.7+.

---

### 🔲 Logging
Structured runtime logging to help developers debug widget behaviour.

- Use `console.warn` / `console.error` with `LOG_PREFIX` (already in `src/constants.ts`) consistently across all code paths.
- Consider log levels or a `debugMode` boolean property to enable verbose output (datasource status, action calls, selection changes) without polluting production consoles.
- Audit existing log calls and ensure every meaningful error/warning path is covered.

---

### 🔲 Error messaging
Surface runtime errors to the end user (or developer) in a visible, accessible way instead of silently failing.

- Show inline error states when a datasource fails to load (e.g. `ValueStatus.Unavailable`).
- Show error feedback when an `onAdd` / `onRemove` action throws or is unavailable.
- Consider a configurable `type="widgets"` error slot so developers can place their own error UI, or a simple built-in fallback message.
- Ensure errors are announced to screen readers via `role="alert"`.

---

### 🔲 Custom empty-list messages
Allow developers to configure the text (or content) shown when a panel has no items.

- Replace the hardcoded `EMPTY_PLACEHOLDER` constant in `src/constants.ts` with configurable `type="textTemplate"` properties (one per panel, both optional, with a sensible translation default).
- Optionally support a `type="widgets"` slot per panel for richer empty-state content (illustration, button, etc.).
- Both panels should be independently configurable.

---

### 🔲 Clear selection button (multiselect mode)
A per-panel button that deselects all currently checked items in one click, without moving any items.

- Only visible when `interactionMode` is `multiselect` and at least one item is checked.
- Rendered in the panel header (alongside the item count and the future select-all checkbox).
- Clears the full selection set, including items hidden by an active search filter.
- Accessible: keyboard-focusable, labelled `"Clear selection"` (or translatable equivalent via `type="textTemplate"`).
- Pairs naturally with the **select-all checkbox** and **persist selection across search** items — all three live in the same panel-header area.

---

### 🔲 Persist selection across search filter changes (multiselect mode)
Items that are checked remain selected even when the user types a search query that filters them out of view.

- Currently the selection `Set<string>` already stores item IDs, not references to visible items, so the data model supports this — the gap is purely in UX: hidden items are silently excluded from Move Selected.
- `handleMoveSelectedRight` / `handleMoveSelectedLeft` iterate over `leftDataSource.items` / `rightDataSource.items` (the full unfiltered list) and check against the selection set, so checked-but-hidden items **are** already moved correctly. The main work is making the behaviour visible and intentional rather than accidental.
- The selection count badge (see below) should reflect the full selection, not just the visible subset — e.g. show "5 selected (2 hidden by search)" or simply "5 selected" while the filtered list shows fewer rows.
- The Move Selected button tooltip / label should indicate that hidden selected items will also move.
- The select-all checkbox (see below) should only select/deselect *visible* items, leaving hidden selections untouched.
- When the search is cleared or changed, previously hidden selected items reappear with their checkboxes checked.

---

### 🔲 Select-all checkbox in panel header (multiselect mode)
Standard transfer-list pattern: a checkbox in the header row that selects or deselects all visible items in the panel at once.

- Only visible when `interactionMode` is `multiselect`.
- Indeterminate state when some (but not all) items are checked.
- Respects the active search filter — "select all" selects only the filtered visible items, not hidden ones.
- Pairs naturally with the existing Move Selected button.

---

### 🔲 Non-movable items with tooltip and detail selection
Items whose move-eligibility is determined by an expression at render time. Non-movable items show a hover tooltip explaining why, but remain selectable so the user can inspect details in a listening Data View.

**The key insight:** validation is _pre-computed_ (expression on the item), not triggered at move time. The item visually communicates its state the moment it appears in the list — no surprise blocking dialogs.

- New `type="expression"` boolean properties per panel: `leftItemMovable` / `rightItemMovable`. When `false`, the item cannot be moved.
- New `type="textTemplate"` properties per panel: `leftItemNotMovableMessage` / `rightItemNotMovableMessage`. Text is shown in a tooltip on hover and as an `aria-description` for screen readers.
- Non-movable items are rendered in a visually distinct (e.g. muted/greyed) style but remain **fully clickable for selection** — single click still fires `onItemFocus` so a "Listen to widget" Data View can display the item's details (e.g., a record explaining the restriction).
- Non-movable items are excluded from: `onActivate` (click/dblclick move), drag-and-drop targets/sources, "Move All", and "Move Selected" bulk operations.
- In multiselect mode the checkbox is shown but disabled (`aria-disabled="true"`); the item can still be focused/clicked for the Listen-to-widget selection.
- Drag-and-drop: the item is not draggable (`draggable="false"`); if somehow dropped onto it cross-panel the drop is ignored.
- Related to **Read-only / disabled mode** (widget-level lock) — this is the per-item, reason-aware counterpart.

---

### 🔲 Item ordering / drag-to-reorder within a panel
Allow end-users to rearrange items within the right panel (and optionally the left panel) via drag-and-drop, in addition to moving items between panels.

- Only active when `interactionMode` is `dragdrop`.
- An optional `onReorder` `type="action"` per panel, providing the moved item and a new index (or the item it was dropped before/after) so the developer can persist the new order.
- Visual drop indicator (insertion line) distinguishing an intra-panel reorder from a cross-panel move.
- Requires careful hit-testing to distinguish "drop on item to reorder" vs "drop on panel to move".

---

### 🔲 Read-only / disabled mode (widget level)
A widget-level editability expression that locks the entire widget — no items can be moved and no buttons can be clicked.

- Implemented as a standard Mendix `Editability` system property or a custom `type="expression"` boolean `readOnly` property.
- All buttons (`›`, `‹`, `»`, `«`) become disabled; drag handles are removed; click/dblclick handlers are suppressed.
- Visual indication (opacity or `cursor: not-allowed`) consistent with Mendix Atlas theme conventions.
- Distinct from per-item disabled state (see "Disabled items").

---

### 🔲 Batch action (move all selected in one call)
Replace the current "one action call per item" model with a single action invocation that receives the full list of moved items at once.

- New optional `type="action"` properties: `onAddBatch` (left datasource) and `onRemoveBatch` (right datasource).
- When a batch action is configured it is called once with the full selection/visible list; the existing per-item `onAdd`/`onRemove` remain as fallbacks.
- Eliminates the N×XHR problem for microflow-backed lists without requiring a nanoflow.
- Requires Mendix support for list-typed action parameters (verify platform capability before implementing).
- Studio Pro: show info message when both per-item and batch actions are configured on the same panel.

---

### 🔲 Server-side search
Expose the active search query as an attribute so the datasource can filter server-side instead of client-side.

- New optional `type="attribute"` string properties: `leftSearchQuery` and `rightSearchQuery` (writable, i.e. set by the widget).
- When a query attribute is configured, the widget writes the search input value into it; the developer wires the attribute into a datasource XPath constraint or nanoflow parameter to drive server-side filtering.
- Client-side filtering (`filterItemsBySearch`) is bypassed when the query attribute is set.
- Useful for very large datasets where loading everything into the browser is not feasible.

---

### 🔲 Pre-select items by expression (multiselect mode)
Programmatically pre-check items in a panel when the widget first loads or when the datasource refreshes.

- New optional `type="expression"` boolean properties: `leftItemPreSelected` and `rightItemPreSelected`, evaluated per item.
- Items for which the expression returns `true` start with their checkbox checked.
- Selection state is initialised from the expression on first render and on datasource refresh (configurable: always sync, or only on initial load).
- Useful for resuming a previous session state or pre-filling a form.

---

### 🔲 Horizontal / stacked layout
Stack the two panels vertically (top / bottom) instead of side by side, for narrow containers or mobile-friendly layouts.

- New `type="enumeration"` property `layoutDirection` with values `horizontal` (default, current behaviour) and `vertical`.
- In vertical mode the controls column is rendered as a row between the two panels; arrow icons rotate 90°.
- CSS-only switch using a modifier class (`transfer-list--vertical`) on the root element; no JS logic change required.
- Studio Pro preview reflects the layout direction.

---

### 🔲 Custom controls column (widget slot)
Replace the built-in arrow buttons with a `type="widgets"` slot so developers can place their own buttons, labels, or any other content in the middle column.

- New optional `type="widgets"` property `customControls`.
- When populated, the default `TransferControls` component is hidden and the slot content is rendered in its place.
- The developer is responsible for wiring up their own buttons to nanoflows that trigger the data moves; the widget does not expose imperative move APIs.
- Studio Pro: show an info message explaining that built-in move buttons are hidden when the slot is in use.

---

### 🔲 Selection count badge (multiselect mode)
Show how many items are currently checked in each panel header alongside the total item count.

- Only visible when `interactionMode` is `multiselect`.
- Rendered as a secondary count element in the panel header (e.g. "3 / 12").
- Updates live as the user toggles checkboxes; announced to screen readers via the existing `aria-live` region.
- Controlled by the existing `showCount` property (if count is off, the selection count is also hidden).

---

### 🔲 Keyboard shortcuts for move buttons
Allow keyboard users to trigger move actions without navigating to the button column.

- `Alt+→` (or a configurable key) triggers Move Selected Right when focus is anywhere in the left panel.
- `Alt+←` triggers Move Selected Left when focus is anywhere in the right panel.
- In `click` / `dblclick` mode these shortcuts act as the primary activation mechanism (moves the focused item).
- Shortcuts are discoverable via `title` / `aria-keyshortcuts` on the move buttons.
- Configurable: a `type="boolean"` property `enableKeyboardShortcuts` (default: `true`); a Studio Pro note documents the key bindings.

---

_Add new items above this line._
