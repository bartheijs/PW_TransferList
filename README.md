# TransferList

A Mendix pluggable widget that lets end-users move objects between two lists — "available" on the left and "selected" on the right — using click, double-click, checkbox selection, or drag-and-drop.

## Features

- **Two configurable panels** with independent datasources, labels, and widget content templates.
- **Four interaction modes**: single click, double click, multi-select with checkboxes, and drag-and-drop.
- **Per-item actions** via nanoflow or microflow: one action for moving right (add), one for moving left (remove).
- **Bulk move** buttons (move all right / move all left) with separate actions.
- **Live search** on either or both panels using a configurable text template.
- **Configurable panel height** with vertical scroll on overflow.
- **Accessible**: keyboard navigation, ARIA roles, and screen-reader-friendly live regions.
- **Studio Pro design preview** with drop zones for both content slots.

## Usage

### 1. Place the widget

Drop the **Transfer List** widget anywhere on a page — it does not require a surrounding data view.

### 2. Configure General properties

| Property | Description |
|---|---|
| **Left data source** | Datasource (database, microflow, nanoflow, or association) providing the objects for the left panel. Must be a list. |
| **Left panel content** | Widget slot for the item template rendered inside each row of the left panel. The template runs in the context of each object from the left datasource. |
| **Left panel label** | Text shown in the header of the left panel. Defaults to **Available**. |
| **Right data source** | Datasource for the right panel objects. |
| **Right panel content** | Widget slot for the right panel item template. |
| **Right panel label** | Header text for the right panel. Defaults to **Selected**. |

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

| Property | Type | Description |
|---|---|---|
| **Add action** | ListActionValue (per item) | Executed when a single item is moved from the left panel to the right. Receives the dragged or clicked object as context. |
| **Remove action** | ListActionValue (per item) | Executed when a single item is moved from the right panel to the left. |
| **Add all action** | ActionValue | Executed when the **»** (move all right) button is clicked. |
| **Remove all action** | ActionValue | Executed when the **«** (move all left) button is clicked. |

> **Tip:** Use a nanoflow for `Add action` and `Remove action`. Inside the nanoflow the triggering object is available as a parameter. Refresh the datasources at the end of the nanoflow to reflect the change in both panels.

`Add all action` and `Remove all action` are only shown in Studio Pro when **Show move all buttons** is enabled.

### 5. Optionally enable search

| Property | Description |
|---|---|
| **Show left search** | Toggles a search input above the left panel. |
| **Left search text** | Text template (attribute or expression) evaluated per object. The widget filters items whose evaluated text contains the search query (case-insensitive). Only visible when *Show left search* is on. |
| **Show right search** | Toggles a search input above the right panel. |
| **Right search text** | Same as above, for the right panel. Only visible when *Show right search* is on. |

Search is client-side and filters the items already loaded from the datasource. It does not re-query the database.

### 6. Appearance

| Property | Description |
|---|---|
| **Show move all buttons** | Shows the **»** (move all right) and **«** (move all left) buttons in the controls column. Also reveals the *Add all action* and *Remove all action* properties. |
| **Panel height** | CSS height value for the scrollable panel body, e.g. `300px`, `20rem`, or `50vh`. Defaults to `300px`. |

Standard Mendix system properties **Name**, **Tab index**, and **Visibility** are also available under **Appearance**.

## Interaction modes in detail

### Click / Double click

Best for simple lists where each click immediately triggers a server action. The widget calls `onAdd.get(item).execute()` (left → right) or `onRemove.get(item).execute()` (right → left). The action's `canExecute` flag is respected; a warning is logged when it is false.

### Multi select

Users build a selection by clicking rows or toggling checkboxes, then confirm by clicking the arrow buttons. The widget iterates over all selected items and calls the action for each one sequentially. Selection is cleared after the move.

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
