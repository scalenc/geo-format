import { Subpart } from "../model/subpart";
import { ElementReader } from "./element-reader";
import { Parser } from "./parser";
import * as constants from './constants';
import { PointReader } from "./point-reader";
import { ContourReader } from "./contour-reader";

export class SubpartReader {
    public constructor(private parser: Parser) {
    }

    public read(): Subpart {
        const subpart = this.readDetails();

        for (; ;) {
            var section = this.parser.readSectionStartLine();
            if (section == constants.PART_POINTS_SECTION) {
                this.readPoints(subpart);
            }
            else if (section == constants.PART_CONTOUR_SECTION) {
                this.readContours(subpart);
            }
            else if (section == constants.PART_ELEMENT_SECTION) {
                this.readElements(subpart);
            }
            else if (section == constants.PART_BENDING_SECTION) {
                this.readBendingLines(subpart);
            }
            else {
                this.parser.assertSectionEnd(constants.PART_SUBPART_BLOCK_END, section);
                break;
            }
        }

        return subpart;
    }

    private readDetails(): Subpart {
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
        }
    }


    private readPoints(subpart: Subpart) {
        subpart.points = PointReader.readPoints(this.parser);
    }


    private readContours(subpart: Subpart) {
        var contourReader = new ContourReader(this.parser);
        subpart.contours.push(contourReader.read());
    }


    private readElements(subpart: Subpart) {
        var elementReader = new ElementReader(this.parser);
        subpart.elements = elementReader.readList();
    }


    private readBendingLines(subpart: Subpart) {
        var elementReader = new ElementReader(this.parser);
        subpart.bendingLines = elementReader.readList();
    }
}
