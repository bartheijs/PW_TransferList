# TransferList — Functional Test Script

## Test setup

### Domain model

Create two entities in a Mendix module (e.g. `TransferListTest`):

| Entity | Attribute | Type |
|---|---|---|
| `Product` | `Name` | String |
| `Product` | `IsSelected` | Boolean (default `false`) |

Populate at least **10 Product objects** for meaningful testing (e.g. Product 01 – Product 10).

### Datasources

- **Left datasource** — XPath over `Product` where `IsSelected = false`, sorted by `Name`.
- **Right datasource** — XPath over `Product` where `IsSelected = true`, sorted by `Name`.

### Actions

| Action | Logic |
|---|---|
| **Add nanoflow** (`ACT_AddProduct`) | Parameter `Product`. Set `IsSelected = true`. Commit. |
| **Remove nanoflow** (`ACT_RemoveProduct`) | Parameter `Product`. Set `IsSelected = false`. Commit. |

### Widget configuration (base)

Place the **Transfer List** widget on a page. Configure:

**Source tab:**
- Left data source → left datasource above
- Right data source → right datasource above
- Left panel label → text widget "Available"
- Right panel label → text widget "Selected"

**Events tab:**
- Add action → `ACT_AddProduct`
- Remove action → `ACT_RemoveProduct`

---

## T-00 Studio Pro property panel layout

These tests verify the property panel tab structure in Studio Pro.

### T-00.1 Five tabs are present

**Steps:**
1. Place the widget on a page.
2. Open its properties.

**Expected:**
- Five tabs are visible: **Source**, **General**, **Interaction**, **Events**, **Search**.

### T-00.2 Interaction tab contains the correct properties

**Steps:**
1. Open the **Interaction** tab.

**Expected:**
- Properties visible: Interaction mode, Show move all buttons.
- Properties **not** present (conditionally hidden): Move selected right icon, Move selected left icon, Move all right icon, Move all left icon.

### T-00.3 Events tab contains the correct properties

**Steps:**
1. Open the **Events** tab.

**Expected:**
- Properties visible: Add action, Remove action.
- No other properties.

### T-00.4 Move all icon properties hidden when Show move all is off

**Steps:**
1. In the **Interaction** tab, set `Show move all buttons` to `false`.
2. Inspect the tab.

**Expected:**
- `Move all right icon` and `Move all left icon` are **not visible**.

### T-00.5 Move selected icon properties hidden outside multiselect mode

**Steps:**
1. In the **Interaction** tab, set `Interaction mode` to **Click**.
2. Inspect the tab.

**Expected:**
- `Move selected right icon` and `Move selected left icon` are **not visible**.

---

## T-01 Basic rendering

### T-01.1 Both panels display

**Steps:**
1. Open the page.

**Expected:**
- Left panel shows all products where `IsSelected = false`.
- Right panel shows all products where `IsSelected = true` (empty initially).
- Both panel headers show the configured label.

---

### T-01.2 Item count badge

**Steps:**
1. Confirm `Show item count` is `true` (default).
2. Open the page.

**Expected:**
- Left panel header shows a numeric badge equal to the number of available items.
- Right panel header shows `0` (no selected items).

### T-01.3 Hide item count

**Steps:**
1. Set `Show item count` to `false`.
2. Open the page.

**Expected:**
- No numeric badge is visible in either panel header.
- Label text is still present.

### T-01.4 Empty state

**Steps:**
1. Move all items to the right panel (use any interaction mode).
2. Observe the left panel body.

**Expected:**
- Left panel body shows the placeholder text "No items".
- The panel does not collapse to zero height in fixed-height mode.

---

## T-02 Interaction mode — Click

**Precondition:** Set `Interaction mode` to **Click**.

### T-02.1 Single click moves item right

**Steps:**
1. Click any item in the left panel.

**Expected:**
- Item disappears from the left panel.
- Item appears in the right panel.
- Item count badges update.

