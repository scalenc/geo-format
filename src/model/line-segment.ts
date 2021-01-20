import { Element } from "./element";

export interface LineSegment extends Element {
    startPointIndex: number;
    endPointIndex: number;
    isChamfer: boolean;
}