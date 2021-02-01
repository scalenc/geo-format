import { Part } from '../model/Part';
import { Parser } from './Parser';
import * as constants from './constants';
import { PointReader } from './PointReader';
import { ContourReader } from './ContourReader';
import { ElementReader } from './ElementReader';
import { BendingReader } from './BendingReader';
import { Attribute } from '../model/Attribute';
import { SubpartReader } from './SubpartReader';

export class PartReader {
  // eslint-disable-next-line no-useless-constructor
  public constructor(private parser: Parser) {}

  public read(): Part {
    const part = this.readDetails();

    for (;;) {
      const section = this.parser.readSectionStartLine();
      switch (section) {
        case constants.PART_POINTS_SECTION:
          this.readPoints(part);
          break;
        case constants.PART_CONTOUR_SECTION:
          this.readContours(part);
          break;
        case constants.PART_ELEMENT_SECTION:
          this.readElements(part);
          break;
        case constants.PART_COPIES_SECTION:
          this.readCopies(part);
          break;
        case constants.PART_SUBPART_SECTION:
          this.readSubparts(part);
          break;
        case constants.PART_BENDING_SECTION:
          this.readBendings(part);
          break;
        case constants.PART_ATTRIBUTE_SECTION:
          this.readPartAttributes(part);
          break;
        case constants.PART_ELEMENT_ATTRIBUTE_SECTION:
          this.readElementAttributes(part);
          break;
        case constants.PART_BEND_ATTRIBUTE_SECTION:
          this.readBendAttributes(part);
          break;
        default:
          this.parser.assertSectionEnd(constants.PART_BLOCK_END, section);
          return part;
      }
    }
  }

  readDetails(): Part {
    const name = this.parser.readTextLine();
    const info = this.parser.readTextLine();
    const processingRule = this.parser.readTextLine();
    const normDirection = this.parser.readVectorLine();
    const transformation = this.parser.readMatrixLines();
    const min = this.parser.readVectorLine();
    const max = this.parser.readVectorLine();
    const centerOfGravity = this.parser.readVectorLine();
    const area = this.parser.readDoubleLine();
    const contoursCount = this.parser.readIntLine();
    const copiesCount = this.parser.readIntLine();
    const subpartsCount = this.parser.readIntLine();

    let isMirrored = 0;
    let mirroringIndex = 0;
    if (!this.parser.isSectionChar) {
      isMirrored = this.parser.readIntLine();
      mirroringIndex = this.parser.readIntLine();
    }

    this.parser.readExpectedSectionEndLine(constants.SECTION_END);
    return {
      name,
      info,
      processingRule,
      normDirection,
      transformation,
      min,
      max,
      centerOfGravity,
      area,
      contoursCount,
      copiesCount,
      subpartsCount,
      isMirrored,
      mirroringIndex,
      points: {},
      elements: [],
      contours: [],
      copies: [],
      bendings: [],
      subparts: [],
      attributes: {},
      elementAttributes: {},
      bendingAttributes: {},
    };
  }

  private readPoints(part: Part) {
    // eslint-disable-next-line no-param-reassign
    part.points = PointReader.readPoints(this.parser);
  }

  private readContours(part: Part) {
    const contourReader = new ContourReader(this.parser);
    part.contours.push(contourReader.read());
  }

  private readElements(part: Part) {
    const elementReader = new ElementReader(this.parser);
    // eslint-disable-next-line no-param-reassign
    part.elements = elementReader.readList();
  }

  private readCopies(part: Part) {
    const info = this.parser.readTextLine();
    const number = this.parser.readIntLine();
    const transformation = this.parser.readMatrixLines();

    this.parser.readExpectedTokenLine(constants.PART_COPIES_ATTRIBUTE_START, 'section start');
    const attributes = this.readPartOrPartCopyNamedAttributes(constants.PART_COPIES_ATTRIBUTE_END);

    part.copies.push({ info, number, transformation, attributes });

    this.parser.readExpectedSectionEndLine(constants.PART_COPIES_SECTION_END);
  }

  private readSubparts(part: Part) {
    const subpartReader = new SubpartReader(this.parser);
    part.subparts.push(subpartReader.read());
  }

  private readBendings(part: Part) {
    const bendingReader = new BendingReader(this.parser);
    part.bendings.push(bendingReader.read());
  }

  private readPartAttributes(part: Part) {
    // eslint-disable-next-line no-param-reassign
    part.attributes = this.readPartOrPartCopyNamedAttributes(constants.PART_ATTRIBUTE_SECTION_END);
  }

  private readElementAttributes(part: Part) {
    while (!this.parser.isSectionChar) {
      this.parser.readExpectedTokenLine(constants.PART_ELEMENT_ATTRIBUTE_START, 'attribute');
      const attribute = this.readElementOrBendAttribute();
      // eslint-disable-next-line no-param-reassign
      part.elementAttributes[attribute.number] = attribute;
    }
    this.parser.readExpectedSectionEndLine(constants.PART_ELEMENT_ATTRIBUTE_SECTION_END);
  }

  private readBendAttributes(part: Part) {
    while (!this.parser.isSectionChar) {
      this.parser.readExpectedTokenLine(constants.PART_BEND_ATTRIBUTE_START, 'attribute');
      const attribute = this.readElementOrBendAttribute();
      // eslint-disable-next-line no-param-reassign
      part.bendingAttributes[attribute.number] = attribute;
    }
    this.parser.readExpectedSectionEndLine(constants.PART_BEND_ATTRIBUTE_SECTION_END);
  }

  private readElementOrBendAttribute(): Attribute {
    const number = this.parser.readIntLine();
    const type = this.parser.readIntLine();
    const data = [];
    for (;;) {
      const line = this.parser.readTextLine();
      if (line === constants.PART_ELEMENT_OR_BEND_ATTRIBUTE_END) {
        break;
      }
      data.push(line);
    }
    return { number, type, data };
  }

  private readPartOrPartCopyNamedAttributes(endToken: string): { [name: string]: string } {
    const attributes: { [name: string]: string } = {};
    for (;;) {
      const line = this.parser.readTextLine();
      if (line === endToken) {
        break;
      }

      const i = line.indexOf(constants.PART_ATTRIBUTE_SEPARATOR);
      this.parser.assert(i > 0, `Invalid attribute '${line}'`);

      const name = line.substring(0, i);
      const value = line.substring(i + 1);
      attributes[name] = value;
    }
    return attributes;
  }
}