### T-02.2 Single click moves item left

**Steps:**
1. Click any item in the right panel.

**Expected:**
- Item disappears from the right panel.
- Item reappears in the left panel.

### T-02.3 No move-selected buttons shown

**Expected:**
- The `›` and `‹` buttons are **not** visible in the controls column.

---

## T-03 Interaction mode — Double click

**Precondition:** Set `Interaction mode` to **Double click**.

### T-03.1 Single click does nothing

**Steps:**
1. Single-click an item in the left panel.

**Expected:**
- Item does not move. Datasources unchanged.

### T-03.2 Double-click moves item

**Steps:**
1. Double-click an item in the left panel.

**Expected:**
- Item moves to the right panel.

### T-03.3 Double-click moves item back

**Steps:**
1. Double-click an item in the right panel.

**Expected:**
- Item moves back to the left panel.

---

## T-04 Interaction mode — Multi select

**Precondition:** Set `Interaction mode` to **Multi select**.

### T-04.1 Checkboxes are visible

**Expected:**
- Each item in both panels shows a checkbox on the left.

### T-04.2 Select multiple items

**Steps:**
1. Check 3 items in the left panel.

**Expected:**
- The checked items appear visually selected (highlighted background).
- The `›` (move-selected-right) button becomes enabled.
- The `‹` (move-selected-left) button remains disabled (nothing selected on the right).

### T-04.3 Move selected right

**Steps:**
1. Select 3 items in the left panel.
2. Click `›`.

**Expected:**
- The 3 selected items move to the right panel.
- Selection is cleared after the move.
- `›` button becomes disabled again.

### T-04.4 Move selected left

**Steps:**
1. Select 2 items in the right panel.
2. Click `‹`.

**Expected:**
- The 2 selected items return to the left panel.
- Selection is cleared.

### T-04.5 Select across both panels independently

**Steps:**
1. Check 2 items in the left panel and 2 in the right panel.
2. Click `›`.

**Expected:**
- Only the left-panel selection moves right.
- Right-panel selection is not affected.
- Left-panel selection is cleared; right-panel selection remains.

---

## T-05 Interaction mode — Drag and drop

**Precondition:** Set `Interaction mode` to **Drag and drop**.

### T-05.1 Drag item to opposite panel

**Steps:**
1. Drag an item from the left panel and drop it onto the right panel body.

**Expected:**
- Item moves to the right panel.
- The right panel showed a highlight (blue dashed outline) during the drag-over state.

### T-05.2 Drag highlight appears

**Steps:**
1. Start dragging an item from the left panel.
2. Hover over the right panel without dropping.

**Expected:**
- Right panel body has a visible drag-over highlight.
- Left panel has no highlight.

### T-05.3 Drop back on same panel is a no-op

**Steps:**
1. Drag an item from the left panel and drop it back onto the left panel.

**Expected:**
- Item stays in the left panel. No action is triggered.

### T-05.4 No move-selected buttons in drag-drop mode

**Expected:**
- The `›` and `‹` buttons are **not** visible.

---

## T-06 Move All buttons

**Precondition:** Set `Show move all buttons` to `true` (in the **Interaction** tab in Studio Pro).

### T-06.1 Move All right button is visible

**Expected:**
- `»` button appears above `›` (or as the only button when not in multiselect mode).

### T-06.2 Move All left button is visible

**Expected:**
- `«` button appears below `‹` (or as the only button).

### T-06.3 Move all right moves all visible items

**Steps:**
1. Ensure the left panel has multiple items.
2. Click `»`.

**Expected:**
- All items in the left panel move to the right panel.
- Left panel shows "No items".
- Item counts update.

### T-06.4 Move all left moves all visible items

**Steps:**
1. From T-06.3 state (all items on right), click `«`.

**Expected:**
- All items return to the left panel.
- Right panel shows "No items".

### T-06.5 Move all respects active search filter

