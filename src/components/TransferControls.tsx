import { ReactElement, createElement, memo } from "react";
import { DynamicValue, WebIcon } from "mendix";
import { Icon } from "mendix/components/web/Icon";
import { INTERACTION_MODES, InteractionMode } from "../constants";

interface ControlButtonProps {
    /** Unicode fallback rendered when no Studio Pro icon is configured. */
    icon: string;
    /** Optional icon configured via the Studio Pro icon picker. Takes precedence over `icon`. */
    iconValue?: DynamicValue<WebIcon>;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

/** A single arrow button in the controls column. */
function ControlButton({ icon, iconValue, label, onClick, disabled }: ControlButtonProps): ReactElement {
    return (
        <button
            className="btn btn-default transfer-list__btn"
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
        >
            {iconValue?.value ? <Icon icon={iconValue.value} /> : icon}
        </button>
    );
}

export interface TransferControlsProps {
    interactionMode: InteractionMode;
    showMoveAll: boolean;
    canMoveRight: boolean;
    canMoveLeft: boolean;
    onMoveRight: () => void;
    onMoveLeft: () => void;
    onMoveAllRight: () => void;
    onMoveAllLeft: () => void;
    /** When true, a spinner is shown and all buttons are disabled while bulk actions complete. */
    isBulkMoving: boolean;
    /** Optional custom icons for each button (fall back to unicode glyphs when absent). */
    moveAllRightIcon?: DynamicValue<WebIcon>;
    moveRightIcon?: DynamicValue<WebIcon>;
    moveLeftIcon?: DynamicValue<WebIcon>;
    moveAllLeftIcon?: DynamicValue<WebIcon>;
}

/**
 * Middle column rendering the four possible movement buttons:
 * - `»` / `«` (move-all) when `showMoveAll` is on
 * - `›` / `‹` (move-selected) when in multiselect mode
 *
 * Shows a CSS spinner and disables all buttons during a bulk-move operation.
 *
 * Memoized so it only re-renders when its own props change (selection size changes,
 * action references change, or the parent's mode toggles).
 */
export const TransferControls = memo(
    ({
        interactionMode,
        showMoveAll,
        canMoveRight,
        canMoveLeft,
        onMoveRight,
        onMoveLeft,
        onMoveAllRight,
        onMoveAllLeft,
        isBulkMoving,
        moveAllRightIcon,
        moveRightIcon,
        moveLeftIcon,
        moveAllLeftIcon
    }: TransferControlsProps): ReactElement => {
        const isMultiselect = interactionMode === INTERACTION_MODES.MULTISELECT;

        return (
            <div className="transfer-list__controls" role="group" aria-label="Transfer controls">
                {/* Spinner is shown while bulk actions are in flight; buttons are hidden. */}
                {isBulkMoving && (
                    <div
                        className="transfer-list__spinner"
                        role="status"
                        aria-label="Moving items…"
                        aria-live="polite"
                    />
                )}
                {!isBulkMoving && showMoveAll && (
                    <ControlButton
                        icon="»"
                        iconValue={moveAllRightIcon}
                        label="Move all to right"
                        onClick={onMoveAllRight}
                    />
                )}
                {!isBulkMoving && isMultiselect && (
                    <ControlButton
                        icon="›"
                        iconValue={moveRightIcon}
                        label="Move selected to right"
                        onClick={onMoveRight}
                        disabled={!canMoveRight}
                    />
                )}
                {!isBulkMoving && isMultiselect && (
                    <ControlButton
                        icon="‹"
                        iconValue={moveLeftIcon}
                        label="Move selected to left"
                        onClick={onMoveLeft}
                        disabled={!canMoveLeft}
                    />
                )}
                {!isBulkMoving && showMoveAll && (
                    <ControlButton
                        icon="«"
                        iconValue={moveAllLeftIcon}
                        label="Move all to left"
                        onClick={onMoveAllLeft}
                    />
                )}
            </div>
        );
    }
);
TransferControls.displayName = "TransferControls";
