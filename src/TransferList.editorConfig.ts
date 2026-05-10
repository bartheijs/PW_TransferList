import { TransferListPreviewProps } from "../typings/TransferListProps";
import { hidePropertiesIn } from "@mendix/pluggable-widgets-tools";

export type Platform = "web" | "desktop";

export type Properties = PropertyGroup[];

type PropertyGroup = {
    caption: string;
    propertyGroups?: PropertyGroup[];
    properties?: Property[];
};

type Property = {
    key: string;
    caption: string;
    description?: string;
    objectHeaders?: string[];
    objects?: ObjectProperties[];
    properties?: Properties[];
};

type ObjectProperties = {
    properties: PropertyGroup[];
    captions?: string[];
};

export type Problem = {
    property?: string;
    severity?: "error" | "warning" | "deprecation";
    message: string;
    studioMessage?: string;
    url?: string;
    studioUrl?: string;
};

type BaseProps = {
    type: "Image" | "Container" | "RowLayout" | "Text" | "DropZone" | "Selectable" | "Datasource";
    grow?: number;
};

type ImageProps = BaseProps & {
    type: "Image";
    document?: string;
    data?: string;
    property?: object;
    width?: number;
    height?: number;
};

type ContainerProps = BaseProps & {
    type: "Container" | "RowLayout";
    children: PreviewProps[];
    borders?: boolean;
    borderRadius?: number;
    backgroundColor?: string;
    borderWidth?: number;
    padding?: number;
};

type RowLayoutProps = ContainerProps & {
    type: "RowLayout";
    columnSize?: "fixed" | "grow";
};

type TextProps = BaseProps & {
    type: "Text";
    content: string;
    fontSize?: number;
    fontColor?: string;
    bold?: boolean;
    italic?: boolean;
};

type DropZoneProps = BaseProps & {
    type: "DropZone";
    property: object;
    placeholder: string;
    showDataSourceHeader?: boolean;
};

type SelectableProps = BaseProps & {
    type: "Selectable";
    object: object;
    child: PreviewProps;
};

type DatasourceProps = BaseProps & {
    type: "Datasource";
    property: object | null;
    child?: PreviewProps;
};

export type PreviewProps =
    | ImageProps
    | ContainerProps
    | RowLayoutProps
    | TextProps
    | DropZoneProps
    | SelectableProps
    | DatasourceProps;

export function getProperties(values: TransferListPreviewProps, defaultProperties: Properties): Properties {
    if (!values.showLeftSearch) {
        hidePropertiesIn(defaultProperties, values, ["leftSearchAttribute"]);
    }
    if (!values.showRightSearch) {
        hidePropertiesIn(defaultProperties, values, ["rightSearchAttribute"]);
    }
    if (!values.showMoveAll) {
        hidePropertiesIn(defaultProperties, values, ["onAddAll", "onRemoveAll"]);
    }
    return defaultProperties;
}

export function getPreview(values: TransferListPreviewProps): PreviewProps {
    return {
        type: "RowLayout",
        columnSize: "grow",
        children: [
            {
                type: "Container",
                borders: true,
                borderRadius: 4,
                padding: 8,
                children: [
                    {
                        type: "Text",
                        content: values.leftLabel || "Available",
                        bold: true
                    },
                    {
                        type: "DropZone",
                        property: values.leftContent as object,
                        placeholder: "Left panel content"
                    }
                ]
            },
            {
                type: "Container",
                grow: 0,
                padding: 8,
                children: [
                    { type: "Text", content: "›" },
                    { type: "Text", content: "‹" }
                ]
            },
            {
                type: "Container",
                borders: true,
                borderRadius: 4,
                padding: 8,
                children: [
                    {
                        type: "Text",
                        content: values.rightLabel || "Selected",
                        bold: true
                    },
                    {
                        type: "DropZone",
                        property: values.rightContent as object,
                        placeholder: "Right panel content"
                    }
                ]
            }
        ]
    };
}
