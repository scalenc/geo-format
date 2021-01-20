import { Element } from './element';

export interface ConstructionLineElement extends Element {
  pointIndex: number;
  xSlope: number;
  ySlope: number;
  offset: number;
}
