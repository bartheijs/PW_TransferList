import { createElement, ReactElement } from "react";

export interface TransferControlsProps {
    interactionMode: string;
    showMoveAll: boolean;
    canMoveRight: boolean;
    canMoveLeft: boolean;
    onMoveRight: () => void;
    onMoveLeft: () => void;
    onMoveAllRight: () => void;
    onMoveAllLeft: () => void;
}

export function TransferControls({
    interactionMode,
    showMoveAll,
    canMoveRight,
    canMoveLeft,
    onMoveRight,
    onMoveLeft,
    onMoveAllRight,
    onMoveAllLeft
}: TransferControlsProps): ReactElement {
    const isMultiselect = interactionMode === "multiselect";

    return (
        <div className="transfer-list__controls" role="group" aria-label="Transfer controls">
            {showMoveAll && (
                <button
                    className="btn btn-default transfer-list__btn"
                    type="button"
                    onClick={onMoveAllRight}
                    aria-label="Move all to right"
                    title="Move all to right"
                >
                    {"»"}
                </button>
            )}
            {isMultiselect && (
                <button
                    className="btn btn-default transfer-list__btn"
                    type="button"
                    onClick={onMoveRight}
                    disabled={!canMoveRight}
                    aria-label="Move selected to right"
                    title="Move selected to right"
                >
                    {">"}
                </button>
            )}
            {isMultiselect && (
                <button
                    className="btn btn-default transfer-list__btn"
                    type="button"
                    onClick={onMoveLeft}
                    disabled={!canMoveLeft}
                    aria-label="Move selected to left"
                    title="Move selected to left"
                >
                    {"<"}
                </button>
            )}
            {showMoveAll && (
                <button
                    className="btn btn-default transfer-list__btn"
                    type="button"
                    onClick={onMoveAllLeft}
                    aria-label="Move all to left"
                    title="Move all to left"
                >
                    {"«"}
                </button>
            )}
        </div>
    );
}
