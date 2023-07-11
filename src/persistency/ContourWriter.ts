import { Contour } from '../model/Contour';
import { Element } from '../model/Element';
import { ElementWriter } from './ElementWriter';
import { Writer } from './Writer';
import {
  PART_CONTOUR_BLOCK_END,
  PART_CONTOUR_ELEMENT_SECTION,
  PART_CONTOUR_INDICES_SECTION,
  PART_CONTOUR_OFFSET_ELEMENT_LINKS_SECTION,
  PART_CONTOUR_OFFSET_ELEMENT_SECTION,
  PART_CONTOUR_SECTION,
  PART_CONTOUR_SECTION_END,
  PART_ELEMENT_SECTION_END,
} from './constants';

export class ContourWriter {
  constructor(private writer: Writer, private pointIndexMap: Record<number, number>) {}

  writeList(contours: Contour[]): void {
    contours.forEach((contour) => this.write(contour));
  }

  write(contour: Contour): void {
    this.writer
      .writeSectionLine(PART_CONTOUR_SECTION, contour.id)
      .writeTextLine(contour.info)
      .writeIntListLine([contour.number, contour.type, contour.isInner])
      .writeIntLine(contour.innerContoursCount)
      .writeVectorLine(contour.orientation)
      .writeVectorLine(contour.min)
      .writeVectorLine(contour.max)
      .writeVectorLine(contour.centerOfGravity)
      .writeDoubleLine(contour.area)
      .writeIntLine(contour.parentContourNumber)
      .writeTokenLine(PART_CONTOUR_SECTION_END);

    this.writeElements(PART_CONTOUR_ELEMENT_SECTION, contour.segments);
    this.writeElements(PART_CONTOUR_OFFSET_ELEMENT_SECTION, contour.offsetSegments);

    if (contour.indices.length) this.writeListOfInts(PART_CONTOUR_INDICES_SECTION, contour.indices);
    if (contour.offsetSegmentLinks.length) this.writeListOfInts(PART_CONTOUR_OFFSET_ELEMENT_LINKS_SECTION, contour.offsetSegmentLinks);

    this.writer.writeSectionLine(PART_CONTOUR_BLOCK_END);
  }

  private writeElements(sectionName: string, segments: Element[]) {
    if (segments?.length) {
      const elementWriter = new ElementWriter(this.writer, this.pointIndexMap);
      elementWriter.writeList(sectionName, segments);
    }
  }

  private writeListOfInts(sectionName: string, ints: number[]) {
    this.writer.writeSectionLine(sectionName);
    ints.forEach((i) => this.writer.writeIntLine(i));
    this.writer.writeTokenLine(PART_ELEMENT_SECTION_END);
  }
}
