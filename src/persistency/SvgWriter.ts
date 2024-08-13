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

export interface GeoOptions {
  /// Stroke width (overwritten by targetStrokeWidth).
  strokeWidth?: number | string;
  /// Paddings around the part in the viewBox (might be adjusted when targetStrokeWidth is specified).
  padding?: number;
  /// Target stroke width scaled to the target dimensions given by targetWidth and targetHeight.
  targetStrokeWidth?: number;
  targetWidth?: number;
  targetHeight?: number;
  /// Prepends raw svg content into the part's definition tag.
  prependPart?: string | ((part: Part) => string | undefined);
  /// Appends raw svg content into the part's definition tag.
  appendPart?: string | ((part: Part) => string | undefined);
}

type GeoDefOptions = Pick<GeoOptions, 'prependPart' | 'appendPart'>;

interface IPart {
  points: { [key: number]: Vector };
}

const DASHES = ['', '10,10', '5,5', '10,10,5,10', '10,10,5,5,5,10', '15,10', '10,10', '10,10,5,10', ''];
type ElementWriter = (part: IPart, element: Element) => string;
type FragmentWriter = (part: IPart, element: Element, withStart: boolean) => string;
const POINT_SYMBOL_ID = 'point';
const POINT_SYMBOL_DEF = '<symbol id="point" viewport="-2 -2 2 2"><path d="M-2 0 H2 M0 -2 V2 M-1.5 -1.5 L1.5 1.5 M-1.5 1.5 L1.5 -1.5" /></symbol>';

export class SvgWriter {
  private readonly colorPallet = ['white', 'black', 'red', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'plum', 'brown', 'lightgrey'];

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

  public toSvg(file: GeoFile, options?: GeoOptions): string {
    const { min, max } = file.header;
    const svgWidth = max.x - min.x;
    const svgHeight = max.y - min.y;
    const targetWidth = options?.targetWidth ?? (svgHeight ? (svgWidth * (options?.targetHeight ?? svgHeight)) / svgHeight : svgWidth);
    const targetHeight = options?.targetHeight ?? (svgWidth ? (svgHeight * (options?.targetWidth ?? svgWidth)) / svgWidth : svgHeight);
    let svgStrokeWidth = options?.strokeWidth ?? '0.1%';
    let padding = options?.padding ?? 0;
    if (options?.targetStrokeWidth) {
      const effectiveStrokeWidth = options.targetStrokeWidth * Math.max(svgWidth / targetWidth, svgHeight / targetHeight);
      padding = Math.max(padding, effectiveStrokeWidth / 2);
      svgStrokeWidth = `${effectiveStrokeWidth}px`;
    }
    const viewPort = `viewBox="${min.x - padding} ${-max.y - padding} ${svgWidth + padding * 2} ${svgHeight + padding * 2}"`;
    const dimensions = options?.targetWidth || options?.targetHeight ? ` width="${targetWidth}" height="${targetHeight}"` : '';
    const globalGroup = `<g stroke="${this.colorPallet[ElementColor.WHITE]}" stroke-width="${svgStrokeWidth}" fill="none">`;
    const parts = file.parts.map((p, i) => ({ ...p, name: `${p.name || 'part'}:${i + 1}` }));
    const { symbolDefs, partDefs } = this.getDefs({ parts }, options);
    const defs = `<defs>${Object.values(symbolDefs).join('')}${Object.values(partDefs).join('')}</defs>`;
    const partPos = parts.map((p) => this.writePartAndCopies(p)).join('');
    return `<svg ${viewPort}${dimensions} xmlns="http://www.w3.org/2000/svg">${defs}${globalGroup}${partPos}</g></svg>`;
  }

  public getDefs(file: Pick<GeoFile, 'parts'>, options?: GeoDefOptions): { symbolDefs: Record<string, string>; partDefs: Record<string, string> } {
    return {
      symbolDefs: { [POINT_SYMBOL_ID]: POINT_SYMBOL_DEF },
      partDefs: Object.fromEntries(
        file.parts.map((p, i) => [p.name || `part:${i + 1}`, this.writePartDef(p.name ? p : { ...p, name: `part:${i + 1}` }, options)])
      ),
    };
  }

