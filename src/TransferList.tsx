import { createElement, ReactElement, useState, useMemo } from "react";
import { ObjectItem, ValueStatus } from "mendix";
import { TransferListContainerProps } from "../typings/TransferListProps";
import { TransferPanel } from "./components/TransferPanel";
import { TransferControls } from "./components/TransferControls";
import { LOG_PREFIX } from "./constants";
import "./ui/TransferList.css";

const DEFAULT_PANEL_HEIGHT = "300px";

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
    const [dragSource, setDragSource] = useState<{ item: ObjectItem; panel: "left" | "right" } | null>(null);
    const [dragOverPanel, setDragOverPanel] = useState<"left" | "right" | null>(null);

    const leftItems = useMemo(() => {
        if (leftDataSource.status !== ValueStatus.Available || !leftDataSource.items) {
            return [];
        }
        if (!leftSearch || !leftSearchAttribute) {
            return leftDataSource.items;
        }
        const query = leftSearch.toLowerCase();
        return leftDataSource.items.filter(item => {
            const val = leftSearchAttribute.get(item);
            return val.value?.toLowerCase().includes(query) ?? false;
        });
    }, [leftDataSource.status, leftDataSource.items, leftSearch, leftSearchAttribute]);

    const rightItems = useMemo(() => {
        if (rightDataSource.status !== ValueStatus.Available || !rightDataSource.items) {
            return [];
        }
        if (!rightSearch || !rightSearchAttribute) {
            return rightDataSource.items;
        }
        const query = rightSearch.toLowerCase();
        return rightDataSource.items.filter(item => {
            const val = rightSearchAttribute.get(item);
            return val.value?.toLowerCase().includes(query) ?? false;
        });
    }, [rightDataSource.status, rightDataSource.items, rightSearch, rightSearchAttribute]);

    /** Moves a single left-panel item to the right by executing the onAdd action. */
    const handleActivateLeft = (item: ObjectItem): void => {
        if (!onAdd) {
            return;
        }
        const action = onAdd.get(item);
        if (action.canExecute) {
            action.execute();
        } else {
            console.warn(LOG_PREFIX, "onAdd action cannot be executed for item", item.id);
        }
    };

    /** Moves a single right-panel item to the left by executing the onRemove action. */
    const handleActivateRight = (item: ObjectItem): void => {
        if (!onRemove) {
            return;
        }
        const action = onRemove.get(item);
        if (action.canExecute) {
            action.execute();
        } else {
            console.warn(LOG_PREFIX, "onRemove action cannot be executed for item", item.id);
        }
    };

    const handleToggleSelectLeft = (item: ObjectItem): void => {
        setLeftSelection(prev => {
            const next = new Set(prev);
            if (next.has(item.id)) {
                next.delete(item.id);
            } else {
                next.add(item.id);
            }
            return next;
        });
    };

    const handleToggleSelectRight = (item: ObjectItem): void => {
        setRightSelection(prev => {
            const next = new Set(prev);
            if (next.has(item.id)) {
                next.delete(item.id);
            } else {
                next.add(item.id);
            }
            return next;
        });
    };

    const handleMoveSelectedRight = (): void => {
        if (!onAdd || !leftDataSource.items) {
            return;
        }
        for (const item of leftDataSource.items) {
            if (leftSelection.has(item.id)) {
                const action = onAdd.get(item);
                if (action.canExecute) {
                    action.execute();
                }
            }
        }
        setLeftSelection(new Set());
    };

    const handleMoveSelectedLeft = (): void => {
        if (!onRemove || !rightDataSource.items) {
            return;
        }
        for (const item of rightDataSource.items) {
            if (rightSelection.has(item.id)) {
                const action = onRemove.get(item);
                if (action.canExecute) {
                    action.execute();
                }
            }
        }
        setRightSelection(new Set());
    };

    const handleMoveAllRight = (): void => {
        if (onAddAll?.canExecute) {
            onAddAll.execute();
        }
    };

    const handleMoveAllLeft = (): void => {
        if (onRemoveAll?.canExecute) {
            onRemoveAll.execute();
        }
    };

    const handleDragStart = (item: ObjectItem, panel: "left" | "right"): void => {
        setDragSource({ item, panel });
    };

    const handleDrop = (targetPanel: "left" | "right"): void => {
        if (!dragSource || dragSource.panel === targetPanel) {
            return;
        }
        if (targetPanel === "right") {
            handleActivateLeft(dragSource.item);
        } else {
            handleActivateRight(dragSource.item);
        }
        setDragSource(null);
        setDragOverPanel(null);
    };

    const resolvedHeight = panelHeight || DEFAULT_PANEL_HEIGHT;

    return (
        <div className={`transfer-list ${className}`} style={style} tabIndex={tabIndex}>
            <TransferPanel
                label={leftLabel || "Available"}
                items={leftItems}
                renderItem={item => (leftContent ? leftContent.get(item) : null)}
                isSelected={item => leftSelection.has(item.id)}
                interactionMode={interactionMode}
                panelSide="left"
                showSearch={showLeftSearch}
                searchQuery={leftSearch}
                onSearchChange={setLeftSearch}
                onActivate={handleActivateLeft}
                onToggleSelect={handleToggleSelectLeft}
                onDragStart={item => handleDragStart(item, "left")}
                onDrop={() => handleDrop("left")}
                onDragOver={() => setDragOverPanel("left")}
                onDragLeave={() => setDragOverPanel(null)}
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
                label={rightLabel || "Selected"}
                items={rightItems}
                renderItem={item => (rightContent ? rightContent.get(item) : null)}
                isSelected={item => rightSelection.has(item.id)}
                interactionMode={interactionMode}
                panelSide="right"
                showSearch={showRightSearch}
                searchQuery={rightSearch}
                onSearchChange={setRightSearch}
                onActivate={handleActivateRight}
                onToggleSelect={handleToggleSelectRight}
                onDragStart={item => handleDragStart(item, "right")}
                onDrop={() => handleDrop("right")}
                onDragOver={() => setDragOverPanel("right")}
                onDragLeave={() => setDragOverPanel(null)}
                isDragOver={dragOverPanel === "right"}
                panelHeight={resolvedHeight}
            />
        </div>
    );
}
