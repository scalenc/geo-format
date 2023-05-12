import { Element } from './Element';

export interface Bending {
  id?: string;
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
