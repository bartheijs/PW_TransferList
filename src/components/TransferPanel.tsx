import { DragEvent, ReactElement, ReactNode, createElement, memo, useCallback, useId } from "react";
import { ObjectItem } from "mendix";
import classNames from "classnames";
import { TransferItem } from "./TransferItem";
import { EMPTY_PLACEHOLDER, INTERACTION_MODES, InteractionMode, PanelSide, SEARCH_PLACEHOLDER } from "../constants";

export interface TransferPanelProps {
    label: ReactNode;
    items: ObjectItem[];
    renderItem: (item: ObjectItem) => ReactNode;
    isSelected: (item: ObjectItem) => boolean;
    interactionMode: InteractionMode;
    panelSide: PanelSide;
    showSearch: boolean;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onActivate: (item: ObjectItem) => void;
    onToggleSelect: (item: ObjectItem) => void;
    onDragStart: (item: ObjectItem) => void;
    onDragEnd: () => void;
    onDrop: () => void;
    onDragOver: () => void;
    onDragLeave: () => void;
    isDragOver: boolean;
    panelHeight: string;
}

/**
 * One side of the TransferList — header with label and item count, an optional
 * search input, and a scrollable item list. Memoized to avoid re-rendering when
 * only the opposite panel's state changes in the parent.
 */
export const TransferPanel = memo(
    ({
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
        onDragEnd,
        onDrop,
        onDragOver,
        onDragLeave,
        isDragOver,
        panelHeight
    }: TransferPanelProps): ReactElement => {
        const isDragDrop = interactionMode === INTERACTION_MODES.DRAG_DROP;
        const isMultiselect = interactionMode === INTERACTION_MODES.MULTISELECT;
        // Stable id used to link the listbox to its visible label via aria-labelledby.
        const labelId = useId();

        const handleBodyDragOver = useCallback(
            (e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                onDragOver();
            },
            [onDragOver]
        );

        const handleBodyDrop = useCallback(
            (e: DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                onDrop();
            },
            [onDrop]
        );

        return (
            <div
                className={classNames("transfer-list__panel", `transfer-list__panel--${panelSide}`)}
                role="listbox"
                aria-labelledby={labelId}
                aria-multiselectable={isMultiselect || undefined}
            >
                <div className="transfer-list__panel-header">
                    <span id={labelId} className="transfer-list__panel-label">{label}</span>
                    <span className="transfer-list__panel-count" aria-live="polite">
                        {items.length}
                    </span>
                </div>
                {showSearch && (
                    <div className="transfer-list__search-wrapper">
                        <input
                            type="search"
                            className="form-control transfer-list__search"
                            placeholder={SEARCH_PLACEHOLDER}
                            value={searchQuery}
                            onChange={e => onSearchChange(e.target.value)}
                            aria-label={`Search ${panelSide} panel`}
                        />
                    </div>
                )}
                <div
                    className={classNames("transfer-list__panel-body", {
                        "transfer-list__panel-body--drag-over": isDragOver
                    })}
                    style={{ height: panelHeight }}
                    onDragOver={isDragDrop ? handleBodyDragOver : undefined}
                    onDragLeave={isDragDrop ? onDragLeave : undefined}
                    onDrop={isDragDrop ? handleBodyDrop : undefined}
                >
                    {items.length === 0 ? (
                        <div className="transfer-list__empty" aria-live="polite">
                            {EMPTY_PLACEHOLDER}
                        </div>
                    ) : (
                        items.map(item => (
                            <TransferItem
                                key={item.id}
                                item={item}
                                isSelected={isSelected(item)}
                                interactionMode={interactionMode}
                                onActivate={onActivate}
                                onToggleSelect={onToggleSelect}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                                onDrop={onDrop}
                            >
                                {renderItem(item)}
                            </TransferItem>
                        ))
                    )}
                </div>
            </div>
        );
    }
);
TransferPanel.displayName = "TransferPanel";
