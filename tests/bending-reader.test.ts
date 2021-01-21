import { expect } from 'chai';
import { Bending } from '../src/model/bending';
import { LineSegment } from '../src/model/line-segment';
import { BendingReader } from '../src/persistency/bending-reader';
import { Parser } from '../src/persistency/parser';

const SAMPLE_BENDING = {
  type: 1,
  method: 2,
  technique: 3,
  angle: 45.0,
  preAngle: 20.0,
  startRadius: 2.0,
  radiusFromTable: 3.0,
  bendingFactor: 1.3,
  upperTool: '1',
  lowerTool: '2',
  attributes: undefined,
  bendingLines: [],
} as Bending;

describe('test BendingReader', () => {
  [
    { text: '1 2 3\n45.0 20.0\n2.0 3.0\n1.3\n1\n2\n1\n1\n2\n3\n##~~\n#~BIEG_END\n...', throws: /Expected section end/ },
    { text: '1 2 3\n45.0 20.0\n2.0 3.0\n1.3\n1\n2\n3\n1\n##~~\n#~BIEG_END\n...', throws: /Expected number/ },
  ].forEach((test) => {
    it(`should throw on read for ${JSON.stringify(test.text)}`, () => {
      const reader = new BendingReader(new Parser(test.text));
      expect(() => reader.read()).throws(test.throws);
    });
  });

  [
    {
      text: '1 2 3\n45.0 20.0\n2.0 3.0\n1.3\n1\n2\n##~~\n#~BIEG_END\n...',
      expect: SAMPLE_BENDING,
    },
    {
      text: '1 2 3\n45.0 20.0\n2.0 3.0\n1.3\n1\n2\n3\n1\n2\n3\n##~~\n#~BIEG_END\n...',
      expect: { ...SAMPLE_BENDING, attributes: [1, 2, 3] } as Bending,
    },
    {
      description: 'with negative attributes count',
      text: '1 2 3\n45.0 20.0\n2.0 3.0\n1.3\n1\n2\n-1\n##~~\n#~BIEG_END\n...',
      expect: SAMPLE_BENDING,
    },
    {
      description: 'with explicit zero count',
      text: '1 2 3\n45.0 20.0\n2.0 3.0\n1.3\n1\n2\n0\n##~~\n#~BIEG_END\n...',
      expect: SAMPLE_BENDING,
    },
    {
      text: '1 2 3\n45.0 20.0\n2.0 3.0\n1.3\n1\n2\n##~~\n#~371\nLIN\n1 0\n2 3\n|~\n##~~\n#~BIEG_END\n...',
      expect: {
        ...SAMPLE_BENDING,
        bendingLines: [
          {
            type: 'LIN',
            color: 1,
            stroke: 0,
            startPointIndex: 2,
            endPointIndex: 3,
            isChamfer: false,
            attributes: undefined,
          } as LineSegment,
        ],
      },
    },
  ].forEach((test) => {
    it(`should read ${JSON.stringify(test.text)}`, () => {
      const reader = new BendingReader(new Parser(test.text));
      const element = reader.read();
      expect(test.expect).to.eql(element);
    });
  });
});
