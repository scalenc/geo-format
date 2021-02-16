import { ArcSegment } from '../model/ArcSegment';
import { ArrowElement } from '../model/ArrowElement';
import { Bending } from '../model/Bending';
import { CircleElement } from '../model/CircleElement';
import { Contour, ContourType } from '../model/Contour';
import { Element, ElementColor, ElementType } from '../model/Element';
import { GeoFile } from '../model/GeoFile';
import { LineSegment } from '../model/LineSegment';
import { Matrix } from '../model/Matrix';
import { Part } from '../model/Part';
import { PartCopy } from '../model/PartCopy';
import { PointElement } from '../model/PointElement';
import { QuadElement } from '../model/QuadElement';
import { TextAlignment, TextElement } from '../model/TextElement';
import { Vector } from '../model/Vector';

interface IPart {
  points: { [key: number]: Vector };
}

const COLORS = ['aliceblue', 'black', 'red', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'plum', 'brown', 'lightgrey'];
const DASHES = ['', '10,10', '5,5', '10,10,5,10', '10,10,5,5,5,10', '15,10', '10,10', '10,10,5,10', ''];
type ElementWriter = (part: IPart, element: Element) => string;
type FragmentWriter = (part: IPart, element: Element, withStart: boolean) => string;
export class SvgWriter {
  private elementWriters: { [key: string]: ElementWriter } = {
    [ElementType.POINT]: <ElementWriter>SvgWriter.writePoint,
    [ElementType.LINE]: <ElementWriter>this.writeLine.bind(this),
    [ElementType.CIRCLE]: <ElementWriter>this.writeCircle.bind(this),
    [ElementType.ARC]: <ElementWriter>this.writeArc.bind(this),
    [ElementType.CONSTRUCTION_LINE]: <ElementWriter>this.writeConstructionLine.bind(this),
    [ElementType.CONSTRUCTION_CIRCLE]: <ElementWriter>this.writeConstructionCircle.bind(this),
    [ElementType.CHAMFER]: <ElementWriter>this.writeLine.bind(this),
    [ElementType.ROUNDING]: <ElementWriter>this.writeArc.bind(this),
    [ElementType.ARROW]: <ElementWriter>this.writeArrow.bind(this),
    [ElementType.QUAD]: <ElementWriter>this.writeQuad.bind(this),
    [ElementType.TEXT]: <ElementWriter>this.writeText.bind(this),
  };
  private elementPathFragmentWriters: { [key: string]: FragmentWriter } = {
    [ElementType.LINE]: <FragmentWriter>this.writeLineFragment.bind(this),
    [ElementType.CIRCLE]: <FragmentWriter>this.writeCircleFragment.bind(this),
    [ElementType.ARC]: <FragmentWriter>this.writeArcFragment.bind(this),
    [ElementType.CHAMFER]: <FragmentWriter>this.writeLineFragment.bind(this),
    [ElementType.ROUNDING]: <FragmentWriter>this.writeArcFragment.bind(this),
    [ElementType.QUAD]: <FragmentWriter>this.writeQuadFragment.bind(this),
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
    const nonPathElements: Element[] = [];
    const contourFragments = contours.map((c) => this.writeContourFragment(part, c, nonPathElements));
    const path = contourFragments.length ? `<path fill="white" stroke="${COLORS[ElementColor.WHITE]}" d="${contourFragments.join(' ')}" />` : '';
    return `${path}${this.writeElements(part, nonPathElements)}`;
  }

  private writeContourFragment(part: IPart, contour: Contour, nonPathElements: Element[]) {
    const pathElements: Element[] = [];
    contour.segments.forEach((e: Element) => (this.elementPathFragmentWriters[e.type] ? pathElements : nonPathElements).push(e));
    const path = pathElements.map((e, i) => this.elementPathFragmentWriters[e.type](part, <ArcSegment & LineSegment>e, i == 0)).join(' ');
    return `${path}${path.length && contour.type === ContourType.CLOSED ? ' Z' : ''}`;
  }

  private writeElements(part: IPart, elements: Element[]) {
    return elements.map((e) => this.writeElement(part, e)).join('');
  }

  private writeElement(part: IPart, element: Element) {
    const writer = this.elementWriters[element.type];
    return writer(part, element);
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
    return `<path ${this.writeStroke(element)} d="${this.writeLineFragment(part, element)}" />`;
  }

  private writeLineFragment(part: IPart, element: LineSegment, withStart = true) {
    const p1 = part.points[element.startPointIndex];
    const p2 = part.points[element.endPointIndex];
    return withStart ? `M${p1.x} ${-p1.y} L${p2.x} ${-p2.y}` : `L${p2.x} ${-p2.y}`;
  }

  private writeCircle(part: IPart, element: CircleElement) {
    const p = part.points[element.centerPointIndex];
    return `<circle ${this.writeStroke(element)} cx="${p.x}" cy="${-p.y}" r="${element.radius}" />`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private writeCircleFragment(part: IPart, element: CircleElement, _withStart = true) {
    const r = element.radius;
    const c = part.points[element.centerPointIndex];
    const p1 = { x: c.x + r, y: c.y };
    const p2 = { x: c.x - r, y: c.y };
    return `M${p1.x} ${-p1.y} A${r} ${r} 0 1 0 ${p2.x} ${-p2.y} A${r} ${r} 0 1 0 ${p1.x} ${-p1.y}`;
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
    return `<path ${this.writeStroke(element)} d="${this.writeArcFragment(part, element)}" />`;
  }

  private writeArcFragment(part: IPart, element: ArcSegment, withStart = true) {
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
    return withStart ? `M${p1.x} ${-p1.y} A${r} ${r} 0 ${large} ${sweep} ${p2.x} ${-p2.y}` : `A${r} ${r} 0 ${large} ${sweep} ${p2.x} ${-p2.y}`;
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
    return `<path ${this.writeStroke(element)} d="${this.writeQuadFragment(part, element)} Z" />`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private writeQuadFragment(part: IPart, element: QuadElement, _withStart = true) {
    const p1 = part.points[element.cornerPoint1Index];
    const p2 = part.points[element.cornerPoint2Index];
    const p3 = part.points[element.cornerPoint3Index];
    const p4 = part.points[element.cornerPoint4Index];
    return `M${p1.x} ${-p1.y} L${p2.x} ${-p2.y} L${p3.x} ${-p3.y} L${p4.x} ${-p4.y}`;
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