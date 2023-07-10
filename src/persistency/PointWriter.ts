import { Vector } from '../model/Vector';
import { Writer } from './Writer';
import { PART_POINTS_SECTION, PART_POINTS_SECTION_END, PART_POINT_END, PART_POINT_START } from './constants';

export class PointWriter {
  static writePoints(points: Record<number, Vector>, writer: Writer): Record<number, number> {
    const sortedPoints = Object.entries(points).sort(([, p1], [, p2]) => {
      if (p1.x !== p2.x) return p1.x - p2.x;
      return p1.y - p2.y;
    });
    const pointIndexMap = Object.fromEntries(sortedPoints.map(([key], i) => [key, i + 1]));

    if (sortedPoints.length) {
      writer.writeSectionLine(PART_POINTS_SECTION);
      sortedPoints.forEach(([, p], i) => {
        writer.writeTokenLine(PART_POINT_START);
        writer.writeIntLine(i + 1);
        writer.writeVectorLine(p);
        writer.writeTokenLine(PART_POINT_END);
      });
      writer.writeTokenLine(PART_POINTS_SECTION_END);
    }

    return pointIndexMap;
  }
}
