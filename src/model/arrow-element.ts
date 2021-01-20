import { Element } from "./element";

export interface ArrowElement extends Element {
    startPointIndex: number;
    endPointIndex: number;
    tipLength: number;
    tipWidth: number;
}