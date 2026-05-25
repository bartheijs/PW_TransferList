/**
 * This file was generated from TransferList.xml
 * WARNING: All changes made to this file will be overwritten
 * @author Mendix Widgets Framework Team
 */
import { ComponentType, CSSProperties, ReactNode } from "react";
import { DynamicValue, ListValue, ListActionValue, ListExpressionValue, ListWidgetValue, WebIcon } from "mendix";

export type PanelHeightModeEnum = "fixed" | "fill";

export type PanelHeightUnitEnum = "px" | "rem" | "vh";

export type PanelMinHeightUnitEnum = "px" | "rem" | "vh";

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
    showCount: boolean;
    panelHeightMode: PanelHeightModeEnum;
    panelHeight: number;
    panelHeightUnit: PanelHeightUnitEnum;
    panelMinHeight: number;
    panelMinHeightUnit: PanelMinHeightUnitEnum;
    interactionMode: InteractionModeEnum;
    moveRightIcon?: DynamicValue<WebIcon>;
    moveLeftIcon?: DynamicValue<WebIcon>;
    showMoveAll: boolean;
    moveAllRightIcon?: DynamicValue<WebIcon>;
    moveAllLeftIcon?: DynamicValue<WebIcon>;
    onAdd?: ListActionValue;
    onRemove?: ListActionValue;
    showLeftSearch: boolean;
    leftSearchAttribute?: ListExpressionValue<string>;
    leftSearchPlaceholder?: DynamicValue<string>;
    showRightSearch: boolean;
    rightSearchAttribute?: ListExpressionValue<string>;
    rightSearchPlaceholder?: DynamicValue<string>;
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
    showCount: boolean;
    panelHeightMode: PanelHeightModeEnum;
    panelHeight: number | null;
    panelHeightUnit: PanelHeightUnitEnum;
    panelMinHeight: number | null;
    panelMinHeightUnit: PanelMinHeightUnitEnum;
    interactionMode: InteractionModeEnum;
    moveRightIcon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    moveLeftIcon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    showMoveAll: boolean;
    moveAllRightIcon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    moveAllLeftIcon: { type: "glyph"; iconClass: string; } | { type: "image"; imageUrl: string; iconUrl: string; } | { type: "icon"; iconClass: string; } | undefined;
    onAdd: {} | null;
    onRemove: {} | null;
    showLeftSearch: boolean;
    leftSearchAttribute: string;
    leftSearchPlaceholder: string;
    showRightSearch: boolean;
    rightSearchAttribute: string;
    rightSearchPlaceholder: string;
}
