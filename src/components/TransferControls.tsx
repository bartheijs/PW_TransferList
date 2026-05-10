import { ReactElement, createElement, memo } from "react";
import { INTERACTION_MODES, InteractionMode } from "../constants";

interface ControlButtonProps {
    icon: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
}

/** A single arrow button in the controls column. */
function ControlButton({ icon, label, onClick, disabled }: ControlButtonProps): ReactElement {
    return (
        <button
            className="btn btn-default transfer-list__btn"
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
        >
            {icon}
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
}

/**
 * Middle column rendering the four possible movement buttons:
 * - `»` / `«` (move-all) when `showMoveAll` is on
 * - `›` / `‹` (move-selected) when in multiselect mode
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
        onMoveAllLeft
    }: TransferControlsProps): ReactElement => {
        const isMultiselect = interactionMode === INTERACTION_MODES.MULTISELECT;

        return (
            <div className="transfer-list__controls" role="group" aria-label="Transfer controls">
                {showMoveAll && <ControlButton icon="»" label="Move all to right" onClick={onMoveAllRight} />}
                {isMultiselect && (
                    <ControlButton
                        icon="›"
                        label="Move selected to right"
                        onClick={onMoveRight}
                        disabled={!canMoveRight}
                    />
                )}
                {isMultiselect && (
                    <ControlButton
                        icon="‹"
                        label="Move selected to left"
                        onClick={onMoveLeft}
                        disabled={!canMoveLeft}
                    />
                )}
                {showMoveAll && <ControlButton icon="«" label="Move all to left" onClick={onMoveAllLeft} />}
            </div>
        );
    }
);
TransferControls.displayName = "TransferControls";