**Steps:**
1. Enable left search (see T-08 for setup).
2. Type a query that matches only 2 of 10 items.
3. Click `»`.

**Expected:**
- Only the 2 visible (filtered) items move to the right panel.
- The other 8 items remain in the left panel.

### T-06.6 Spinner appears during Move All (> 5 items)

**Precondition:** Ensure at least 6 items are in the left panel.

**Steps:**
1. Click `»`.
2. Observe the controls column immediately after clicking.

**Expected:**
- The `»`, `«`, `›`, `‹` buttons are replaced by a small circular spinner.
- After the datasource refreshes, the spinner disappears and the buttons return.

### T-06.7 No spinner for small moves (≤ 5 items)

**Precondition:** Reduce the left panel to exactly 5 items (move the rest to the right first).

**Steps:**
1. Click `»`.
2. Observe the controls column immediately after clicking.

**Expected:**
- No spinner is shown. The buttons remain visible and the items move silently.

### T-06.8 Hide move all buttons

**Steps:**
1. Set `Show move all buttons` to `false`.

**Expected:**
- `»` and `«` buttons are not rendered.
- `›` and `‹` buttons (multiselect mode only) are unaffected.

### T-06.9 Move all preserves hidden selections

**Precondition:** Set `Interaction mode` to **Multi select** and enable left search.

**Steps:**
1. Select 3 items in the left panel.
2. Type a query that leaves 2 selected items visible and hides the third selected item.
3. Click `»`.
4. Clear the search query.

**Expected:**
- Only the 2 visible items move to the right panel.
- The hidden item remains in the left panel and remains selected.

---

## T-07 Custom button icons

**Precondition:** In Studio Pro, open the **Interaction** tab. Set `Show move all buttons` to `true` and `Interaction mode` to **Multi select**.

### T-07.1 Configure a custom Move All Right icon

**Steps:**
1. In the **Interaction** tab, set `Move all right icon` to any available glyph (e.g. arrow-right).
2. Run the app.

**Expected:**
- The `»` button shows the configured icon instead of the `»` glyph.

### T-07.2 Configure a custom Move Selected Right icon

**Steps:**
1. In the **Interaction** tab, set `Move selected right icon` to a glyph.
2. Run the app.

**Expected:**
- The `›` button shows the configured icon.

### T-07.3 Configure all four icons

**Steps:**
1. In the **Interaction** tab, set all four icon properties (`Move selected right icon`, `Move selected left icon`, `Move all right icon`, `Move all left icon`).
2. Run the app.

**Expected:**
- All four buttons show their configured icons.

### T-07.4 Move selected icon properties hidden outside multiselect mode

**Steps:**
1. In the **Interaction** tab, set `Interaction mode` to **Click**.
2. Inspect the **Interaction** tab.

**Expected:**
- `Move selected right icon` and `Move selected left icon` are **not visible**.
- `Move all right icon` and `Move all left icon` are visible (when `Show move all buttons` is `true`).

### T-07.5 Move all icon properties hidden when Show move all is off

**Steps:**
1. In the **Interaction** tab, set `Show move all buttons` to `false`.
2. Inspect the **Interaction** tab.

**Expected:**
- `Move all right icon` and `Move all left icon` are **not visible**.

---

## T-08 Search

**Precondition:** Set `Show left search` to `true`. Set `Left search text` to a text template using the `Name` attribute.

### T-08.1 Search input appears

**Expected:**
- A text input with placeholder "Search…" appears above the left panel body.

### T-08.2 Search filters items case-insensitively

**Steps:**
1. Type `product 0` in the left search box.

**Expected:**
- Only items whose name contains "product 0" (case-insensitive) are shown.
- Items not matching disappear from view.
- Item count badge updates to the number of matching items.

### T-08.3 Clear search restores all items

