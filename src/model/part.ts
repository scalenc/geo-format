import { Attribute } from './attribute';
import { Bending } from './bending';
import { Contour } from './contour';
import { Element } from './element';
import { Matrix } from './matrix';
import { PartCopy } from './part-copy';
import { Subpart } from './subpart';
import { Vector } from './vector';

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
  points: { [key: number]: Vector; };
  elements: Element[];
  contours: Contour[];
  copies: PartCopy[];
  bendings: Bending[];
  subparts: Subpart[];
  attributes: { [key: string]: string; };
  elementAttributes: { [key: number]: Attribute; };
  bendingAttributes: { [key: number]: Attribute; };
}
