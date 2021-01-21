import { expect } from 'chai';
import { Contour } from '../src/model/contour';
import { ContourReader } from '../src/persistency/contour-reader';
import { Parser } from '../src/persistency/parser';

describe('test ContourReader', () => {
  const SAMPLE_CONTOUR = {
    info: 'Info',
    number: 1,
    type: 2,
    isInner: 3,
    innerContoursCount: 0,
    orientation: { x: 0, y: 0, z: 1 },
    min: { x: 0, y: 0, z: 0 },
    max: { x: 1, y: 1, z: 1 },
    centerOfGravity: { x: 0.5, y: 0.5, z: 0.5 },
    area: 0.0,
    parentContourNumber: -1,
    segments: [],
    offsetSegments: [],
  } as Contour;

  [
    {
      text: 'Info\n1 2 3\n0\n0.0 0.0 1.0\n0.0 0.0 0.0\n1.0 1.0 1.0\n0.5 0.5 0.5\n0.0\n-1\n##~~\n#~KONT_END\n...',
      expect: SAMPLE_CONTOUR,
    },
    {
      text:
        'Info\n1 2 3\n0\n0.0 0.0 1.0\n0.0 0.0 0.0\n1.0 1.0 1.0\n0.5 0.5 0.5\n0.0\n-1\n##~~\n#~331\nLIN\n1 0\n1 2\n|~\nLIN\n1 0\n2 3\n|~\n##~~\n#~332\nLIN\n1 0\n4 5\n|~\nLIN\n1 0\n5 6\n|~\n##~~\n#~KONT_END\n...',
      expect: { ...SAMPLE_CONTOUR, segments: [{}, {}], offsetSegments: [{}, {}] },
    },
  ].forEach((test) => {
    it(`should read expected for ${test.text}`, () => {
      const reader = new ContourReader(new Parser(test.text));
      const actual = reader.read();

      // Skip segments and offsetSegments for deep comparison
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      actual.segments = actual.segments.map(() => ({} as any));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      actual.offsetSegments = actual.offsetSegments.map(() => ({} as any));

      expect(test.expect).to.eql(actual);
    });
  });
});
