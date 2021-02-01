import { Element } from './Element';
import { Vector } from './Vector';

export enum ContourType {
  CLOSED = 24,
  OPEN = 25,
}

export enum ContourInnerType {
  OUTER = 0,
  INNER = 1,
  UNKNOWN = 2,
}

export interface Contour {
  info: string;
  number: number;
  type: number;
  isInner: number;
  innerContoursCount: number;
  orientation: Vector;
  min: Vector;
  max: Vector;
  centerOfGravity: Vector;
  area: number;
  parentContourNumber: number;
  segments: Element[];
  offsetSegments: Element[];
}
