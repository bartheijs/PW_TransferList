# Plan: "Listen to widget" selection support for TransferList

## Context

In Mendix, a Data View can use **"Listen to widget"** as its data source — it reacts to the item currently selected in another widget. For a pluggable widget to support this, it must declare one or more `type="selection"` properties in its XML (introduced in Mx 10.7) and call `setSelection()` from the TypeScript runtime.

The TransferList has two panels (left / right) backed by independent datasources, so it can expose a selection for each panel independently. A Data View can then listen to whichever panel is relevant.

**When selection fires (per user decision):**

| Interaction mode | Trigger | Reason |
|---|---|---|
| `click` | ❌ never | single click already moves the item |
| `dblclick` | ✅ single click | single click does not move — free to select |
| `dragdrop` | ✅ single click | single click does not move — free to select |
| `multiselect` | ✅ on checkbox toggle | toggle does not move — free to select |

**Selection type behaviour:**
- `Single` — set to the item that was just clicked / toggled.
- `Multi` (only meaningful in multiselect mode) — synced to the full internal checked Set via `useEffect` in the parent.

**Edge case: developer switches to `click` mode while a selection is configured**

In `click` mode `setSelection` is never called, so the selection would remain frozen at whatever it was last set to — showing stale data in the listening Data View.

**Fix (4e in `src/TransferList.tsx`):** add a `useEffect` that explicitly clears both selections whenever `interactionMode === "click"`:

```typescript
// In click mode the single-click moves the item, so selection is never updated.
// Proactively clear any stale selection so the listening data view doesn't show
// incorrect data when the developer switches away from dblclick/dragdrop/multiselect.
useEffect(() => {
    if (interactionMode !== INTERACTION_MODES.CLICK) {
        return;
    }
    if (leftSelection?.type === "Single") leftSelection.setSelection(undefined);
    else if (leftSelection?.type === "Multi") leftSelection.setSelection([]);
    if (rightSelection?.type === "Single") rightSelection.setSelection(undefined);
    else if (rightSelection?.type === "Multi") rightSelection.setSelection([]);
    // intentionally omit leftSelection / rightSelection from deps:
    // we only want to clear on interactionMode changes, not on every selection reference change
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [interactionMode]);
```

This runs on mount (if starting in `click` mode) and whenever the developer changes the interaction mode property at runtime.

---

## Files to change

### 1. `src/TransferList.xml`

Add two `type="selection"` properties — one per panel — immediately after the existing `content`/`label` properties in their respective `<propertyGroup>` elements.

Both properties:
- `required="false"` (opt-in feature)
- `dataSource` pointing to the panel's datasource key
- `<selectionTypes>` declaring `None`, `Single`, and `Multi`

```xml
<property key="leftSelection" type="selection" dataSource="leftDataSource" required="false">
    <caption>Left selection</caption>
    <description>Exposes the focused item so a data view can listen to this panel.</description>
    <selectionTypes>
        <selectionType name="None"/>
        <selectionType name="Single"/>
        <selectionType name="Multi"/>
    </selectionTypes>
</property>
```

Same pattern for `rightSelection` / `rightDataSource`.

---

### 2. `src/components/TransferItem.tsx`

**Add prop:** `onItemFocus?: (item: ObjectItem) => void`

**Call it** inside `activateOrToggle()` at the right branch:

```typescript
const activateOrToggle = (): void => {
    if (interactionMode === INTERACTION_MODES.CLICK) {
        onActivate(item);
        // no focus — click already moves the item
    } else if (isMultiselect) {
        onToggleSelect(item);
        onItemFocus?.(item);        // set Single selection / trigger Multi sync
    } else {
        // dblclick and dragdrop: single click = select only
        onItemFocus?.(item);
    }
};
```

`handleKeyDown` requires no change: in `dblclick` mode it calls `onActivate` (moves, so no focus); in `dragdrop` mode it falls through to `activateOrToggle` (the else branch above fires). ✓

---

### 3. `src/components/TransferPanel.tsx`

**Add prop to `TransferPanelProps`:** `onItemFocus?: (item: ObjectItem) => void`

Pass it through to every `<TransferItem>` render:

```tsx
<TransferItem
    ...
    onItemFocus={onItemFocus}
>
```

---

### 4. `src/TransferList.tsx`

#### 4a. Rename internal state to resolve name conflict

The XML `key="leftSelection"` will generate a prop also called `leftSelection`, colliding with the existing internal multiselect state. Rename:

| Old | New |
|---|---|
| `leftSelection` (state) | `leftChecked` |
| `setLeftSelection` | `setLeftChecked` |
| `rightSelection` (state) | `rightChecked` |
| `setRightSelection` | `setRightChecked` |

Update all references in handlers:
- `handleMoveSelectedRight` — `leftSelection.size` → `leftChecked.size`, `leftSelection.has` → `leftChecked.has`
- `handleMoveSelectedLeft` — same pattern for right
- `handleToggleSelectLeft/Right` — `toggleSelection(setLeftChecked, item)` etc.
- `canMoveRight={leftChecked.size > 0}`, `canMoveLeft={rightChecked.size > 0}`
- `setLeftChecked(new Set())` etc. after bulk moves

