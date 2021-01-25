import { Element } from './element';

export enum PointType {
  DOT_MARKER = 0,
  PLUS_SIGN = 1,
  ASTERIX = 2,
  CIR_MARKER = 3,
  CROSS = 4,
  TRIANGLE = 5,
  SQUARE_SIGN = 6,
  DIAMOND = 7,
  SQUARE_CROSS = 8,
  DDOT_MARKER = 9,
  MINIDOT_MARKER = 10,
  MINICIRCLE_MARKER = 11,
  MINISQUARE_MARKER = 12,
  MEDIUMDOT_MARKER = 13,
}

export interface PointElement extends Element {
  pointIndex: number;
}
