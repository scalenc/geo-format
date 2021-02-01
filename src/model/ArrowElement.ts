import { Element } from './Element';

export interface ArrowElement extends Element {
  startPointIndex: number;
  endPointIndex: number;
  tipLength: number;
  tipWidth: number;
}
