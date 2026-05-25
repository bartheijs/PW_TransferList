/**
 * This file was generated from TransferList.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { ListValue, ListActionValue, ListExpressionValue, ListWidgetValue } from "mendix";

export type PanelHeightModeEnum = "fixed" | "fill";

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
    panelHeightMode: PanelHeightModeEnum;
    panelHeight: string;
    interactionMode: InteractionModeEnum;
    showMoveAll: boolean;
    onAdd?: ListActionValue;
    onRemove?: ListActionValue;
    showLeftSearch: boolean;
    leftSearchAttribute?: ListExpressionValue<string>;
    showRightSearch: boolean;
    rightSearchAttribute?: ListExpressionValue<string>;
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
    panelHeightMode: PanelHeightModeEnum;
    panelHeight: string;
    interactionMode: InteractionModeEnum;
    showMoveAll: boolean;
    onAdd: {} | null;
    onRemove: {} | null;
    showLeftSearch: boolean;
    leftSearchAttribute: string;
    showRightSearch: boolean;
    rightSearchAttribute: string;
}