#### 4b. Destructure the new Mendix selection props

```typescript
const { leftSelection, rightSelection, ... } = props;
```

Add import: `SelectionSingleValue, SelectionMultiValue` from `"mendix"` (for type narrowing in handlers).

#### 4c. Add Single-selection focus handlers

```typescript
/** Sets the Mendix Single selection when an item is focused (clicked without a move). */
const handleItemFocusLeft = useCallback(
    (item: ObjectItem) => {
        if (leftSelection?.type === "Single") {
            leftSelection.setSelection(item);
        }
        // Multi is handled by the useEffect below
    },
    [leftSelection]
);

const handleItemFocusRight = useCallback(
    (item: ObjectItem) => {
        if (rightSelection?.type === "Single") {
            rightSelection.setSelection(item);
        }
    },
    [rightSelection]
);
```

#### 4d. Add Multi-selection sync effects (multiselect mode)

```typescript
// Sync Mendix Multi selection with the internal checked Set whenever it changes.
useEffect(() => {
    if (leftSelection?.type !== "Multi" || !leftDataSource.items) return;
    leftSelection.setSelection(leftDataSource.items.filter(i => leftChecked.has(i.id)));
}, [leftSelection, leftChecked, leftDataSource.items]);

useEffect(() => {
    if (rightSelection?.type !== "Multi" || !rightDataSource.items) return;
    rightSelection.setSelection(rightDataSource.items.filter(i => rightChecked.has(i.id)));
}, [rightSelection, rightChecked, rightDataSource.items]);
```

#### 4e. Clear stale selection when mode is `click`

Add the `useEffect` described in the edge-case section above.

#### 4f. Pass `onItemFocus` to both `<TransferPanel>` elements

```tsx
<TransferPanel ... onItemFocus={handleItemFocusLeft} />
...
<TransferPanel ... onItemFocus={handleItemFocusRight} />
```

---

## Summary of `useEffect`s added to `TransferList.tsx`

| Effect | Deps | Purpose |
|---|---|---|
| Multi left sync | `leftSelection`, `leftChecked`, `leftDataSource.items` | Keeps Mendix Multi selection = checked items (left) |
| Multi right sync | `rightSelection`, `rightChecked`, `rightDataSource.items` | Keeps Mendix Multi selection = checked items (right) |
| Click-mode clear | `interactionMode` only | Clears both selections when mode is `click` to prevent stale data |

---

### 5. `src/TransferList.editorConfig.ts`

Add a `check()` export. The `Problem` type is already declared in this file (no extra import needed).

```typescript
/**
 * Emits a Studio Pro warning when a selection property is configured while the
 * interaction mode is set to 'Click'. In click mode every single click moves the
 * item immediately, so setSelection() is never called and the listening data view
 * would receive no updates.
 */
export function check(values: TransferListPreviewProps): Problem[] {
    const errors: Problem[] = [];

    if (values.interactionMode === "click") {
        // After codegen the preview-prop type for a selection property is determined
        // by npm start. The truthiness check covers whatever non-None representation
        // Mendix uses (expected to be a non-null/undefined object or string like "Single"/"Multi").
        if (values.leftSelection) {
            errors.push({
                property: "leftSelection",
                severity: "warning",
                message:
                    "Left selection has no effect in 'Click' mode — " +
                    "single click moves items immediately. " +
                    "Switch to Double click, Drag and drop, or Multi select to use 'Listen to' data views."
            });
        }
        if (values.rightSelection) {
            errors.push({
                property: "rightSelection",
                severity: "warning",
                message:
                    "Right selection has no effect in 'Click' mode — " +
                    "single click moves items immediately. " +
                    "Switch to Double click, Drag and drop, or Multi select to use 'Listen to' data views."
            });
        }
    }

    return errors;
}
```

> **Note on preview-prop type**: The exact type of `values.leftSelection` (and right) will be determined after running `npm start` to regenerate `typings/TransferListProps.d.ts`. Adjust the condition (`values.leftSelection`, `values.leftSelection !== "None"`, etc.) based on what the generated `TransferListPreviewProps` shows for a `type="selection"` property.

The selection properties are kept **visible** in Studio Pro even in `click` mode (not hidden via `hidePropertiesIn`). This way the developer can see the warning inline on the property that won't work, rather than wondering why their configuration disappeared.

---

## Verification

1. Run `npm start` — this regenerates `typings/TransferListProps.d.ts` to include `leftSelection` and `rightSelection` with the correct union types. TypeScript compilation errors will surface any mismatches.
2. In Studio Pro, open the widget properties — `Left selection` and `Right selection` should appear in the Source group for each panel.
3. Set a panel's selection to **Single**, place a **Data View** with datasource "Listen to widget → TransferList", set interaction mode to **Double click** or **Drag and drop**. Single-clicking an item should populate the Data View.
4. Set selection to **Multi**, use **Multi select** interaction mode, and check several items — a Multi-select Data View or any widget using `$currentObject` should react to the changing set.
5. Verify **click mode** does NOT set selection (clicking moves the item; no selection change visible in the listening Data View).
6. Switch from `dblclick` to `click` mode at runtime (or in Studio Pro) while an item is selected — the Data View should immediately clear, not keep showing the previously selected item.
