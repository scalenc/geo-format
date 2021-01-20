import { Matrix } from "./matrix";

export interface PartCopy {
    info: string;
    number: number;
    transformation: Matrix;
    attributes: { [key: string]: string; };
}