**Steps:**
1. Clear the search box (delete all text or click the `×` in the browser's native search input).

**Expected:**
- All left-panel items reappear.
- Item count returns to the full count.

### T-08.4 No-match state

**Steps:**
1. Type a string that matches no items (e.g. `zzz`).

**Expected:**
- Left panel body shows "No items".
- Item count shows `0`.

### T-08.5 Right panel search works independently

**Steps:**
1. Also set `Show right search` to `true` and configure `Right search text`.
2. Move some items to the right panel.
3. Type in the right panel search box.

**Expected:**
- Right panel filters independently from the left.
- Left panel search is unaffected.

### T-08.6 Custom placeholder text

**Steps:**
1. Set `Left search placeholder` to a text template with the text `Filter products…`.
2. Run the app.

**Expected:**
- The left search input shows "Filter products…" as its placeholder.

### T-08.7 Translated placeholder

**Steps:**
1. Set `Left search placeholder` to a text template.
2. Add a Dutch translation: `Producten zoeken…`.
3. Run the app with the app language set to Dutch.

**Expected:**
- The left search input shows "Producten zoeken…".

### T-08.8 Search input remains responsive during fast typing

**Steps:**
1. Click the left search input.
2. Type a 5-character query very quickly.

**Expected:**
- Each character appears immediately in the input with no visible lag.
- The list filters a moment after typing stops (deferred — may briefly show a slightly stale list during rapid input).

---

## T-09 Panel height — Fixed mode

**Precondition:** Set `Panel height mode` to **Fixed**.

### T-09.1 Custom fixed height

**Steps:**
1. Set `Panel height` to `200`, `Panel height unit` to `px`.
2. Run the app and add 20 items to the left panel.

**Expected:**
- The left panel body is exactly 200 px tall.
- Items beyond the visible area are accessible by scrolling.

### T-09.2 Different units

**Steps:**
1. Test with `5rem` and `30vh`.

**Expected:**
- Panel height reflects the configured unit.

### T-09.3 Panel min. height is hidden in fixed mode

**Steps:**
1. In Studio Pro, set `Panel height mode` to **Fixed**.
2. Inspect the widget property panel.

**Expected:**
- `Panel min. height` and `Panel min. height unit` are **not visible**.

---

## T-10 Panel height — Fill mode

**Precondition:** Set `Panel height mode` to **Fill**. Place the widget inside a container with an explicit height (e.g. 500 px).

### T-10.1 Widget fills parent height

**Steps:**
1. Run the app.

**Expected:**
- The widget stretches to fill the 500 px parent.
- Panels grow to match the available height.

### T-10.2 Panel height and unit properties are hidden

**Steps:**
1. In Studio Pro, set `Panel height mode` to **Fill**.
2. Inspect the property panel.

**Expected:**
- `Panel height` and `Panel height unit` are **not visible**.

### T-10.3 Panels do not collapse when items are moved

**Steps:**
1. Move all items out of the left panel.

**Expected:**
- The left panel body does not collapse; it stays at its fill height.

---

## T-11 Panel minimum height (fill mode)

**Precondition:** `Panel height mode` = **Fill**, parent container has no fixed height set.

### T-11.1 Without min height — panel can be very small

**Steps:**
1. Leave `Panel min. height` at `0` (the default).
2. Open the page with 0 items in the right panel.

**Expected:**
- The right panel body may be very small (near zero) if the parent container is auto-sized.

### T-11.2 With min height — panel has a floor

**Steps:**
1. Set `Panel min. height` to `150`, unit `px`.
2. Open the page with 0 items in the right panel.

**Expected:**
- The right panel body is at least 150 px tall even with no items.

### T-11.3 Min height unit selector hidden when value is 0

**Steps:**
1. In Studio Pro, set `Panel height mode` to **Fill**.
2. Confirm `Panel min. height` is `0` (default).
3. Inspect the property panel.

**Expected:**
- `Panel min. height unit` is **not visible**.
- After entering a non-zero value (e.g. `100`), `Panel min. height unit` appears.

---

## T-12 N+1 action warning in browser console

**Precondition:** Open the browser DevTools console. `onAdd` can be a microflow or nanoflow.
The warning threshold is **20 items** — it fires when the item count being moved exceeds 20.

### T-12.1 Console warning fires above threshold

**Precondition:** Ensure at least **21 items** are in the left panel (above the threshold of 20).

**Steps:**
1. Click `»` (Move All Right).

**Expected:**
- A `[TransferList]` warning appears in the console containing the item count and advice to use a nanoflow or datasource pagination.

### T-12.2 No warning below threshold

**Steps:**
1. Reduce left panel to 5 items (well below the threshold of 20).
2. Click `»`.

**Expected:**
- No `[TransferList]` warning in the console.

### T-12.3 Warning fires for Move Selected when above threshold

**Steps:**
1. Set interaction mode to **Multi select**.
2. Select **21+ items** in the left panel.
3. Click `›`.

**Expected:**
- Console warning appears with the selection count.

---

## T-13 Accessibility

### T-13.1 Keyboard navigation in click mode

**Precondition:** `Interaction mode` = **Click**.

**Steps:**
1. Tab to the widget.
2. Use arrow keys or Tab to reach an item.
3. Press Enter or Space.

**Expected:**
- Focus moves through items.
- Pressing Enter/Space on a left-panel item triggers the add action (item moves to right panel).

### T-13.2 ARIA roles present

**Steps:**
1. Open the browser's accessibility inspector.
2. Inspect the panel body when it contains items.

**Expected:**
- Panel body has `role="listbox"`.
- Each item has `role="option"`.

### T-13.3 ARIA role on empty panel

**Steps:**
1. Inspect the panel body when it is empty.

**Expected:**
- No `role="listbox"` present (avoids empty listbox ARIA violation).
- `role="status"` is present on the empty-state div.

### T-13.4 Controls column label

**Expected:**
- Controls column has `role="group"` and `aria-label="Transfer controls"`.

### T-13.5 Item count announced to screen readers

**Steps:**
1. With a screen reader running, move an item.

**Expected:**
- The updated count in the panel header is announced (element has `aria-live="polite"` and `aria-atomic="true"`).

### T-13.6 Spinner accessible

**Steps:**
1. Ensure > 5 items are in the left panel.
2. Click `»` and observe with a screen reader.

**Expected:**
- Screen reader announces "Moving items…" when the spinner appears (`role="status"`, `aria-live="polite"`).

---

## T-14 Edge cases

### T-14.1 Both panels empty

**Steps:**
1. Ensure all items have been moved in both directions and all `IsSelected` values are consistent.
2. Open the page with no items in either panel.

**Expected:**
- Both panels show "No items".
- All move buttons are rendered (enabled/disabled based on selection state).
- Widget does not crash or throw errors in the console.

### T-14.2 Single item in each panel

**Steps:**
1. Configure datasources to return 1 item each.
2. Run the app.

**Expected:**
- Widget renders correctly.
- Moving the single item works.
- Count badges show `1` and `0` after the move.

### T-14.3 Action with canExecute = false

**Steps:**
1. Configure `onAdd` to call a nanoflow with a precondition that returns false (no permission).
2. Click an item in click mode.

**Expected:**
- No move occurs.
- A `[TransferList]` warning is logged to the console (existing behaviour from `executeListItemAction`).

### T-14.4 Widget without actions configured

**Steps:**
1. Leave `Add action` and `Remove action` blank.
2. Open the page.

**Expected:**
- Widget renders without errors.
- Clicking/dragging/selecting does nothing (actions are optional).

### T-14.5 Spinner clears if datasource never refreshes (safety timeout)

**Steps:**
1. Configure `onAdd` to call a nanoflow that does NOT refresh the datasource.
2. Ensure > 5 items are in the left panel.
3. Click `»`.
4. Wait 5 seconds.

**Expected:**
- Spinner appears immediately after clicking.
- Spinner automatically disappears after approximately 5 seconds (safety timeout).

---

## Test results log

| ID | Description | Result | Notes |
|---|---|---|---|
| T-00.1 | Five tabs in Studio Pro | | |
| T-00.2 | Interaction tab contains correct properties | | |
| T-00.3 | Events tab contains correct properties | | |
| T-00.4 | Move all icons hidden when Show move all is off | | |
| T-00.5 | Move selected icons hidden outside multiselect | | |
| T-01.1 | Both panels display | | |
| T-01.2 | Item count badge | | |
| T-01.3 | Hide item count | | |
| T-01.4 | Empty state | | |
| T-02.1 | Click moves item right | | |
| T-02.2 | Click moves item left | | |
| T-02.3 | No move-selected buttons in click mode | | |
| T-03.1 | Single click does nothing in dbl-click mode | | |
| T-03.2 | Double-click moves item right | | |
| T-03.3 | Double-click moves item left | | |
| T-04.1 | Checkboxes visible in multiselect mode | | |
| T-04.2 | Select multiple items | | |
| T-04.3 | Move selected right | | |
| T-04.4 | Move selected left | | |
| T-04.5 | Independent selection per panel | | |
| T-05.1 | Drag item to opposite panel | | |
| T-05.2 | Drag-over highlight | | |
| T-05.3 | Drop on same panel is no-op | | |
| T-05.4 | No move-selected buttons in drag-drop mode | | |
| T-06.1 | Move All right button visible | | |
| T-06.2 | Move All left button visible | | |
| T-06.3 | Move all right | | |
| T-06.4 | Move all left | | |
| T-06.5 | Move all respects search filter | | |
| T-06.6 | Spinner during Move All (> 5 items) | | |
| T-06.7 | No spinner for small moves (≤ 5 items) | | |
| T-06.8 | Hide move all buttons | | |
| T-06.9 | Move all preserves hidden selections | | |
| T-07.1 | Custom Move All Right icon | | |
| T-07.2 | Custom Move Selected Right icon | | |
| T-07.3 | All four custom icons | | |
| T-07.4 | Move selected icons hidden outside multiselect | | |
| T-07.5 | Move all icons hidden when Show move all is off | | |
| T-08.1 | Search input appears | | |
| T-08.2 | Search filters case-insensitively | | |
| T-08.3 | Clear search restores items | | |
| T-08.4 | No-match empty state | | |
| T-08.5 | Right panel search independent | | |
| T-08.6 | Custom placeholder text | | |
| T-08.7 | Translated placeholder | | |
| T-08.8 | Input responsive during fast typing | | |
| T-09.1 | Custom fixed height | | |
| T-09.2 | Different height units | | |
| T-09.3 | Min height hidden in fixed mode | | |
| T-10.1 | Fill mode stretches to parent | | |
| T-10.2 | Height properties hidden in fill mode | | |
| T-10.3 | Panels stable when items move in fill mode | | |
| T-11.1 | Without min height panel can be small | | |
| T-11.2 | Min height floors panel height | | |
| T-11.3 | Min height unit hidden until value entered | | |
| T-12.1 | Console warning above threshold (> 20 items) | | |
| T-12.2 | No warning below threshold (≤ 20 items) | | |
| T-12.3 | Warning for Move Selected above threshold | | |
| T-13.1 | Keyboard navigation | | |
| T-13.2 | ARIA listbox/option roles | | |
| T-13.3 | ARIA role on empty panel | | |
| T-13.4 | Controls group label | | |
| T-13.5 | Item count announced | | |
| T-13.6 | Spinner accessible | | |
| T-14.1 | Both panels empty | | |
| T-14.2 | Single item per panel | | |
| T-14.3 | Action canExecute false | | |
| T-14.4 | No actions configured | | |
| T-14.5 | Spinner clears on safety timeout | | |
