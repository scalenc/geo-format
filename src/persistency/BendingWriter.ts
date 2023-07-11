import { Bending } from '../model/Bending';
import { Element } from '../model/Element';
import { ElementWriter } from './ElementWriter';
import { Writer } from './Writer';
import { PART_BENDING_BLOCK_END, PART_BENDING_ELEMENT_SECTION, PART_BENDING_SECTION, PART_BENDING_SECTION_END } from './constants';

export class BendingWriter {
  constructor(private writer: Writer, private pointIndexMap: Record<number, number>) {}

  writeList(bendings: Bending[]): void {
    bendings.forEach((bending) => this.write(bending));
  }

  write(bending: Bending): void {
    this.writer.writeSectionLine(PART_BENDING_SECTION, bending.id);
    this.writeDetails(bending);
    this.writeAttributes(bending);

    this.writer.writeTokenLine(PART_BENDING_SECTION_END);
    this.writeBendingLines(bending.bendingLines);
    this.writer.writeSectionLine(PART_BENDING_BLOCK_END);
  }

  private writeDetails(bending: Bending) {
    this.writer
      .writeIntListLine([bending.type, bending.method, bending.technique])
      .writeDoubleListLine([bending.angle, bending.preAngle])
      .writeDoubleListLine([bending.startRadius, bending.radiusFromTable])
      .writeDoubleLine(bending.bendingFactor)
      .writeTextLine(bending.upperTool)
      .writeTextLine(bending.lowerTool);
  }

  private writeAttributes(bending: Bending) {
    if (bending.attributes?.length) {
      this.writer.writeIntLine(bending.attributes.length);
      bending.attributes.forEach((attributeIndex) => this.writer.writeIntLine(attributeIndex));
    }
  }

  private writeBendingLines(bendingLines: Element[]) {
    if (bendingLines) {
      const elementWriter = new ElementWriter(this.writer, this.pointIndexMap);
      elementWriter.writeList(PART_BENDING_ELEMENT_SECTION, bendingLines);
    }
  }
}
