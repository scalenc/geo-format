import { expect } from 'chai';
import { ArcSegment } from '../src/model/ArcSegment';
import { ArrowElement } from '../src/model/ArrowElement';
import { CircleElement } from '../src/model/CircleElement';
import { ConstructionCircleElement } from '../src/model/ConstructionCircleElement';
import { ConstructionLineElement } from '../src/model/ConstructionLineElement';
import { LineSegment } from '../src/model/LineSegment';
import { PointElement } from '../src/model/PointElement';
import { QuadElement } from '../src/model/QuadElement';
import { TextElement } from '../src/model/TextElement';
import { ElementReader } from '../src/persistency/ElementReader';
import { Parser } from '../src/persistency/Parser';

describe('test ElementReader', () => {
  [{ text: 'UNKNOWN\n1 0\n2 1\n3\n1\n2\n3\n|~\n...', throws: /Unknown element type/ }].forEach((test) => {
    it(`should throw on read for ${JSON.stringify(test.text)}`, () => {
      const reader = new ElementReader(new Parser(test.text));
      expect(() => reader.read()).throws(test.throws);
    });
  });

  [
    /* tslint:disable */
    {
      text: 'LIN\n1 0\n2 1\n|~\n...',
      expect: { type: 'LIN', color: 1, stroke: 0, startPointIndex: 2, endPointIndex: 1, isChamfer: false, attributes: undefined } as LineSegment,
    },
    {
      text: 'CHA\n1 0\n2 1\n|~\n...',
      expect: { type: 'CHA', color: 1, stroke: 0, startPointIndex: 2, endPointIndex: 1, isChamfer: true, attributes: undefined } as LineSegment,
    },
    {
      text: 'ARC\n1 0\n13 14 15\n1\n|~\n...',
      expect: {
        type: 'ARC',
        color: 1,
        stroke: 0,
        centerPointIndex: 13,
        startPointIndex: 14,
        endPointIndex: 15,
        orientation: 1,
        isRounding: false,
        attributes: undefined,
      } as ArcSegment,
    },
    {
      text: 'FIL\n1 0\n13 14 15\n1\n|~\n...',
      expect: {
        type: 'FIL',
        color: 1,
        stroke: 0,
        centerPointIndex: 13,
        startPointIndex: 14,
        endPointIndex: 15,
        orientation: 1,
        isRounding: true,
        attributes: undefined,
      } as ArcSegment,
    },
    {
      text: 'CIR\n1 0\n13\n0.123\n|~\n...',
      expect: { type: 'CIR', color: 1, stroke: 0, centerPointIndex: 13, radius: 0.123, attributes: undefined } as CircleElement,
    },
    {
      text: 'CCIR\n1 0\n13\n0.123\n|~\n...',
      expect: { type: 'CCIR', color: 1, stroke: 0, centerPointIndex: 13, radius: 0.123, attributes: undefined } as ConstructionCircleElement,
    },
    { text: 'PKT\n1 0\n13\n|~\n...', expect: { type: 'PKT', color: 1, stroke: 0, pointIndex: 13, attributes: undefined } as PointElement },
    {
      text: 'CLIN\n1 0\n13\n0.1 0.2 0.3\n|~\n...',
      expect: { type: 'CLIN', color: 1, stroke: 0, pointIndex: 13, xSlope: 0.1, ySlope: 0.2, offset: 0.3, attributes: undefined } as ConstructionLineElement,
    },
    {
      text: 'LED\n1 0\n13 14\n1.0 2.3\n|~\n...',
      expect: {
        type: 'LED',
        color: 1,
        stroke: 0,
        startPointIndex: 13,
        endPointIndex: 14,
        tipLength: 1.0,
        tipWidth: 2.3,
        attributes: undefined,
      } as ArrowElement,
    },
    {
      text: 'QUAD\n1 0\n13 14 15 16\n1 2\n|~\n...',
      expect: {
        type: 'QUAD',
        color: 1,
        stroke: 0,
        cornerPoint1Index: 13,
        cornerPoint2Index: 14,
        cornerPoint3Index: 15,
        cornerPoint4Index: 16,
        fill: 1,
        fillColor: 2,
        attributes: undefined,
      } as QuadElement,
    },
    {
      text: 'TXT\n1 0\n13\n10.0 1.3 90.0\n1.5 45.0\n36 1 3\nText1\nHello\nWorld!\n|~\n...',
      expect: {
        type: 'TXT',
        color: 1,
        stroke: 0,
        startPointIndex: 13,
        charHeight: 10.0,
        charRatio: 1.3,
        charAngle: 90.0,
        lineSeparation: 1.5,
        textAngle: 45.0,
        textAlignment: 36,
        textOrientation: 1,
        text: ['Text1', 'Hello', 'World!'],
        attributes: undefined,
      } as TextElement,
    },
    {
      text: 'LIN\n1 0\n2 1\n3\n1\n2\n3\n|~\n...',
      expect: { type: 'LIN', color: 1, stroke: 0, startPointIndex: 2, endPointIndex: 1, isChamfer: false, attributes: [1, 2, 3] } as LineSegment,
    },
    /* tslint:enable */
  ].forEach((test) => {
    it(`should read ${JSON.stringify(test.text)}`, () => {
      const reader = new ElementReader(new Parser(test.text));
      const element = reader.read();
      expect(test.expect).to.eql(element);
    });
  });

  it('should readList three elements', () => {
    const reader = new ElementReader(new Parser('LIN\n1 0\n1 2\n|~\nLIN\n1 0\n2 3\n|~\nLIN\n1 0\n3 4\n|~\n##~~\n...'));
    const elements = reader.readList();
    expect(elements).to.be.of.length(3);
    expect(elements.map((x) => x.type)).to.eql(['LIN', 'LIN', 'LIN']);
  });
});
