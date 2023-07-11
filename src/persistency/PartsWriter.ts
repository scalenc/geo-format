import { Attribute } from '../model/Attribute';
import { Part } from '../model/Part';
import { BendingWriter } from './BendingWriter';
import { ContourWriter } from './ContourWriter';
import { ElementWriter } from './ElementWriter';
import { PointWriter } from './PointWriter';
import { SubpartWriter } from './SubpartWriter';
import { Writer } from './Writer';
import {
  PART_ATTRIBUTE_SECTION,
  PART_ATTRIBUTE_SECTION_END,
  PART_ATTRIBUTE_SEPARATOR,
  PART_BEND_ATTRIBUTE_SECTION,
  PART_BEND_ATTRIBUTE_SECTION_END,
  PART_BEND_ATTRIBUTE_START,
  PART_BLOCK_END,
  PART_COPIES_ATTRIBUTE_END,
  PART_COPIES_ATTRIBUTE_START,
  PART_COPIES_SECTION,
  PART_COPIES_SECTION_END,
  PART_ELEMENT_ATTRIBUTE_SECTION,
  PART_ELEMENT_ATTRIBUTE_SECTION_END,
  PART_ELEMENT_ATTRIBUTE_START,
  PART_ELEMENT_OR_BEND_ATTRIBUTE_END,
  PART_ELEMENT_SECTION,
  PART_SECTION,
  SECTION_END,
} from './constants';

export class PartsWriter {
  constructor(private writer: Writer, private options?: { skipOptionalMirrorFlag?: boolean }) {}

  writeList(parts: Part[]): void {
    parts.forEach((p) => this.write(p));
  }

  write(part: Part): void {
    this.writer.writeSectionLine(PART_SECTION, part.id);
    this.writeDetails(part);
    this.writePartAttributes(part);
    const pointIndexMap = PointWriter.writePoints(part.points, this.writer);
    this.writeElementAttributes(part);
    this.writeBendingAttributes(part);
    this.writePartElements(part, pointIndexMap);
    this.writeContours(part, pointIndexMap);
    this.writeCopies(part);
    this.writeSubparts(part);
    this.writeBendings(part, pointIndexMap);

    this.writer.writeSectionLine(PART_BLOCK_END);
  }

  private writeDetails(part: Part) {
    this.writer
      .writeTextLine(part.name)
      .writeTextLine(part.info)
      .writeTextLine(part.processingRule)
      .writeVectorLine(part.normDirection)
      .writeMatrixLines(part.transformation)
      .writeVectorLine(part.min)
      .writeVectorLine(part.max)
      .writeVectorLine(part.centerOfGravity)
      .writeDoubleLine(part.area)
      .writeIntLine(part.contoursCount)
      .writeIntLine(part.copiesCount)
      .writeIntLine(part.subpartsCount);
    if (part.isMirrored !== 0 || !this.options?.skipOptionalMirrorFlag) {
      this.writer.writeIntLine(part.isMirrored).writeIntLine(part.mirroringIndex);
    }

    this.writer.writeTokenLine(SECTION_END);
  }

  private writeContours(part: Part, pointIndexMap: Record<number, number>) {
    if (part.contours) {
      const contourWriter = new ContourWriter(this.writer, pointIndexMap);
      contourWriter.writeList(part.contours);
    }
  }

  private writePartElements(part: Part, pointIndexMap: Record<number, number>) {
    if (part.elements?.length) {
      const elementWriter = new ElementWriter(this.writer, pointIndexMap);
      elementWriter.writeList(PART_ELEMENT_SECTION, part.elements);
    }
  }

  private writeCopies(part: Part) {
    if (part.copies?.length) {
      part.copies.forEach((copy) => {
        this.writer.writeSectionLine(PART_COPIES_SECTION, copy.id);
        this.writer.writeTextLine(copy.info);
        this.writer.writeIntLine(copy.number);
        this.writer.writeMatrixLines(copy.transformation);
        if (Object.keys(copy.attributes).length) {
          this.writer.writeTokenLine(PART_COPIES_ATTRIBUTE_START);
          this.writeNamedAttributes(copy.attributes);
          this.writer.writeTokenLine(PART_COPIES_ATTRIBUTE_END);
        }
        this.writer.writeTokenLine(PART_COPIES_SECTION_END);
      });
    }
  }

  private writeSubparts(part: Part) {
    if (part.subparts?.length) {
      const subpartWriter = new SubpartWriter(this.writer);
      part.subparts.forEach((subpart) => subpartWriter.write(subpart));
    }
  }

  private writeBendings(part: Part, pointIndexMap: Record<number, number>) {
    if (part.bendings?.length) {
      const bendingWriter = new BendingWriter(this.writer, pointIndexMap);
      bendingWriter.writeList(part.bendings);
    }
  }

  private writePartAttributes(part: Part) {
    if (Object.keys(part.attributes).length) {
      this.writer.writeSectionLine(PART_ATTRIBUTE_SECTION);
      this.writeNamedAttributes(part.attributes);
      this.writer.writeTokenLine(PART_ATTRIBUTE_SECTION_END);
    }
  }

  private writeElementAttributes(part: Part) {
    const attributes = part.elementAttributes ? Object.values(part.elementAttributes) : undefined;
    if (attributes?.length) {
      this.writer.writeSectionLine(PART_ELEMENT_ATTRIBUTE_SECTION);
      this.writeElementOrBendAttributes(PART_ELEMENT_ATTRIBUTE_START, attributes);
      this.writer.writeTokenLine(PART_ELEMENT_ATTRIBUTE_SECTION_END);
    }
  }

  private writeBendingAttributes(part: Part) {
    const attributes = part.bendingAttributes ? Object.values(part.bendingAttributes) : undefined;
    if (attributes?.length) {
      this.writer.writeSectionLine(PART_BEND_ATTRIBUTE_SECTION);
      this.writeElementOrBendAttributes(PART_BEND_ATTRIBUTE_START, attributes);
      this.writer.writeTokenLine(PART_BEND_ATTRIBUTE_SECTION_END);
    }
  }

  private writeElementOrBendAttributes(sectionName: string, attributes: Attribute[]) {
    attributes.forEach((attribute) => {
      this.writer.writeTokenLine(sectionName).writeIntLine(attribute.number).writeIntLine(attribute.type);
      attribute.data.forEach((data) => this.writer.writeTextLine(data));
      this.writer.writeTokenLine(PART_ELEMENT_OR_BEND_ATTRIBUTE_END);
    });
  }

  private writeNamedAttributes(attributes: Record<string, string>) {
    Object.entries(attributes).forEach(([k, v]) => this.writer.writeTextLine(`${k}${PART_ATTRIBUTE_SEPARATOR}${v}`));
  }
}
