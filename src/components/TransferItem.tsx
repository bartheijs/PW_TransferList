import { DragEvent, KeyboardEvent, ReactElement, ReactNode, createElement } from "react";
import { ObjectItem } from "mendix";
import classNames from "classnames";
import { INTERACTION_MODES, InteractionMode } from "../constants";

export interface TransferItemProps {
    item: ObjectItem;
    children: ReactNode;
    isSelected: boolean;
    role: "option";
    interactionMode: InteractionMode;
    onActivate: (item: ObjectItem) => void;
    onToggleSelect: (item: ObjectItem) => void;
    onDragStart: (item: ObjectItem) => void;
    onDragEnd: () => void;
    onDrop: () => void;
}

/**
 * A single row in a TransferList panel.
 *
 * Behaviour depends on `interactionMode`:
 * - **click**: single click activates the item (triggers add/remove).
 * - **dblclick**: double click activates the item.
 * - **multiselect**: a checkbox is rendered; clicks anywhere on the row toggle selection.
 * - **dragdrop**: the row is draggable; dropping on another row in the opposite panel triggers the action.
 *
 * Keyboard activation (Enter / Space) mirrors mouse activation.
 */
export function TransferItem({
    item,
    children,
    isSelected,
    role,
    interactionMode,
    onActivate,
    onToggleSelect,
    onDragStart,
    onDragEnd,
    onDrop
}: TransferItemProps): ReactElement {
    const isDragDrop = interactionMode === INTERACTION_MODES.DRAG_DROP;
    const isMultiselect = interactionMode === INTERACTION_MODES.MULTISELECT;

    const className = classNames("transfer-list__item", {
        "transfer-list__item--selected": isSelected
    });

    /** Triggers activation or selection toggle based on the current interaction mode. */
    const activateOrToggle = (): void => {
        if (interactionMode === INTERACTION_MODES.CLICK) {
            onActivate(item);
        } else if (isMultiselect) {
            onToggleSelect(item);
        }
    };

    const handleDoubleClick = (): void => {
        if (interactionMode === INTERACTION_MODES.DOUBLE_CLICK) {
            onActivate(item);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
        if (e.key !== "Enter" && e.key !== " ") {
            return;
        }
        e.preventDefault();
        if (interactionMode === INTERACTION_MODES.DOUBLE_CLICK) {
            onActivate(item);
            return;
        }
        activateOrToggle();
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
        // Stop propagation so the panel-body drop handler does not fire again for the same event.
        e.preventDefault();
        e.stopPropagation();
        onDrop();
    };

    return (
        <div
            className={className}
            role={role}
            aria-selected={isSelected}
            tabIndex={0}
            draggable={isDragDrop}
            onClick={activateOrToggle}
            onDoubleClick={handleDoubleClick}
            onKeyDown={handleKeyDown}
            onDragStart={isDragDrop ? handleDragStart : undefined}
            onDragOver={isDragDrop ? handleDragOver : undefined}
            onDragEnd={isDragDrop ? onDragEnd : undefined}
            onDrop={isDragDrop ? handleDrop : undefined}
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
