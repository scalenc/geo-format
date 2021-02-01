import { Element } from './Element';

export enum TextAlignment {
  VERTICAL_BOTTOM = 1,
  VERTICAL_CENTER = 2,
  VERTICAL_TOP = 4,
  HORIZONTAL_LEFT = 8,
  HORIZONTAL_CENTER = 16,
  HORIZONTAL_RIGHT = 32,
}

export enum TextOrientation {
  RIGHT = 1,
  LEFT = 2,
  UP = 3,
  DOWN = 4,
}

export interface TextElement extends Element {
  startPointIndex: number;
  charHeight: number;
  charRatio: number;
  charAngle: number;
  lineSeparation: number;
  textAngle: number;
  textAlignment: TextAlignment;
  textOrientation: TextOrientation;
  text: string[];
}
