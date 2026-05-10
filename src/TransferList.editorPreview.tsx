import { createElement, ReactElement } from "react";
import { TransferListPreviewProps } from "../typings/TransferListProps";

export function preview({ leftLabel, rightLabel }: TransferListPreviewProps): ReactElement {
    return (
        <div className="transfer-list transfer-list--preview">
            <div className="transfer-list__panel">
                <div className="transfer-list__panel-header">
                    <span className="transfer-list__panel-label">{leftLabel || "Available"}</span>
                </div>
                <div className="transfer-list__panel-body transfer-list__panel-body--preview">
                    <span className="transfer-list__preview-hint">Left panel items</span>
                </div>
            </div>
            <div className="transfer-list__controls transfer-list__controls--preview">
                <span className="transfer-list__btn-preview">{">"}</span>
                <span className="transfer-list__btn-preview">{"<"}</span>
            </div>
            <div className="transfer-list__panel">
                <div className="transfer-list__panel-header">
                    <span className="transfer-list__panel-label">{rightLabel || "Selected"}</span>
                </div>
                <div className="transfer-list__panel-body transfer-list__panel-body--preview">
                    <span className="transfer-list__preview-hint">Right panel items</span>
                </div>
            </div>
        </div>
    );
}

export function getPreviewCss(): string {
    return require("./ui/TransferList.css");
}
