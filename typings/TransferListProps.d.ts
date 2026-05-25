/**
 * This file was generated from TransferList.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ActionValue, ListValue, ListActionValue, ListExpressionValue, ListWidgetValue } from "mendix";

export type InteractionModeEnum = "click" | "dblclick" | "multiselect" | "dragdrop";

export interface TransferListContainerProps {
    name: string;
    class: string;
    style?: CSSProperties;
    tabIndex?: number;
    leftDataSource: ListValue;
    leftContent?: ListWidgetValue;
    leftLabel?: ReactNode;
    rightDataSource: ListValue;
    rightContent?: ListWidgetValue;
    rightLabel?: ReactNode;
    interactionMode: InteractionModeEnum;
    onAdd?: ListActionValue;
    onRemove?: ListActionValue;
    onAddAll?: ActionValue;
    onRemoveAll?: ActionValue;
    showLeftSearch: boolean;
    leftSearchAttribute?: ListExpressionValue<string>;
    showRightSearch: boolean;
    rightSearchAttribute?: ListExpressionValue<string>;
    showMoveAll: boolean;
    panelHeight: string;
}

export interface TransferListPreviewProps {
    /**
     * @deprecated Deprecated since version 9.18.0. Please use class property instead.
     */
    className: string;
    class: string;
    style: string;
    styleObject?: CSSProperties;
    readOnly: boolean;
    renderMode: "design" | "xray" | "structure";
    translate: (text: string) => string;
    leftDataSource: {} | { caption: string } | { type: string } | null;
    leftContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    leftLabel: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    rightDataSource: {} | { caption: string } | { type: string } | null;
    rightContent: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    rightLabel: { widgetCount: number; renderer: ComponentType<{ children: ReactNode; caption?: string }> };
    interactionMode: InteractionModeEnum;
    onAdd: {} | null;
    onRemove: {} | null;
    onAddAll: {} | null;
    onRemoveAll: {} | null;
    showLeftSearch: boolean;
    leftSearchAttribute: string;
    showRightSearch: boolean;
    rightSearchAttribute: string;
    showMoveAll: boolean;
    panelHeight: string;
}
