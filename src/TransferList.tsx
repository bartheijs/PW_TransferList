import { ReactElement, createElement, useCallback, useMemo, useRef, useState } from "react";
import { ObjectItem, ValueStatus } from "mendix";
import classNames from "classnames";
import { TransferListContainerProps } from "../typings/TransferListProps";
import { TransferPanel } from "./components/TransferPanel";
import { TransferControls } from "./components/TransferControls";
import { DEFAULT_LEFT_LABEL, DEFAULT_PANEL_HEIGHT, DEFAULT_RIGHT_LABEL, PanelSide } from "./constants";
import { executeAction, executeListItemAction } from "./utils/executeActions";
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
        interactionMode,
        onAdd,
        onRemove,
        onAddAll,
        onRemoveAll,
        showLeftSearch,
        leftSearchAttribute,
        showRightSearch,
        rightSearchAttribute,
        showMoveAll,
        panelHeight,
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

    const leftItems = useMemo(() => {
        if (leftDataSource.status !== ValueStatus.Available || !leftDataSource.items) {
            return [];
        }
        return filterItemsBySearch(leftDataSource.items, leftSearch, leftSearchAttribute);
    }, [leftDataSource.status, leftDataSource.items, leftSearch, leftSearchAttribute]);

    const rightItems = useMemo(() => {
        if (rightDataSource.status !== ValueStatus.Available || !rightDataSource.items) {
            return [];
        }
        return filterItemsBySearch(rightDataSource.items, rightSearch, rightSearchAttribute);
    }, [rightDataSource.status, rightDataSource.items, rightSearch, rightSearchAttribute]);

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

    const handleMoveSelectedRight = useCallback(() => {
        if (!onAdd || !leftDataSource.items) {
            return;
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
        for (const item of rightDataSource.items) {
            if (rightSelection.has(item.id)) {
                executeListItemAction(onRemove, item, "Remove");
            }
        }
        setRightSelection(new Set());
    }, [onRemove, rightDataSource.items, rightSelection]);

    const handleMoveAllRight = useCallback(() => executeAction(onAddAll, "Add all"), [onAddAll]);
    const handleMoveAllLeft = useCallback(() => executeAction(onRemoveAll, "Remove all"), [onRemoveAll]);

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

    const resolvedHeight = panelHeight || DEFAULT_PANEL_HEIGHT;
    const resolvedLeftLabel = leftLabel || DEFAULT_LEFT_LABEL;
    const resolvedRightLabel = rightLabel || DEFAULT_RIGHT_LABEL;

    return (
        <div className={classNames("transfer-list", className)} style={style} tabIndex={tabIndex}>
            <TransferPanel
                label={resolvedLeftLabel}
                items={leftItems}
                renderItem={renderLeftItem}
                isSelected={isLeftSelected}
                interactionMode={interactionMode}
                panelSide="left"
                showSearch={showLeftSearch}
                searchQuery={leftSearch}
                onSearchChange={setLeftSearch}
                onActivate={handleActivateLeft}
                onToggleSelect={handleToggleSelectLeft}
                onDragStart={handleLeftDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleLeftDrop}
                onDragOver={handleLeftDragOver}
                onDragLeave={handleClearDragOver}
                isDragOver={dragOverPanel === "left"}
                panelHeight={resolvedHeight}
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
            />
            <TransferPanel
                label={resolvedRightLabel}
                items={rightItems}
                renderItem={renderRightItem}
                isSelected={isRightSelected}
                interactionMode={interactionMode}
                panelSide="right"
                showSearch={showRightSearch}
                searchQuery={rightSearch}
                onSearchChange={setRightSearch}
                onActivate={handleActivateRight}
                onToggleSelect={handleToggleSelectRight}
                onDragStart={handleRightDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleRightDrop}
                onDragOver={handleRightDragOver}
                onDragLeave={handleClearDragOver}
                isDragOver={dragOverPanel === "right"}
                panelHeight={resolvedHeight}
            />
        </div>
    );
}
