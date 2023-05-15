import { Matrix } from './Matrix';

export interface PartCopy {
  id?: string;
  info: string;
  number: number;
  transformation: Matrix;
  attributes: { [key: string]: string };
}
