import { expect } from 'chai';
import { Subpart } from '../src/model/Subpart';
import { Parser } from '../src/persistency/Parser';
import { SubpartReader } from '../src/persistency/SubpartReader';

describe(SubpartReader.name, () => {
  const SAMPLE_SUBPART_TEXT = 'MyName\nMyInfo\nMyNumber\n0.0 0.0 0.0\n10.0 11.0 12.0\n5.0 4.0 0.0\n90.0\n3\n##~~\n';
  const SAMPLE_SUBPART = {
    id: undefined,
    name: 'MyName',
    info: 'MyInfo',
    number: 'MyNumber',
    min: { x: 0, y: 0, z: 0 },
    max: { x: 10, y: 11, z: 12 },
    centerOfGravity: { x: 5, y: 4, z: 0 },
    area: 90,
    contoursCount: 3,
    points: {},
    elements: [],
    bendingLines: [],
    contours: [],
  } as Subpart;

  [
    {
      text: `${SAMPLE_SUBPART_TEXT}#~SUB_END\n...`,
      expect: SAMPLE_SUBPART,
    },
    {
      text: `${SAMPLE_SUBPART_TEXT}#~31\nP\n1\n1.0 2.0 3.0\n|~\nP\n2\n2.0 3.0 4.0\n|~\nP\n3\n3.0 4.0 5.0\n|~\n##~~\n#~SUB_END\n...`,
      expect: { ...SAMPLE_SUBPART, points: { 1: { x: 1, y: 2, z: 3 }, 2: { x: 2, y: 3, z: 4 }, 3: { x: 3, y: 4, z: 5 } } },
    },
    {
      text: `${SAMPLE_SUBPART_TEXT}#~32\nARC\n1 0\n13 14 15\n1\n|~\n##~~\n#~SUB_END\n...`,
      expect: { ...SAMPLE_SUBPART, elements: [{}] },
    },
    {
      text: `${SAMPLE_SUBPART_TEXT}#~37\nLIN\n1 0\n13 14\n|~\n##~~\n#~SUB_END\n...`,
      expect: { ...SAMPLE_SUBPART, bendingLines: [{}] },
    },
    {
      text: `${SAMPLE_SUBPART_TEXT}#~33\n\n1 2 3\n0\n0.0 0.0 1.0\n0.0 0.0 0.0\n10.0 10.0 10.0\n5.0 5.0 0.0\n15.0\n-1\n##~~\n#~331\nLIN\n1 0\n13 14\n|~\n##~~\n#~KONT_END\n#~SUB_END\n...`,
      expect: { ...SAMPLE_SUBPART, contours: [{}] },
    },
  ].forEach((test) => {
    it(`should read expected for ${JSON.stringify(test.text)}`, () => {
      const reader = new SubpartReader(new Parser(test.text));
      const actual = reader.read();

      // Skip segments and offsetSegments for deep comparison
      /* eslint-disable @typescript-eslint/no-explicit-any */
      actual.elements = actual.elements.map(() => ({} as any));
      actual.bendingLines = actual.bendingLines.map(() => ({} as any));
      actual.contours = actual.contours.map(() => ({} as any));
      /* eslint-enable @typescript-eslint/no-explicit-any */

      expect(test.expect).to.eql(actual);
    });
  });
});
