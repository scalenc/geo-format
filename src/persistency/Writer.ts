import { Matrix } from '../model/Matrix';
import { Vector } from '../model/Vector';
import { SECTION_TOKEN } from './constants';

export class Writer {
  lines: string[] = [];

  writeTokenLine(t: string, id?: string): Writer {
    this.lines.push(id ? `${t}          ${id}` : t);
    return this;
  }

  writeSectionLine(t: string, id?: string): Writer {
    return this.writeTokenLine(`${SECTION_TOKEN}${t}`, id);
  }

  writeTextLine(t: string): Writer {
    return this.writeTokenLine(t);
  }

  writeIntLine(i: number): Writer {
    return this.writeTokenLine(`${i}`);
  }

  writeDoubleLine(d: number): Writer {
    return this.writeTokenLine(`${d.toFixed(9)}`);
  }

  writeVectorLine(v: Vector): Writer {
    return this.writeDoubleListLine([v.x, v.y, v.z]);
  }

  writeIntListLine(v: number[]): Writer {
    return this.writeTokenLine(v.join(' '));
  }

  writeDoubleListLine(v: number[]): Writer {
    return this.writeTokenLine(v.map((x) => x.toFixed(9)).join(' '));
  }

  writeMatrixLines(matrix: Matrix): Writer {
    if (matrix.values.length !== 4) throw new Error(`Expected 4 rows in matrix, got ${matrix.values.length}`);
    for (let i = 0; i < 4; ++i) {
      if (matrix.values[i].length !== 4) throw new Error(`Expected 4 columns in matrix row ${i}, got ${matrix.values.length}`);
      this.writeDoubleListLine(matrix.values[i]);
    }
    return this;
  }
}
