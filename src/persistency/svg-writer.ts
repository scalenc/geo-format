import { ArcSegment } from '../model/arc-segment';
import { ArrowElement } from '../model/arrow-element';
import { Bending } from '../model/bending';
import { CircleElement } from '../model/circle-element';
import { Contour } from '../model/contour';
import { Element, ElementType } from '../model/element';
import { GeoFile } from '../model/geo-file';
import { LineSegment } from '../model/line-segment';
import { Matrix } from '../model/matrix';
import { Part } from '../model/part';
import { PartCopy } from '../model/part-copy';
import { PointElement } from '../model/point-element';
import { QuadElement } from '../model/quad-element';
import { TextAlignment, TextElement } from '../model/text-element';
import { Vector } from '../model/vector';

interface IPart {
  points: { [key: number]: Vector };
}

const COLORS = ['aliceblue', 'black', 'red', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'plum', 'brown', 'lightgrey'];
const DASHES = ['', '10,10', '5,5', '10,10,5,10', '10,10,5,5,5,10', '15,10', '10,10', '10,10,5,10', ''];

export class SvgWriter {
  private elementWriters = {
    [ElementType.POINT]: SvgWriter.writePoint,
    [ElementType.LINE]: this.writeLine.bind(this),
    [ElementType.CIRCLE]: this.writeCircle.bind(this),
    [ElementType.ARC]: this.writeArc.bind(this),
    [ElementType.CONSTRUCTION_LINE]: this.writeConstructionLine.bind(this),
    [ElementType.CONSTRUCTION_CIRCLE]: this.writeConstructionCircle.bind(this),
    [ElementType.CHAMFER]: this.writeLine.bind(this),
    [ElementType.ROUNDING]: this.writeArc.bind(this),
    [ElementType.ARROW]: this.writeArrow.bind(this),
    [ElementType.QUAD]: this.writeQuad.bind(this),
    [ElementType.TEXT]: this.writeText.bind(this),
  };

  public toSvg(file: GeoFile): string {
    const { min, max } = file.header;
    const pointSymbol = '<symbol id="point" viewport="-2 -2 2 2"><path d="M-2 0 H2 M0 -2 V2 M-1.5 -1.5 L1.5 1.5 M-1.5 1.5 L1.5 -1.5" /></symbol>';
    const viewPort = `viewBox="${min.x} ${-max.y} ${max.x - min.x} ${max.y - min.y}"`;
    const globalGroup = '<g stroke="#000000" stroke-width="1%" fill="none">';
    const parts = file.parts.map((p) => this.writePart(p)).join('');
    return `<svg ${viewPort} xmlns="http://www.w3.org/2000/svg">${globalGroup}${pointSymbol}${parts}</g></svg>`;
  }

  private writePart(part: Part) {
    const elements = this.writeElements(part, part.elements);
    const contours = this.writeContours(part, part.contours);
    const bendings = this.writeBendings(part, part.bendings);
    const copies = part.copies.map((copy) => this.writePartCopy(part, copy)).join('');
    return `<g id="${part.name}">${elements}${contours}${bendings}</g>${copies}`;
  }

  private writeContours(part: IPart, contours: Contour[]) {
    return contours.map((c) => this.writeContour(part, c)).join('');
  }

  private writeContour(part: IPart, contour: Contour) {
    return this.writeElements(part, contour.segments);
  }

  private writeElements(part: IPart, elements: Element[]) {
    return elements.map((e) => this.writeElement(part, e)).join('');
  }

  private writeElement(part: IPart, element: Element) {
    const writer = this.elementWriters[element.type];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return writer(part, element as any);
  }

  private writeBendings(part: IPart, elements: Bending[]) {
    return elements.map((b) => this.writeBending(part, b)).join('');
  }

  private writeBending(part: IPart, bending: Bending) {
    return this.writeElements(part, bending.bendingLines);
  }

  private static writePoint(part: IPart, element: PointElement) {
    const p = part.points[element.pointIndex];
    return `<use id="point" x="${p.x}" y="${-p.y}" />`;
  }

  private writeLine(part: IPart, element: LineSegment) {
    const p1 = part.points[element.startPointIndex];
    const p2 = part.points[element.endPointIndex];
    return `<path ${this.writeStroke(element)} d="M${p1.x} ${-p1.y} L${p2.x} ${-p2.y}" />`;
  }

