import { Element } from './element';

export interface CircleElement extends Element {
  centerPointIndex: number;
  radius: number;
}
