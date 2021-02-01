import { Matrix } from './Matrix';

export interface PartCopy {
  info: string;
  number: number;
  transformation: Matrix;
  attributes: { [key: string]: string };
}
