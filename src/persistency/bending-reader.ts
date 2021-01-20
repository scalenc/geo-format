import { Bending } from "../model/bending";
import { Parser } from "./parser";
import * as constants from './constants';
import { ElementReader } from "./element-reader";

export class BendingReader {
    private readonly elementReader: ElementReader;

    constructor(private parser: Parser) {
        this.elementReader = new ElementReader(parser);
    }

    public read(): Bending {
        const type = this.parser.readInt();
        this.parser.skipWhiteSpace();
        const method = this.parser.readInt();
        this.parser.skipWhiteSpace();
        const technique = this.parser.readIntLine();

        const angle = this.parser.readDouble();
        this.parser.skipWhiteSpace();
        const preAngle = this.parser.readDoubleLine();

        const startRadius = this.parser.readDouble();
        this.parser.skipWhiteSpace();
        const radiusFromTable = this.parser.readDoubleLine();

        const bendingFactor = this.parser.readDoubleLine();

        const upperTool = this.parser.readTextLine();
        const lowerTool = this.parser.readTextLine();

        const attributes = !this.parser.isSectionChar ? this.readAttributes() : undefined;

        this.parser.readExpectedSectionEndLine(constants.PART_BENDING_SECTION_END);

        const bendingLines = [];
        for (; ;) {
            var section = this.parser.readSectionStartLine();
            if (section == constants.PART_BENDING_ELEMENT_SECTION) {
                bendingLines.push(...this.elementReader.readList());
            } else {
                this.parser.assertSectionEnd(constants.PART_BENDING_BLOCK_END, section);
                break;
            }
        }

        return { type, method, technique, angle, preAngle, startRadius, radiusFromTable, bendingFactor, upperTool, lowerTool, attributes, bendingLines };
    }

    readAttributes() {
        const count = this.parser.readIntLine();
        if (count > 0) {
            const attributes = [];
            for (let i = 0; i < count; ++i) {
                attributes.push(this.parser.readIntLine());
            }
            return attributes;
        }
        return undefined;
    }
}