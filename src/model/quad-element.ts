import { Element } from './element';

export interface QuadElement extends Element {
  cornerPoint1Index: number;
  cornerPoint2Index: number;
  cornerPoint3Index: number;
  cornerPoint4Index: number;
  fill: number;
  fillColor: number;
}
