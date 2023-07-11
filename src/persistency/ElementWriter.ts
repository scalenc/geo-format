import { ArcSegment } from '../model/ArcSegment';
import { ArrowElement } from '../model/ArrowElement';
import { CircleElement } from '../model/CircleElement';
import { ConstructionCircleElement } from '../model/ConstructionCircleElement';
import { ConstructionLineElement } from '../model/ConstructionLineElement';
import { Element, ElementType } from '../model/Element';
import { LineSegment } from '../model/LineSegment';
import { PointElement } from '../model/PointElement';
import { QuadElement } from '../model/QuadElement';
import { TextElement } from '../model/TextElement';
import { Writer } from './Writer';
import { PART_ELEMENT_END, SECTION_END } from './constants';

type ElementWriterFunction = (element: Element) => void;

export class ElementWriter {
  private readonly ELEMENT_WRITERS: Record<ElementType, ElementWriterFunction> = {
    [ElementType.POINT]: this.onPoint.bind(this) as ElementWriterFunction,
    [ElementType.LINE]: this.onLine.bind(this) as ElementWriterFunction,
    [ElementType.CIRCLE]: this.onCircle.bind(this) as ElementWriterFunction,
    [ElementType.ARC]: this.onArc.bind(this) as ElementWriterFunction,
    [ElementType.CONSTRUCTION_LINE]: this.onConstructionLine.bind(this) as ElementWriterFunction,
    [ElementType.CONSTRUCTION_CIRCLE]: this.onConstructionCircle.bind(this) as ElementWriterFunction,
    [ElementType.CHAMFER]: this.onLine.bind(this) as ElementWriterFunction,
    [ElementType.ROUNDING]: this.onArc.bind(this) as ElementWriterFunction,
    [ElementType.ARROW]: this.onArrow.bind(this) as ElementWriterFunction,
    [ElementType.QUAD]: this.onQuad.bind(this) as ElementWriterFunction,
    [ElementType.TEXT]: this.onText.bind(this) as ElementWriterFunction,
  };

  constructor(private writer: Writer, private pointIndexMap: Record<number, number>) {}

  writeList(sectionName: string, segments: Element[]): void {
    this.writer.writeSectionLine(sectionName);
    segments.forEach((segment) => this.write(segment));
    this.writer.writeTokenLine(SECTION_END);
  }

  write(element: Element): void {
    const elementWriter = this.ELEMENT_WRITERS[element.type];
    if (!elementWriter) throw new Error(`Unknown element type ${element.type}`);
    elementWriter(element);
    this.writeAttributes(element);
    this.writer.writeTokenLine(PART_ELEMENT_END);
  }

  private onArc(arc: ArcSegment) {
    this.writer.writeTokenLine(arc.isRounding ? ElementType.ROUNDING : ElementType.ARC, arc.id);
    this.writeColorAndStroke(arc);
    const centerPointIndex = this.pointIndexMap[arc.centerPointIndex];
    const startPointIndex = this.pointIndexMap[arc.startPointIndex];
    const endPointIndex = this.pointIndexMap[arc.endPointIndex];
    this.writer.writeIntListLine([centerPointIndex, startPointIndex, endPointIndex]);
    this.writer.writeIntLine(arc.orientation);
  }

  private onArrow(arrow: ArrowElement) {
    this.writer.writeTokenLine(ElementType.ARROW, arrow.id);
    this.writeColorAndStroke(arrow);
    const startPointIndex = this.pointIndexMap[arrow.startPointIndex];
    const endPointIndex = this.pointIndexMap[arrow.endPointIndex];
    this.writer.writeIntListLine([startPointIndex, endPointIndex]);
    this.writer.writeDoubleListLine([arrow.tipLength, arrow.tipWidth]);
  }

  private onCircle(circle: CircleElement) {
    this.writer.writeTokenLine(ElementType.CIRCLE, circle.id);
    this.writeColorAndStroke(circle);
    const centerPointIndex = this.pointIndexMap[circle.centerPointIndex];
    this.writer.writeIntLine(centerPointIndex);
    this.writer.writeDoubleLine(circle.radius);
  }

  private onConstructionCircle(circle: ConstructionCircleElement) {
    this.writer.writeTokenLine(ElementType.CONSTRUCTION_CIRCLE, circle.id);
    this.writeColorAndStroke(circle);
    const centerPointIndex = this.pointIndexMap[circle.centerPointIndex];
    this.writer.writeIntLine(centerPointIndex);
    this.writer.writeDoubleLine(circle.radius);
  }

  private onConstructionLine(line: ConstructionLineElement) {
    this.writer.writeTokenLine(ElementType.CONSTRUCTION_LINE, line.id);
    this.writeColorAndStroke(line);
    const pointIndex = this.pointIndexMap[line.pointIndex];
    this.writer.writeIntLine(pointIndex);
    this.writer.writeDoubleListLine([line.xSlope, line.ySlope, line.offset]);
  }

  private onLine(line: LineSegment) {
    this.writer.writeTokenLine(line.isChamfer ? ElementType.CHAMFER : ElementType.LINE, line.id);
    this.writeColorAndStroke(line);
    const startPointIndex = this.pointIndexMap[line.startPointIndex];
    const endPointIndex = this.pointIndexMap[line.endPointIndex];
    this.writer.writeIntListLine([startPointIndex, endPointIndex]);
  }

  private onPoint(point: PointElement) {
    this.writer.writeTokenLine(ElementType.POINT, point.id);
    this.writeColorAndStroke(point);
    const pointIndex = this.pointIndexMap[point.pointIndex];
    this.writer.writeIntLine(pointIndex);
  }

  private onQuad(quad: QuadElement) {
    this.writer.writeTokenLine(ElementType.QUAD, quad.id);
    this.writeColorAndStroke(quad);
    const point1Index = this.pointIndexMap[quad.cornerPoint1Index];
    const point2Index = this.pointIndexMap[quad.cornerPoint2Index];
    const point3Index = this.pointIndexMap[quad.cornerPoint3Index];
    const point4Index = this.pointIndexMap[quad.cornerPoint4Index];
    this.writer.writeIntListLine([point1Index, point2Index, point3Index, point4Index]);
    this.writer.writeIntListLine([quad.fill, quad.fillColor]);
  }

  private onText(text: TextElement) {
    this.writer.writeTokenLine(ElementType.TEXT, text.id);
    this.writeColorAndStroke(text);
    const startPointIndex = this.pointIndexMap[text.startPointIndex];
    this.writer.writeIntLine(startPointIndex);
    this.writer.writeDoubleListLine([text.charHeight, text.charRatio, text.charAngle]);
    this.writer.writeDoubleListLine([text.lineSeparation, text.textAngle]);
    this.writer.writeIntListLine([text.textAlignment, text.textOrientation, text.text.length]);
    text.text.forEach((line) => this.writer.writeTextLine(line));
  }

  private writeColorAndStroke(element: Element) {
    this.writer.writeIntListLine([element.color, element.stroke]);
  }

  private writeAttributes(element: Element) {
    if (element.attributes?.length) {
      this.writer.writeIntLine(element.attributes.length);
      element.attributes.forEach((attributeIndex) => this.writer.writeIntLine(attributeIndex));
    }
  }
}
