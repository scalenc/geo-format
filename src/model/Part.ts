import { Attribute } from './Attribute';
import { Bending } from './Bending';
import { Contour } from './Contour';
import { Element } from './Element';
import { Matrix } from './Matrix';
import { PartCopy } from './PartCopy';
import { Subpart } from './Subpart';
import { Vector } from './Vector';

export interface Part {
  name: string;
  info: string;
  processingRule: string;
  normDirection: Vector;
  transformation: Matrix;
  min: Vector;
  max: Vector;
  centerOfGravity: Vector;
  area: number;
  contoursCount: number;
  copiesCount: number;
  subpartsCount: number;
  isMirrored: number;
  mirroringIndex: number;
  points: { [key: number]: Vector };
  elements: Element[];
  contours: Contour[];
  copies: PartCopy[];
  bendings: Bending[];
  subparts: Subpart[];
  attributes: { [key: string]: string };
  elementAttributes: { [key: number]: Attribute };
  bendingAttributes: { [key: number]: Attribute };
}
