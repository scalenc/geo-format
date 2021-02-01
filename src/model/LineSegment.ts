import { Element } from './Element';

export interface LineSegment extends Element {
  startPointIndex: number;
  endPointIndex: number;
  isChamfer: boolean;
}
