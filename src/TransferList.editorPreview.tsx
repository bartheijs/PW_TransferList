import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";
import { TransferListPreviewProps } from "../typings/TransferListProps";

export function preview({ sampleText }: TransferListPreviewProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText} />;
}

export function getPreviewCss(): string {
    return require("./ui/TransferList.css");
}
