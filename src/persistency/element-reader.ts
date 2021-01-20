import { Parser } from "./parser";
import * as constants from './constants';
import { Element, ElementType } from "../model/element";
import { LineSegment } from "../model/line-segment";
import { CircleElement } from "../model/circle-element";
import { ArcSegment } from "../model/arc-segment";
import { PointElement } from "../model/point-element";
import { ConstructionLineElement } from "../model/construction-line-element";
import { ConstructionCircleElement } from "../model/construction-circle-element";
import { ArrowElement } from "../model/arrow-element";
import { QuadElement } from "../model/quad-element";
import { TextElement } from "../model/text-element";

export class ElementReader {
    private elementReaders = {
        [ElementType.LINE]: this.readLine.bind(this),
        [ElementType.CIRCLE]: this.readCircle.bind(this),
        [ElementType.ARC]: this.readArc.bind(this),
        [ElementType.ROUNDING]: this.readRounding.bind(this),
        [ElementType.POINT]: this.readPoint.bind(this),
        [ElementType.CONSTRUCTION_LINE]: this.readConstructionLine.bind(this),
        [ElementType.CONSTRUCTION_CIRCLE]: this.readConstructionCircle.bind(this),
        [ElementType.CHAMFER]: this.readChamfer.bind(this),
        [ElementType.ARROW]: this.readArrow.bind(this),
        [ElementType.QUAD]: this.readQuad.bind(this),
        [ElementType.TEXT]: this.readText.bind(this),
    }

    constructor(private parser: Parser) {
    }

    public readList(): Element[] {
        var elements = [];
        while (!this.parser.isSectionChar) {
            elements.push(this.read());
        }
        this.parser.readExpectedSectionEndLine(constants.PART_ELEMENT_SECTION_END);
        return elements;
    }

    public read(): Element {
        const elementCommons = this.readCommons();
        const reader = this.elementReaders[elementCommons.type];
        this.parser.assert(reader, `Unknown element type "${elementCommons.type}"`);

        const element = reader(elementCommons) as Element;
        element.attributes = this.readAttributes();
        this.parser.readExpectedTokenLine(constants.PART_ELEMENT_END, 'element end');
        return element;
    }

    private readCommons(): Element {
        var type = this.parser.readTokenLine() as ElementType;
        const color = this.parser.readInt();
        this.parser.skipWhiteSpace();
        const stroke = this.parser.readIntLine();
        return { type, color, stroke };
    }

    private readLine(elementCommons: Element): LineSegment {
        const startPointIndex = this.parser.readInt();
        this.parser.skipWhiteSpace();
        const endPointIndex = this.parser.readIntLine();
        return { ...elementCommons, startPointIndex, endPointIndex, isChamfer: false };
    }

    private readCircle(elementCommons: Element): CircleElement {
        const centerPointIndex = this.parser.readIntLine();
        const radius = this.parser.readDoubleLine();
        return { ...elementCommons, centerPointIndex, radius };
    }

    private readArc(elementCommons: Element): ArcSegment {
        const centerPointIndex = this.parser.readInt();
        this.parser.skipWhiteSpace();
        const startPointIndex = this.parser.readInt();
        this.parser.skipWhiteSpace();
        const endPointIndex = this.parser.readIntLine();
        const orientation = this.parser.readIntLine();
        return { ...elementCommons, centerPointIndex, startPointIndex, endPointIndex, orientation, isRounding: false };
    }

    private readRounding(elementCommons: Element): ArcSegment {
        const e = this.readArc(elementCommons);
        e.isRounding = true;
        return e;
    }

    private readPoint(elementCommons: Element): PointElement {
        const pointIndex = this.parser.readIntLine();
        return { ...elementCommons, pointIndex };
    }

    private readConstructionLine(elementCommons: Element): ConstructionLineElement {
        const pointIndex = this.parser.readIntLine();
        var v = this.parser.readVectorLine();
        const xSlope = v.x;
        const ySlope = v.y;
        const offset = v.z;
        return { ...elementCommons, pointIndex, xSlope, ySlope, offset };
    }

    private readConstructionCircle(elementCommons: Element): ConstructionCircleElement {
        const centerPointIndex = this.parser.readIntLine();
        const radius = this.parser.readDoubleLine();
        return { ...elementCommons, centerPointIndex, radius };
    }

    private readChamfer(elementCommons: Element): LineSegment {
        const e = this.readLine(elementCommons);
        e.isChamfer = true;
        return e;
    }

    private readArrow(elementCommons: Element): ArrowElement {
        const startPointIndex = this.parser.readInt();
        this.parser.skipWhiteSpace();
        const endPointIndex = this.parser.readIntLine();

        const tipLength = this.parser.readDouble();
        this.parser.skipWhiteSpace();
        const tipWidth = this.parser.readDoubleLine();

        return { ...elementCommons, startPointIndex, endPointIndex, tipLength, tipWidth };
    }

    private readQuad(elementCommons: Element): QuadElement {
        const cornerPoint1Index = this.parser.readInt();
        this.parser.skipWhiteSpace();
        const cornerPoint2Index = this.parser.readInt();
        this.parser.skipWhiteSpace();
        const cornerPoint3Index = this.parser.readInt();
        this.parser.skipWhiteSpace();
        const cornerPoint4Index = this.parser.readIntLine();

        const fill = this.parser.readInt();
        this.parser.skipWhiteSpace();
        const fillColor = this.parser.readIntLine();

        return { ...elementCommons, cornerPoint1Index, cornerPoint2Index, cornerPoint3Index, cornerPoint4Index, fill, fillColor };
    }

    private readText(elementCommons: Element): TextElement {
        const startPointIndex = this.parser.readIntLine();

        const charHeight = this.parser.readDouble();
        this.parser.skipWhiteSpace();
        const charRatio = this.parser.readDouble();
        this.parser.skipWhiteSpace();
        const charAngle = this.parser.readDoubleLine();

        const lineSeparation = this.parser.readDouble();
        this.parser.skipWhiteSpace();;
        const textAngle = this.parser.readDoubleLine();

        const textAlignment = this.parser.readInt();
        this.parser.skipWhiteSpace();;
        const textOrientation = this.parser.readInt();
        this.parser.skipWhiteSpace();

        var count = this.parser.readIntLine();
        const text = [];
        for (let i = 0; i < count; ++i) {
            text.push(this.parser.readTextLine());
        }

        return { ...elementCommons, startPointIndex, charHeight, charRatio, charAngle, lineSeparation, textAngle, textAlignment, textOrientation, text };
    }

    private readAttributes(): number[] | undefined {
        if (this.parser.isElementEndChar) {
            return undefined;
        }

        var count = this.parser.readIntLine();
        const attributes = [];
        for (let i = 0; i < count; ++i) {
            attributes.push(this.parser.readIntLine());
        }
        return attributes;
    }

}
