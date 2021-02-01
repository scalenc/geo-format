import { Contour } from '../model/Contour';
import { ElementReader } from './ElementReader';
import { Parser } from './Parser';
import * as constants from './constants';

export class ContourReader {
  private elementReader: ElementReader;

  public constructor(private parser: Parser) {
    this.elementReader = new ElementReader(parser);
  }

  public read(): Contour {
    const info = this.parser.readTextLine();

    const number = this.parser.readInt();
    this.parser.skipWhiteSpace();
    const type = this.parser.readInt();
    this.parser.skipWhiteSpace();
    const isInner = this.parser.readIntLine();

    const innerContoursCount = this.parser.readIntLine();

    const orientation = this.parser.readVectorLine();
    const min = this.parser.readVectorLine();
    const max = this.parser.readVectorLine();
    const centerOfGravity = this.parser.readVectorLine();
    const area = this.parser.readDoubleLine();

    const parentContourNumber = this.parser.readIntLine();

    this.parser.readExpectedSectionEndLine(constants.PART_CONTOUR_SECTION_END);

    const segments = [];
    const offsetSegments = [];
    for (;;) {
      const section = this.parser.readSectionStartLine();
      if (section === constants.PART_CONTOUR_ELEMENT_SECTION) {
        segments.push(...this.elementReader.readList());
      } else if (section === constants.PART_CONTOUR_OFFSET_ELEMENT_SECTION) {
        offsetSegments.push(...this.elementReader.readList());
      } else {
        this.parser.assertSectionEnd(constants.PART_CONTOUR_BLOCK_END, section);
        break;
      }
    }
    return {
      info,
      number,
      type,
      isInner,
      innerContoursCount,
      orientation,
      min,
      max,
      centerOfGravity,
      area,
      parentContourNumber,
      segments,
      offsetSegments,
    };
  }
}
