import { Vector } from "../model/vector";
import { Parser } from "./parser";
import * as constants from './constants';

export class PointReader {
    public static readPoints(parser: Parser): { [index: number]: Vector } {
        var points = {};
        while (!parser.isSectionChar) {
            parser.readExpectedTokenLine(constants.PART_POINT_START, `point`);
            var number = parser.readIntLine();
            var vector = parser.readVectorLine();
            points[number] = vector;
            parser.readExpectedSectionEndLine(constants.PART_POINT_END);
        }
        parser.readExpectedSectionEndLine(constants.PART_POINTS_SECTION_END);
        return points;
    }
}