  /**
   *
   BLACK = 0 (background color),
   WHITE = 1 (stroke color),
   RED = 2,
   YELLOW = 3,
   GREEN = 4,
   CYAN = 5,
   BLUE = 6,
   MAGENTA = 7,
   HIGHLIGHT_1 = 8,
   HIGHLIGHT_2 = 9,
   LIGHT_GREY = 10,
   * @param colorPalette
   */
  public setColors(colorPalette: Array<string>): void {
    Object.keys(colorPalette).forEach((colorKey) => {
      this.colorPallet[+colorKey] = colorPalette[+colorKey];
    });
  }

  private writePartDef(part: Part, options?: GeoDefOptions) {
    const prepend = (typeof options?.prependPart === 'function' ? options.prependPart(part) : options?.prependPart) ?? '';
    const append = (typeof options?.appendPart === 'function' ? options.appendPart(part) : options?.appendPart) ?? '';
    const elements = this.writeElements(part, part.elements);
    const contours = this.writeContours(part, part.contours);
    const bendings = this.writeBendings(part, part.bendings);
    return `<g id="${part.name}">${prepend}${contours}${elements}${bendings}${append}</g>`;
  }

  private writePartAndCopies(part: Part) {
    const transform = SvgWriter.is2dIdentityTransform(part.transformation) ? '' : ` transform="${this.writeTransform(part.transformation)}"`;
    const copies = part.copies.map((copy) => this.writePartCopy(part, copy)).join('');
    return `<use href="#${part.name}"${transform} />${copies}`;
  }

  private writeContours(part: IPart, contours: Contour[]) {
    const nonPathElements: Element[] = [];
    const contourFragments = contours.map((c) => this.writeContourFragment(part, c, nonPathElements));
    const path = contourFragments.length
      ? `<path fill="${this.colorPallet[ElementColor.BLACK]}" stroke="${this.colorPallet[ElementColor.WHITE]}" d="${contourFragments.join(' ')}" />`
      : '';
    const elements = this.writeElements(part, nonPathElements);
    const offsetSegments = this.writeElements(
      part,
      contours.flatMap((c) => c.offsetSegments)
    );
    return `${path}${elements}${offsetSegments}`;
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
    return `<use id="#${POINT_SYMBOL_ID}" x="${p.x}" y="${-p.y}" />`;
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
    const color = `fill="${this.colorPallet[element.color]}" stroke="none"`;

    const charAngle = element.charAngle ? `rotate="${element.charAngle}""` : '';
    const font = `font-size="${size}" font-family="serif"${charAngle}`;

    const transform = element.textAngle ? ` transform="rotate(${element.textAngle} ${p1.x} ${-p1.y})"` : '';
    const placement = `x="${p1.x}" y="${-p1.y}"${transform} text-anchor="${anchor}" dominant-baseline="${baseline}"`;

    return `<text ${placement} ${color} ${font}><![CDATA[${text}]]></text>`;
  }

  private writePartCopy(part: Part, copy: PartCopy) {
    return `<use href="#${part.name}" transform="${this.writeTransform(copy.transformation)}" />`;
  }

  private static is2dIdentityTransform(matrix: Matrix): boolean {
    const m = matrix.values;
    return m[0][0] === 1 && m[1][0] === 0 && m[0][1] === 0 && m[1][1] === 1 && m[3][0] === 0 && m[3][1] === 0;
  }

  private writeTransform(matrix: Matrix) {
    const m = matrix.values;
    return `matrix(${m[0][0]}, ${m[1][0]}, ${m[0][1]}, ${m[1][1]}, ${m[3][0]}, ${-m[3][1]})`;
  }

  private writeStroke(element: Element) {
    return element.color < 0 || element.color >= this.colorPallet.length
      ? 'fill="none"'
      : element.stroke <= 0 || element.stroke >= DASHES.length - 1
      ? `fill="none" stroke="${this.colorPallet[element.color]}"`
      : `fill="none" stroke="${this.colorPallet[element.color]}" stroke-dasharray="${DASHES[element.stroke]}"`;
  }
}
