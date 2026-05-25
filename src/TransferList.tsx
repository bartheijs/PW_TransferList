import {
    CSSProperties,
    ReactElement,
    createElement,
    useCallback,
    useDeferredValue,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";
import { ObjectItem, ValueStatus } from "mendix";
import classNames from "classnames";
import { TransferListContainerProps } from "../typings/TransferListProps";
import { TransferPanel } from "./components/TransferPanel";
import { TransferControls } from "./components/TransferControls";
import {
    BULK_MOVE_SAFETY_TIMEOUT_MS,
    BULK_MOVE_SPINNER_THRESHOLD,
    BULK_MOVE_WARN_THRESHOLD,
    DEFAULT_PANEL_HEIGHT,
    DEFAULT_PANEL_HEIGHT_UNIT,
    LOG_PREFIX,
    PANEL_HEIGHT_MODES,
    PanelSide
} from "./constants";
import { executeListItemAction } from "./utils/executeActions";
import { filterItemsBySearch } from "./utils/filterItems";
import "./ui/TransferList.css";

/** Snapshot of an in-progress drag, stored in a ref since it is not used during render. */
interface DragSource {
    item: ObjectItem;
    panel: PanelSide;
}

/**
 * Pluggable widget that lets end-users move objects between two lists.
 * Supports click, double-click, multi-select with checkboxes, and drag-and-drop.
 * All persistence is delegated to the configured Mendix actions.
 */
export function TransferList(props: TransferListContainerProps): ReactElement {
    const {
        leftDataSource,
        leftContent,
        leftLabel,
        rightDataSource,
        rightContent,
        rightLabel,
        showCount,
        interactionMode,
        onAdd,
        onRemove,
        showLeftSearch,
        leftSearchAttribute,
        leftSearchPlaceholder,
        showRightSearch,
        rightSearchAttribute,
        rightSearchPlaceholder,
        showMoveAll,
        moveAllRightIcon,
        moveRightIcon,
        moveLeftIcon,
        moveAllLeftIcon,
        panelHeightMode,
        panelHeight,
        panelHeightUnit,
        panelMinHeight,
        panelMinHeightUnit,
        class: className,
        style,
        tabIndex
    } = props;

    const [leftSelection, setLeftSelection] = useState<Set<string>>(new Set());
    const [rightSelection, setRightSelection] = useState<Set<string>>(new Set());
    const [leftSearch, setLeftSearch] = useState("");
    const [rightSearch, setRightSearch] = useState("");
    const [dragOverPanel, setDragOverPanel] = useState<PanelSide | null>(null);

    // dragSource is read only inside event handlers, never during render — useRef avoids
    // an unnecessary re-render cycle on every drag start/end.
    const dragSourceRef = useRef<DragSource | null>(null);

    // Deferred search values: the raw state values keep the input responsive on every
    // keystroke; the deferred variants are used for the (potentially expensive) filter
    // computation so React can deprioritise that work during rapid typing.
    const deferredLeftSearch = useDeferredValue(leftSearch);
    const deferredRightSearch = useDeferredValue(rightSearch);

    const leftItems = useMemo(() => {
        if (leftDataSource.status !== ValueStatus.Available || !leftDataSource.items) {
            return [];
        }
        return filterItemsBySearch(leftDataSource.items, deferredLeftSearch, leftSearchAttribute);
    }, [leftDataSource.status, leftDataSource.items, deferredLeftSearch, leftSearchAttribute]);

    const rightItems = useMemo(() => {
        if (rightDataSource.status !== ValueStatus.Available || !rightDataSource.items) {
            return [];
        }
        return filterItemsBySearch(rightDataSource.items, deferredRightSearch, rightSearchAttribute);
    }, [rightDataSource.status, rightDataSource.items, deferredRightSearch, rightSearchAttribute]);

    /** Toggles an item's id in the given selection set. */
    const toggleSelection = useCallback((setter: typeof setLeftSelection, item: ObjectItem): void => {
        setter(prev => {
            const next = new Set(prev);
            if (next.has(item.id)) {
                next.delete(item.id);
            } else {
                next.add(item.id);
            }
            return next;
        });
    }, []);

    const handleActivateLeft = useCallback((item: ObjectItem) => executeListItemAction(onAdd, item, "Add"), [onAdd]);
    const handleActivateRight = useCallback(
        (item: ObjectItem) => executeListItemAction(onRemove, item, "Remove"),
        [onRemove]
    );

    const handleToggleSelectLeft = useCallback(
        (item: ObjectItem) => toggleSelection(setLeftSelection, item),
        [toggleSelection]
    );
    const handleToggleSelectRight = useCallback(
        (item: ObjectItem) => toggleSelection(setRightSelection, item),
        [toggleSelection]
    );

    // ── Bulk-move loading state ──────────────────────────────────────────────
    // Shows a spinner on the controls column while Mendix processes the actions
    // and refreshes the datasources. Cleared when the datasource cycles from
    // not-ready → ready (i.e. the refresh completed), with a safety timeout fallback.

    const [isBulkMoving, setIsBulkMoving] = useState(false);

    const dataReady =
        leftDataSource.status === ValueStatus.Available && rightDataSource.status === ValueStatus.Available;

    // Tracks the previous dataReady value to detect the Loading → Available transition.
    const prevDataReadyRef = useRef(dataReady);

    useEffect(() => {
        const wasReady = prevDataReadyRef.current;
        prevDataReadyRef.current = dataReady;
        // Clear spinner once the datasource has cycled through a non-ready state
        // (i.e. the Mendix platform refreshed the list after the bulk action completed).
        if (isBulkMoving && !wasReady && dataReady) {
            setIsBulkMoving(false);
        }
    }, [isBulkMoving, dataReady]);

    // Safety net: always clear the spinner after the timeout, even if the datasource
    // never goes through a loading phase (e.g. nanoflows updating synchronously).
    useEffect(() => {
        if (!isBulkMoving) {
            return;
        }
        const id = setTimeout(() => setIsBulkMoving(false), BULK_MOVE_SAFETY_TIMEOUT_MS);
        return () => clearTimeout(id);
    }, [isBulkMoving]);

    const handleMoveSelectedRight = useCallback(() => {
        if (!onAdd || !leftDataSource.items) {
            return;
        }
        if (leftSelection.size > BULK_MOVE_WARN_THRESHOLD) {
            console.warn(
                LOG_PREFIX,
                `Moving ${leftSelection.size} items via onAdd. ` +
                    "If onAdd triggers a microflow, this fires one XHR per item. " +
                    "Consider using datasource pagination or a nanoflow for large datasets."
            );
        }
        if (leftSelection.size > BULK_MOVE_SPINNER_THRESHOLD) {
            setIsBulkMoving(true);
        }
        for (const item of leftDataSource.items) {
            if (leftSelection.has(item.id)) {
                executeListItemAction(onAdd, item, "Add");
            }
        }
        setLeftSelection(new Set());
    }, [onAdd, leftDataSource.items, leftSelection]);

    const handleMoveSelectedLeft = useCallback(() => {
        if (!onRemove || !rightDataSource.items) {
            return;
        }
        if (rightSelection.size > BULK_MOVE_WARN_THRESHOLD) {
            console.warn(
                LOG_PREFIX,
                `Moving ${rightSelection.size} items via onRemove. ` +
                    "If onRemove triggers a microflow, this fires one XHR per item. " +
                    "Consider using datasource pagination or a nanoflow for large datasets."
            );
        }
        if (rightSelection.size > BULK_MOVE_SPINNER_THRESHOLD) {
            setIsBulkMoving(true);
        }
        for (const item of rightDataSource.items) {
            if (rightSelection.has(item.id)) {
                executeListItemAction(onRemove, item, "Remove");
            }
        }
        setRightSelection(new Set());
    }, [onRemove, rightDataSource.items, rightSelection]);

    /** Moves every currently visible left-panel item to the right by reusing the onAdd action. */
    const handleMoveAllRight = useCallback(() => {
        if (!onAdd) {
            return;
        }
        if (leftItems.length > BULK_MOVE_WARN_THRESHOLD) {
            console.warn(
                LOG_PREFIX,
                `Moving ${leftItems.length} items via onAdd. ` +
                    "If onAdd triggers a microflow, this fires one XHR per item. " +
                    "Consider using datasource pagination or a nanoflow for large datasets."
            );
        }
        if (leftItems.length > BULK_MOVE_SPINNER_THRESHOLD) {
            setIsBulkMoving(true);
        }
        for (const item of leftItems) {
            executeListItemAction(onAdd, item, "Add");
        }
        setLeftSelection(new Set());
    }, [onAdd, leftItems]);

    /** Moves every currently visible right-panel item to the left by reusing the onRemove action. */
    const handleMoveAllLeft = useCallback(() => {
        if (!onRemove) {
            return;
        }
        if (rightItems.length > BULK_MOVE_WARN_THRESHOLD) {
            console.warn(
                LOG_PREFIX,
                `Moving ${rightItems.length} items via onRemove. ` +
                    "If onRemove triggers a microflow, this fires one XHR per item. " +
                    "Consider using datasource pagination or a nanoflow for large datasets."
            );
        }
        if (rightItems.length > BULK_MOVE_SPINNER_THRESHOLD) {
            setIsBulkMoving(true);
        }
        for (const item of rightItems) {
            executeListItemAction(onRemove, item, "Remove");
        }
        setRightSelection(new Set());
    }, [onRemove, rightItems]);

    const handleLeftDragStart = useCallback((item: ObjectItem) => {
        dragSourceRef.current = { item, panel: "left" };
    }, []);
    const handleRightDragStart = useCallback((item: ObjectItem) => {
        dragSourceRef.current = { item, panel: "right" };
    }, []);

    /** Called from `onDragEnd` on the source item — clears state even when the drop never lands. */
    const handleDragEnd = useCallback(() => {
        dragSourceRef.current = null;
        setDragOverPanel(null);
    }, []);

    const handleDrop = useCallback(
        (targetPanel: PanelSide) => {
            const src = dragSourceRef.current;
            if (!src || src.panel === targetPanel) {
                return;
            }
            if (targetPanel === "right") {
                executeListItemAction(onAdd, src.item, "Add");
            } else {
                executeListItemAction(onRemove, src.item, "Remove");
            }
            dragSourceRef.current = null;
            setDragOverPanel(null);
        },
        [onAdd, onRemove]
    );

    const handleLeftDrop = useCallback(() => handleDrop("left"), [handleDrop]);
    const handleRightDrop = useCallback(() => handleDrop("right"), [handleDrop]);
    const handleLeftDragOver = useCallback(() => setDragOverPanel("left"), []);
    const handleRightDragOver = useCallback(() => setDragOverPanel("right"), []);
    const handleClearDragOver = useCallback(() => setDragOverPanel(null), []);

    const renderLeftItem = useCallback(
        (item: ObjectItem) => (leftContent ? leftContent.get(item) : null),
        [leftContent]
    );
    const renderRightItem = useCallback(
        (item: ObjectItem) => (rightContent ? rightContent.get(item) : null),
        [rightContent]
    );

    const isLeftSelected = useCallback((item: ObjectItem) => leftSelection.has(item.id), [leftSelection]);
    const isRightSelected = useCallback((item: ObjectItem) => rightSelection.has(item.id), [rightSelection]);

    // In fill mode the panel body has no explicit height; it relies on flex
    // to fill the available space. In fixed mode a fallback ensures a usable
    // height even when the property is left empty in Studio Pro.
    const isFill = panelHeightMode === PANEL_HEIGHT_MODES.FILL;
    // Combine the numeric value and unit into a valid CSS length string.
    // Defaults guard against Studio Pro delivering 0 or an absent unit.
    const resolvedHeight = isFill
        ? undefined
        : `${panelHeight || DEFAULT_PANEL_HEIGHT}${panelHeightUnit || DEFAULT_PANEL_HEIGHT_UNIT}`;

    // Min-height is only relevant in fill mode (in fixed mode panelHeight is the
    // deliberate choice and min-height is hidden in Studio Pro).
    const resolvedMinHeight =
        isFill && panelMinHeight ? `${panelMinHeight}${panelMinHeightUnit || DEFAULT_PANEL_HEIGHT_UNIT}` : undefined;

    // Fill-mode height lock — ref used to measure the rendered container.
    const containerRef = useRef<HTMLDivElement>(null);
    const [snapshotHeight, setSnapshotHeight] = useState<number | undefined>(undefined);

    // Once both datasources are available the Mendix layout has settled and we
    // can read the true rendered height. We store it as a fixed pixel value so
    // the widget no longer depends on `height: 100%` propagating through the DOM
    // chain; the panels therefore cannot shrink when items are moved between them.
    useEffect(() => {
        if (!isFill || snapshotHeight !== undefined || !dataReady) {
            return;
        }
        const h = containerRef.current?.offsetHeight ?? 0;
        if (h > 0) {
            setSnapshotHeight(h);
        }
    }, [isFill, dataReady, snapshotHeight]);

    // After the snapshot the inline height overrides the CSS `height: 100%` rule,
    // giving the container a stable pixel height independent of item count.
    const containerStyle: CSSProperties | undefined =
        isFill && snapshotHeight !== undefined ? { ...style, height: snapshotHeight } : style;

    return (
        <div
            ref={containerRef}
            className={classNames("transfer-list", { "transfer-list--fill": isFill }, className)}
            style={containerStyle}
            tabIndex={tabIndex}
        >
            <TransferPanel
                label={leftLabel}
                items={leftItems}
                renderItem={renderLeftItem}
                isSelected={isLeftSelected}
                interactionMode={interactionMode}
                panelSide="left"
                showSearch={showLeftSearch}
                searchQuery={leftSearch}
                onSearchChange={setLeftSearch}
                searchPlaceholder={leftSearchPlaceholder}
                showCount={showCount}
                onActivate={handleActivateLeft}
                onToggleSelect={handleToggleSelectLeft}
                onDragStart={handleLeftDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleLeftDrop}
                onDragOver={handleLeftDragOver}
                onDragLeave={handleClearDragOver}
                isDragOver={dragOverPanel === "left"}
                panelHeight={resolvedHeight}
                panelMinHeight={resolvedMinHeight}
            />
            <TransferControls
                interactionMode={interactionMode}
                showMoveAll={showMoveAll}
                canMoveRight={leftSelection.size > 0}
                canMoveLeft={rightSelection.size > 0}
                onMoveRight={handleMoveSelectedRight}
                onMoveLeft={handleMoveSelectedLeft}
                onMoveAllRight={handleMoveAllRight}
                onMoveAllLeft={handleMoveAllLeft}
                isBulkMoving={isBulkMoving}
                moveAllRightIcon={moveAllRightIcon}
                moveRightIcon={moveRightIcon}
                moveLeftIcon={moveLeftIcon}
                moveAllLeftIcon={moveAllLeftIcon}
            />
            <TransferPanel
                label={rightLabel}
                items={rightItems}
                renderItem={renderRightItem}
                isSelected={isRightSelected}
                interactionMode={interactionMode}
                panelSide="right"
                showSearch={showRightSearch}
                searchQuery={rightSearch}
                onSearchChange={setRightSearch}
                searchPlaceholder={rightSearchPlaceholder}
                showCount={showCount}
                onActivate={handleActivateRight}
                onToggleSelect={handleToggleSelectRight}
                onDragStart={handleRightDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleRightDrop}
                onDragOver={handleRightDragOver}
                onDragLeave={handleClearDragOver}
                isDragOver={dragOverPanel === "right"}
                panelHeight={resolvedHeight}
                panelMinHeight={resolvedMinHeight}
            />
        </div>
    );
}
