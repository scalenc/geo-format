import { Element } from './Element';

export interface Bending {
  type: number;
  method: number;
  technique: number;
  angle: number;
  preAngle: number;
  startRadius: number;
  radiusFromTable: number;
  bendingFactor: number;
  upperTool: string;
  lowerTool: string;
  attributes?: number[];
  bendingLines: Element[];
}
