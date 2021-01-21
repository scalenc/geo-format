import { expect } from 'chai';
import { Parser } from '../src/persistency/parser';
import { PointReader } from '../src/persistency/point-reader';

describe('test PointReader', () => {
  [
    {
      text: 'P\n1\n1.0 2.0 3.0\n|~\n##~~\n...',
      expect: { 1: { x: 1, y: 2, z: 3 } },
    },
    {
      text: 'P\n1\n1.0 2.0 3.0\n|~\nP\n2\n2.0 3.0 4.0\n|~\nP\n3\n3.0 4.0 5.0\n|~\n##~~\n...',
      expect: { 1: { x: 1, y: 2, z: 3 }, 2: { x: 2, y: 3, z: 4 }, 3: { x: 3, y: 4, z: 5 } },
    },
    {
      text: 'P\n1\n1.0 2.0 3.0\n|~\nP\n1\n2.0 3.0 4.0\n|~\n##~~\n...',
      expect: { 1: { x: 2, y: 3, z: 4 } },
    },
  ].forEach((test) => {
    it(`should readPoints from ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      const points = PointReader.readPoints(parser);
      expect(test.expect).to.eql(points);
    });
  });

  [
    { text: 'P\n1\n1.0 2.0 3.0\n|~\n...', throws: /Unexpected end of file/ },
    { text: 'P\n1\n1.0 2.0 3.0\n##~~\n...', throws: /Expected section end "|~"/ },
  ].forEach((test) => {
    it(`should throw on readPoints from ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      expect(() => PointReader.readPoints(parser)).throws(test.throws);
    });
  });
});
