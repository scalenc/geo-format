import { Element } from './Element';

export interface ConstructionLineElement extends Element {
  pointIndex: number;
  xSlope: number;
  ySlope: number;
  offset: number;
}
