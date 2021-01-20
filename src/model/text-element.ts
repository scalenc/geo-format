import { Element } from './element';

export interface TextElement extends Element {
  startPointIndex: number;
  charHeight: number;
  charRatio: number;
  charAngle: number;
  lineSeparation: number;
  textAngle: number;
  textAlignment: number;
  textOrientation: number;
  text: string[];
}
