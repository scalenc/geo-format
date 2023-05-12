import { Subpart } from '../model/Subpart';
import { ElementReader } from './ElementReader';
import { Parser } from './Parser';
import * as constants from './constants';
import { PointReader } from './PointReader';
import { ContourReader } from './ContourReader';

export class SubpartReader {
  // eslint-disable-next-line no-useless-constructor
  public constructor(private parser: Parser) {}

  public read(id?: string): Subpart {
    const subpart = this.readDetails(id);

    for (;;) {
      const [section, id] = this.parser.readSectionStartLine();
      if (section === constants.PART_POINTS_SECTION) {
        this.readPoints(subpart);
      } else if (section === constants.PART_CONTOUR_SECTION) {
        this.readContours(subpart, id);
      } else if (section === constants.PART_ELEMENT_SECTION) {
        this.readElements(subpart);
      } else if (section === constants.PART_BENDING_SECTION) {
        this.readBendingLines(subpart);
      } else {
        this.parser.assertSectionEnd(constants.PART_SUBPART_BLOCK_END, section);
        break;
      }
    }

    return subpart;
  }

  private readDetails(id?: string): Subpart {
    const name = this.parser.readTextLine();
    const info = this.parser.readTextLine();
    const number = this.parser.readTextLine();
    const min = this.parser.readVectorLine();
    const max = this.parser.readVectorLine();
    const centerOfGravity = this.parser.readVectorLine();
    const area = this.parser.readDoubleLine();
    const contoursCount = this.parser.readIntLine();
    this.parser.readExpectedSectionEndLine(constants.PART_SUBPART_SECTION_END);
    return {
      id,
      name,
      info,
      number,
      min,
      max,
      centerOfGravity,
      area,
      contoursCount,
      points: {},
      elements: [],
      bendingLines: [],
      contours: [],
    };
  }

  private readPoints(subpart: Subpart) {
    // eslint-disable-next-line no-param-reassign
    subpart.points = PointReader.readPoints(this.parser);
  }

  private readContours(subpart: Subpart, id: string) {
    const contourReader = new ContourReader(this.parser);
    subpart.contours.push(contourReader.read(id));
  }

  private readElements(subpart: Subpart) {
    const elementReader = new ElementReader(this.parser);
    // eslint-disable-next-line no-param-reassign
    subpart.elements = elementReader.readList();
  }

  private readBendingLines(subpart: Subpart) {
    const elementReader = new ElementReader(this.parser);
    // eslint-disable-next-line no-param-reassign
    subpart.bendingLines = elementReader.readList();
  }
}
