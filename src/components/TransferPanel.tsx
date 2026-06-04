import { CSSProperties, DragEvent, ReactElement, ReactNode, createElement, memo, useCallback, useId } from "react";
import { DynamicValue, ObjectItem } from "mendix";
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
    /** Translatable placeholder text for the search input. Falls back to SEARCH_PLACEHOLDER constant. */
    searchPlaceholder?: DynamicValue<string>;
    /** Whether to display the item count in the panel header. */
    showCount: boolean;
    onActivate: (item: ObjectItem) => void;
    onToggleSelect: (item: ObjectItem) => void;
    onDragStart: (item: ObjectItem) => void;
    onDragEnd: () => void;
    onDrop: () => void;
    onDragOver: () => void;
    onDragLeave: () => void;
    isDragOver: boolean;
    /** Explicit height for the panel body. `undefined` means fill-parent mode (no inline style). */
    panelHeight: string | undefined;
    /** Minimum height for the panel body (fill mode only). Prevents collapse with sparse content. */
    panelMinHeight?: string;
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
        searchPlaceholder,
        showCount,
        onActivate,
        onToggleSelect,
        onDragStart,
        onDragEnd,
        onDrop,
        onDragOver,
        onDragLeave,
        isDragOver,
        panelHeight,
        panelMinHeight
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

        // Pass the configured heights as CSS custom properties so the rules themselves
        // live in the external stylesheet. When undefined (fill mode / not set),
        // the properties are not set and the CSS fallbacks apply.
        const bodyStyle: CSSProperties | undefined =
            panelHeight || panelMinHeight
                ? ({
                      ...(panelHeight ? { "--transfer-panel-height": panelHeight } : {}),
                      ...(panelMinHeight ? { "--transfer-panel-min-height": panelMinHeight } : {})
                  } as CSSProperties)
                : undefined;

        return (
            <div className={classNames("transfer-list__panel", `transfer-list__panel--${panelSide}`)}>
                {/* Header is outside any ARIA role so the label and count are
                    not incorrectly owned by the listbox. */}
                <div className="transfer-list__panel-header">
                    <span id={labelId} className="transfer-list__panel-label">
                        {label}
                    </span>
                    {/* div (not span) so theme authors can nest badges or secondary text;
                        aria-live region announces item count changes to screen readers. */}
                    {showCount && (
                        <div className="transfer-list__panel-count" aria-live="polite" aria-atomic="true">
                            {items.length}
                        </div>
                    )}
                </div>

                {/* Search input is outside the listbox — not an ARIA option. */}
                {showSearch && (
                    <div className="transfer-list__search-wrapper">
                        <input
                            type="search"
                            className="form-control transfer-list__search"
                            placeholder={searchPlaceholder?.value ?? SEARCH_PLACEHOLDER}
                            value={searchQuery}
                            onChange={e => onSearchChange(e.target.value)}
                            aria-label={`Search ${panelSide} panel`}
                        />
                    </div>
                )}

                {/* Scrollable body — drag handlers cover the full area including empty state. */}
                <div
                    className={classNames("transfer-list__panel-body", {
                        "transfer-list__panel-body--drag-over": isDragOver
                    })}
                    style={bodyStyle}
                    onDragOver={isDragDrop ? handleBodyDragOver : undefined}
                    onDragLeave={isDragDrop ? onDragLeave : undefined}
                    onDrop={isDragDrop ? handleBodyDrop : undefined}
                >
                    {items.length === 0 ? (
                        // role="status" announces the empty state without requiring
                        // option children, avoiding an ARIA listbox violation.
                        <div className="transfer-list__empty" role="status">
                            {EMPTY_PLACEHOLDER}
                        </div>
                    ) : (
                        // role="listbox" is only rendered when it has option children
                        // (TransferItem renders role="option"), satisfying the ARIA rule
                        // that a listbox must own at least one option or group.
                        <div role="listbox" aria-labelledby={labelId} aria-multiselectable={isMultiselect}>
                            {items.map(item => (
                                <TransferItem
                                    key={item.id}
                                    item={item}
                                    isSelected={isSelected(item)}
                                    role="option"
                                    interactionMode={interactionMode}
                                    onActivate={onActivate}
                                    onToggleSelect={onToggleSelect}
                                    onDragStart={onDragStart}
                                    onDragEnd={onDragEnd}
                                    onDrop={onDrop}
                                >
                                    {renderItem(item)}
                                </TransferItem>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);
TransferPanel.displayName = "TransferPanel";
