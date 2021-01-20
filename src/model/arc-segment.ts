import { Element } from './element';

export enum Orientation {
  CLOCKWISE = -1,
  COUNTER_CLOCKWISE = +1,
}

export interface ArcSegment extends Element {
  centerPointIndex: number;
  startPointIndex: number;
  endPointIndex: number;
  orientation: Orientation;
  isRounding: boolean;
}
