import { Contour } from './Contour';
import { Element } from './Element';
import { Vector } from './Vector';

export interface Subpart {
  id?: string;
  name: string;
  info: string;
  number: string;
  min: Vector;
  max: Vector;
  centerOfGravity: Vector;
  area: number;
  contoursCount: number;
  points: { [key: number]: Vector };
  elements: Element[];
  bendingLines: Element[];
  contours: Contour[];
}
