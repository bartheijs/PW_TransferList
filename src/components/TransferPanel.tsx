import { createElement, ReactElement, ReactNode } from "react";
import { ObjectItem } from "mendix";
import { TransferItem } from "./TransferItem";

export interface TransferPanelProps {
    label: string;
    items: ObjectItem[];
    renderItem: (item: ObjectItem) => ReactNode;
    isSelected: (item: ObjectItem) => boolean;
    interactionMode: string;
    panelSide: "left" | "right";
    showSearch: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onActivate: (item: ObjectItem) => void;
    onToggleSelect: (item: ObjectItem) => void;
    onDragStart: (item: ObjectItem) => void;
    onDrop: () => void;
    onDragOver: () => void;
    onDragLeave: () => void;
    isDragOver: boolean;
    panelHeight: string;
}

export function TransferPanel({
    label,
    items,
    renderItem,
    isSelected,
    interactionMode,
    panelSide,
    showSearch,
    searchQuery,
    onSearchChange,
    onActivate,
    onToggleSelect,
    onDragStart,
    onDrop,
    onDragOver,
    onDragLeave,
    isDragOver,
    panelHeight
}: TransferPanelProps): ReactElement {
    const panelBodyClass = ["transfer-list__panel-body", isDragOver ? "transfer-list__panel-body--drag-over" : ""]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={`transfer-list__panel transfer-list__panel--${panelSide}`} role="listbox" aria-label={label}>
            <div className="transfer-list__panel-header">
                <span className="transfer-list__panel-label">{label}</span>
                <span className="transfer-list__panel-count" aria-live="polite">
                    {items.length}
                </span>
            </div>
            {showSearch && (
                <div className="transfer-list__search-wrapper">
                    <input
                        type="search"
                        className="form-control transfer-list__search"
                        placeholder="Search…"
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        aria-label={`Search ${label}`}
                    />
                </div>
            )}
            <div
                className={panelBodyClass}
                style={{ height: panelHeight }}
                onDragOver={
                    interactionMode === "dragdrop"
                        ? e => {
                              e.preventDefault();
                              onDragOver();
                          }
                        : undefined
                }
                onDragLeave={interactionMode === "dragdrop" ? onDragLeave : undefined}
                onDrop={
                    interactionMode === "dragdrop"
                        ? e => {
                              e.preventDefault();
                              onDrop();
                          }
                        : undefined
                }
            >
                {items.map(item => (
                    <TransferItem
                        key={item.id}
                        item={item}
                        isSelected={isSelected(item)}
                        interactionMode={interactionMode}
                        onActivate={onActivate}
                        onToggleSelect={onToggleSelect}
                        onDragStart={onDragStart}
                        onDrop={() => onDrop()}
                    >
                        {renderItem(item)}
                    </TransferItem>
                ))}
                {items.length === 0 && (
                    <div className="transfer-list__empty" aria-live="polite">
                        No items
                    </div>
                )}
            </div>
        </div>
    );
}
