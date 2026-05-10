import { createElement, DragEvent, ReactElement, ReactNode } from "react";
import { ObjectItem } from "mendix";

export interface TransferItemProps {
    item: ObjectItem;
    children: ReactNode;
    isSelected: boolean;
    interactionMode: string;
    onActivate: (item: ObjectItem) => void;
    onToggleSelect: (item: ObjectItem) => void;
    onDragStart: (item: ObjectItem) => void;
    onDrop: (item: ObjectItem) => void;
}

export function TransferItem({
    item,
    children,
    isSelected,
    interactionMode,
    onActivate,
    onToggleSelect,
    onDragStart,
    onDrop
}: TransferItemProps): ReactElement {
    const isDragDrop = interactionMode === "dragdrop";
    const isMultiselect = interactionMode === "multiselect";

    const className = ["transfer-list__item", isSelected ? "transfer-list__item--selected" : ""]
        .filter(Boolean)
        .join(" ");

    const handleClick = (): void => {
        if (interactionMode === "click") {
            onActivate(item);
        } else if (isMultiselect) {
            onToggleSelect(item);
        }
    };

    const handleDoubleClick = (): void => {
        if (interactionMode === "dblclick") {
            onActivate(item);
        }
    };

    const handleDragStart = (e: DragEvent<HTMLDivElement>): void => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart(item);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        onDrop(item);
    };

    return (
        <div
            className={className}
            role="option"
            aria-selected={isSelected}
            tabIndex={0}
            draggable={isDragDrop}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            onDragStart={isDragDrop ? handleDragStart : undefined}
            onDragOver={isDragDrop ? handleDragOver : undefined}
            onDrop={isDragDrop ? handleDrop : undefined}
            onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (interactionMode === "click" || interactionMode === "dblclick") {
                        onActivate(item);
                    } else if (isMultiselect) {
                        onToggleSelect(item);
                    }
                }
            }}
        >
            {isMultiselect && (
                <input
                    type="checkbox"
                    className="transfer-list__item-checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(item)}
                    onClick={e => e.stopPropagation()}
                    aria-label="Select item"
                    tabIndex={-1}
                />
            )}
            <span className="transfer-list__item-content">{children}</span>
        </div>
    );
}
