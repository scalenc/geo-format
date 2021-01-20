import { Contour } from './contour';
import { Element } from './element';
import { Vector } from './vector';

export interface Subpart {
  name: string;
  info: string;
  number: string;
  min: Vector;
  max: Vector;
  centerOfGravity: Vector;
  area: number;
  contoursCount: number;
  points: { [key: number]: Vector; };
  elements: Element[];
  bendingLines: Element[];
  contours: Contour[];
}
