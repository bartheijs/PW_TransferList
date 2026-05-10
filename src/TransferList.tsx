import { ReactElement, createElement } from "react";
import { HelloWorldSample } from "./components/HelloWorldSample";

import { TransferListContainerProps } from "../typings/TransferListProps";

import "./ui/TransferList.css";

export function TransferList({ sampleText }: TransferListContainerProps): ReactElement {
    return <HelloWorldSample sampleText={sampleText ? sampleText : "World"} />;
}
