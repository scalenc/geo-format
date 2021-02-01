import { Element } from './Element';

export interface QuadElement extends Element {
  cornerPoint1Index: number;
  cornerPoint2Index: number;
  cornerPoint3Index: number;
  cornerPoint4Index: number;
  fill: number;
  fillColor: number;
}