  private writeCircle(part: IPart, element: CircleElement) {
    const p = part.points[element.centerPointIndex];
    return `<circle ${this.writeStroke(element)} cx="${p.x}" cy="${-p.y}" r="${element.radius}" />`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private writeConstructionLine(_part: IPart, _element: Element) {
    return ''; // Do not output construction geometries.
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private writeConstructionCircle(_part: IPart, _element: Element) {
    return ''; // Do not output construction geometries.
  }

  private writeArc(part: IPart, element: ArcSegment) {
    const pc = part.points[element.centerPointIndex];
    const p1 = part.points[element.startPointIndex];
    const p2 = part.points[element.endPointIndex];
    const dx1 = p1.x - pc.x;
    const dy1 = p1.y - pc.y;
    const r = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    let spanAngle = element.orientation * (Math.atan2(p2.y - pc.y, p2.x - pc.x) - Math.atan2(dy1, dx1));
    if (spanAngle < 0) {
      spanAngle += 2 * Math.PI;
    }
    const large = spanAngle >= Math.PI ? 1 : 0;
    const sweep = element.orientation < 0 ? 1 : 0;
    return `<path ${this.writeStroke(element)} d="M${p1.x} ${-p1.y} A${r} ${r} 0 ${large} ${sweep} ${p2.x} ${-p2.y}" />`;
  }

  private writeArrow(part: IPart, element: ArrowElement) {
    const p1 = part.points[element.startPointIndex];
    const p2 = part.points[element.endPointIndex];
    const absDx = p2.x - p1.x;
    const absDy = p2.y - p1.y;
    const len = Math.sqrt(absDx * absDx + absDy * absDy);
    const dx = absDx / len;
    const dy = absDy / len;
    const p3 = { x: p2.x - dx * element.tipLength, y: p2.y - dy * element.tipLength };
    const p4 = { x: p3.x + dy * element.tipWidth, y: p3.y - dx * element.tipWidth };
    const p5 = { x: p3.x - dy * element.tipWidth, y: p3.y + dx * element.tipWidth };
    return `<path ${this.writeStroke(element)} d="M${p1.x} ${-p1.y} L${p3.x} ${-p3.y} L${p4.x} ${-p4.y} L${p2.x} ${-p2.y} L${p5.x} ${-p5.y} L${
      p3.x
    } ${-p3.y}" />`;
  }

  private writeQuad(part: IPart, element: QuadElement) {
    const p1 = part.points[element.cornerPoint1Index];
    const p2 = part.points[element.cornerPoint2Index];
    const p3 = part.points[element.cornerPoint3Index];
    const p4 = part.points[element.cornerPoint4Index];
    return `<path ${this.writeStroke(element)} d="M${p1.x} ${-p1.y} L${p2.x} ${-p2.y} L${p3.x} ${-p3.y} L${p4.x} ${-p4.y} Z" />`;
  }

  private writeText(part: IPart, element: TextElement) {
    const p1 = part.points[element.startPointIndex];
    const size = element.charHeight;
    const anchor =
      element.textAlignment & TextAlignment.HORIZONTAL_CENTER ? 'middle' : element.textAlignment & TextAlignment.HORIZONTAL_RIGHT ? 'end' : 'start';
    const baseline = element.textAlignment & TextAlignment.VERTICAL_CENTER ? 'middle' : element.textAlignment & TextAlignment.VERTICAL_TOP ? 'hanging' : 'auto';
    const text = element.text.join('\n');
    return `<text x="${
      p1.x
    }" y="${-p1.y}" text-anchor="${anchor}" dominant-baseline="${baseline}" font-size="${size}" font-family="serif"><![CDATA[${text}]]></text>`;
  }

  private writePartCopy(part: Part, copy: PartCopy) {
    return `<use href="#${part.name}" transform="${this.writeTransform(copy.transformation)}" />`;
  }

  private writeTransform(matrix: Matrix) {
    const m = matrix.values;
    return `matrix(${m[0][0]}, ${-m[1][0]}, ${-m[0][1]}, ${m[1][1]}, ${m[3][0]}, ${-m[3][1]})`; // FIXME correct?
  }

  private writeStroke(element: Element) {
    return element.color < 0 || element.color >= COLORS.length
      ? 'fill="none"'
      : element.stroke <= 0 || element.stroke >= DASHES.length - 1
      ? `fill="none" stroke="${COLORS[element.color]}"`
      : `fill="none" stroke="${COLORS[element.color]}" stroke-dasharray="${DASHES[element.stroke]}"`;
  }
}
