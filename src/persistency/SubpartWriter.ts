import { Subpart } from '../model/Subpart';
import { ContourWriter } from './ContourWriter';
import { ElementWriter } from './ElementWriter';
import { PointWriter } from './PointWriter';
import { Writer } from './Writer';
import { PART_BENDING_SECTION, PART_ELEMENT_SECTION, PART_SUBPART_BLOCK_END, PART_SUBPART_SECTION, PART_SUBPART_SECTION_END } from './constants';

export class SubpartWriter {
  constructor(private writer: Writer) {}

  write(subpart: Subpart): void {
    this.writer
      .writeSectionLine(PART_SUBPART_SECTION, subpart.id)
      .writeTextLine(subpart.name)
      .writeTextLine(subpart.info)
      .writeTextLine(subpart.number)
      .writeVectorLine(subpart.min)
      .writeVectorLine(subpart.max)
      .writeVectorLine(subpart.centerOfGravity)
      .writeDoubleLine(subpart.area)
      .writeIntLine(subpart.contoursCount)
      .writeTokenLine(PART_SUBPART_SECTION_END);

    const pointIndexMap = PointWriter.writePoints(subpart.points, this.writer);
    this.writeContours(subpart, pointIndexMap);
    this.writeElements(subpart, pointIndexMap);
    this.writeBendingLines(subpart, pointIndexMap);

    this.writer.writeSectionLine(PART_SUBPART_BLOCK_END);
  }

  private writeContours(subpart: Subpart, pointIndexMap: Record<number, number>) {
    if (subpart.contours?.length) {
      const contourWriter = new ContourWriter(this.writer, pointIndexMap);
      contourWriter.writeList(subpart.contours);
    }
  }

  private writeElements(subpart: Subpart, pointIndexMap: Record<number, number>) {
    if (subpart.elements?.length) {
      const elementWriter = new ElementWriter(this.writer, pointIndexMap);
      elementWriter.writeList(PART_ELEMENT_SECTION, subpart.elements);
    }
  }

  private writeBendingLines(subpart: Subpart, pointIndexMap: Record<number, number>) {
    if (subpart.bendingLines?.length) {
      const elementWriter = new ElementWriter(this.writer, pointIndexMap);
      elementWriter.writeList(PART_BENDING_SECTION, subpart.bendingLines);
    }
  }
}
