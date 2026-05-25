# TransferList

A Mendix pluggable widget that lets end-users move objects between two lists — "available" on the left and "selected" on the right — using click, double-click, checkbox selection, or drag-and-drop.

## Features

- **Two configurable panels** with independent datasources, label slots, and widget content templates.
- **Four interaction modes**: single click, double click, multi-select with checkboxes, and drag-and-drop.
- **Per-item actions** via nanoflow or microflow: one action for moving right (add), one for moving left (remove).
- **Bulk move** buttons (move all right / move all left).
- **Live search** on either or both panels using a configurable, translatable text template.
- **Configurable panel height** — fixed (explicit px/rem/vh) or fill (expands to parent container height).
- **Panel minimum height** (fill mode) — prevents panels from collapsing when few items are present.
- **Optional item count** in each panel header.
- **Custom button icons** — replace the default arrow glyphs with any Studio Pro icon.
- **Accessible**: keyboard navigation, ARIA roles, and screen-reader-friendly live regions.
- **Studio Pro design preview** with drop zones for both content slots and both label slots.

## Usage

### 1. Place the widget

Drop the **Transfer List** widget anywhere on a page — it does not require a surrounding data view.

### 2. Configure General properties

| Property | Description |
|---|---|
| **Left data source** | Datasource (database, microflow, nanoflow, or association) providing the objects for the left panel. Must be a list. |
| **Left panel content** | Widget slot for the item template rendered inside each row of the left panel. The template runs in the context of each object from the left datasource. |
| **Left panel label** | Widget slot for the left panel header. Drop a Text widget or any other content here. |
| **Right data source** | Datasource for the right panel objects. |
| **Right panel content** | Widget slot for the right panel item template. |
| **Right panel label** | Widget slot for the right panel header. |
| **Show item count** | Toggle the numeric item count badge in each panel header. Default: on. |
| **Panel height mode** | **Fixed height**: set an explicit height. **Fill parent container**: expand to fill the parent container height. |
| **Panel height** | Numeric height value in the chosen unit. Only shown in Fixed height mode. Default: 300. |
| **Panel height unit** | CSS unit for the panel height: `px`, `rem`, or `vh`. Only shown in Fixed height mode. |
| **Panel min. height** | Minimum height for the panel body (fill mode only). 0 = no minimum. Prevents the panel from collapsing when few items are present. |
| **Panel min. height unit** | CSS unit for the minimum height: `px`, `rem`, or `vh`. Only shown when a min. height value is entered. |

The two datasources are fully independent. Filtering which objects appear in each panel — and updating persistent data after a move — is handled entirely by your actions (see below).

### 3. Choose an interaction mode

Set **Interaction mode** in the **Interaction** property group:

| Mode | Behaviour |
|---|---|
| **Click** | A single click on an item immediately executes the add or remove action for that item. |
| **Double click** | A double-click on an item executes the action. Single clicks have no effect. |
| **Multi select** | Each item shows a checkbox. Users check one or more items and then use the **›** / **‹** buttons in the middle column to move the selection. |
| **Drag and drop** | Items are draggable. Dropping an item onto the opposite panel executes the action. The target panel highlights when a drag is in progress. |

### 4. Wire up actions

These properties are in the **Events** property group.

| Property | Type | Description |
|---|---|---|
| **Add action** | ListActionValue (per item) | Executed once for each item moved from the left panel to the right. Receives the object as context. |
| **Remove action** | ListActionValue (per item) | Executed once for each item moved from the right panel to the left. |

> **Important — one action call per item:** `Add action` and `Remove action` are called individually for every item that moves, including when using the **Move All** or **Move Selected** buttons. If you use a **microflow**, each call triggers a separate server round-trip. For large lists (20+ items) this can flood the server with concurrent requests.
>
> **Recommendation:** Use a **nanoflow** for add/remove actions wherever possible — nanoflows execute entirely in the browser and have no per-item network cost. If you need server-side logic for bulk moves, keep datasource page sizes small (typically ≤ 20 items) or implement batch processing in a nanoflow that delegates to the server only once.

#### Move-selected button icons

In **Multi select** mode, two additional icon properties become visible in the **Interaction** property group:

| Property | Default glyph | Description |
|---|---|---|
| **Move selected right icon** | `›` | Icon for the Move selected to right button. |
| **Move selected left icon** | `‹` | Icon for the Move selected to left button. |

### 5. Configure Move all

These properties are in the **Interaction** property group.

| Property | Description |
|---|---|
| **Show move all buttons** | Shows the **»** (move all right) and **«** (move all left) buttons in the controls column. |
| **Move all right icon** | Replaces the default `»` glyph. Only visible when *Show move all buttons* is on. |
| **Move all left icon** | Replaces the default `«` glyph. Only visible when *Show move all buttons* is on. |

When clicked, the move-all action fires once per visible item (respecting any active search filter).

### 6. Optionally enable search

These properties are in the **Search** property group.

| Property | Description |
|---|---|
| **Show left search** | Toggles a search input above the left panel. |
| **Left search text** | Text template evaluated per object. Items whose text contains the search query (case-insensitive) are shown. Only visible when *Show left search* is on. |
| **Left search placeholder** | Placeholder text in the left search box. Supports Mendix translations (Batch Translate). Falls back to `Search…`. |
| **Show right search** | Toggles a search input above the right panel. |
| **Right search text** | Same as above, for the right panel. |
| **Right search placeholder** | Placeholder text in the right search box. Supports Mendix translations. |

Search is client-side and filters the items already loaded from the datasource. It does not re-query the database.

> **Large datasets:** The widget renders every item loaded from the datasource. For optimal performance, use datasource pagination to limit the number of items loaded at once rather than loading thousands of records into the browser.

Standard Mendix system properties **Name**, **Tab index**, and **Visibility** are also available.

## Interaction modes in detail

### Click / Double click

Best for simple lists where each click immediately triggers a server action. The widget calls `onAdd.get(item).execute()` (left → right) or `onRemove.get(item).execute()` (right → left). The action's `canExecute` flag is respected; a warning is logged when it is false.

### Multi select

Users build a selection by clicking rows or toggling checkboxes, then confirm by clicking the arrow buttons. The widget iterates over all selected items and calls the action for each one. Selection is cleared after the move.

### Drag and drop

Users drag a row and drop it on the opposite panel (or any row within it). The source panel and target panel are detected automatically. Only cross-panel drops trigger an action; dropping back on the same panel is a no-op.

## Example nanoflow for Add action

1. **Parameter**: `YourEntity` (the object being moved).
2. Change the object — e.g. set a boolean attribute `IsSelected = true` or change an association.
3. Commit the object.
4. Refresh the left datasource (to remove the moved item).
5. Refresh the right datasource (to add it).

The widget does not manage object state itself; all persistence and datasource refreshes are the responsibility of your actions.

## Issues, suggestions and feature requests

Please open an issue on [GitHub](https://github.com/bartheijs/PW_TransferList/issues).

## Development and contribution

```bash
npm install --legacy-peer-deps   # install dependencies (npm v7+)
npm run dev                      # start dev server with hot reload
npm start                        # copy bundle to Mendix test project on save
npm run build                    # development build
npm run release                  # production build (runs lint first)
npm run lint                     # lint
npm run lint:fix                 # auto-fix lint issues
```
