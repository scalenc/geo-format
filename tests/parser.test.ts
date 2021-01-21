import { expect } from 'chai';
import { Parser } from '../src/persistency/parser';

describe('tests Parser', () => {
  ['\n...', '\r\n...'].forEach((s) => {
    it(`should readNewLine for ${JSON.stringify(s)} without throwing`, () => {
      const parser = new Parser(s);
      parser.readNewLine();
      // Does not throw.
    });
  });

  it('should throw on readNewLine with extra characters', () => {
    const parser = new Parser('Extra characters\r\n...');
    expect(() => parser.readNewLine()).throws(/Expected new line/);
  });

  [
    { text: '\n', expected: '' },
    { text: 'Test\n', expected: 'Test' },
  ].forEach((test) => {
    it(`should readText for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      const actual = parser.readText();
      expect(test.expected).equals(actual);
    });
  });

  it('should throw on readText at end of file', () => {
    const parser = new Parser('Text');
    expect(() => parser.readText()).throws(/Unexpected end of file/);
  });

  [
    { text: '\n...', expected: '' },
    { text: 'Test\n...', expected: 'Test' },
  ].forEach((test) => {
    it(`should readTextLine for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      const actual = parser.readTextLine();
      expect(test.expected).equals(actual);
    });
  });

  it('should throw on readTextLine at end of file', () => {
    const parser = new Parser('Text');
    expect(() => parser.readTextLine()).throws(/Unexpected end of file/);
  });

  [
    { text: '1.03 ', expected: 1.03 },
    { text: '-1.03 ', expected: -1.03 },
    { text: '+1.03 ', expected: 1.03 },
    { text: '3 ', expected: 3 },
  ].forEach((test) => {
    it(`should readDouble for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      const actual = parser.readDouble();
      expect(test.expected).to.eq(actual);
    });
  });

  ['hello ', '1.03hello '].forEach((text) => {
    it(`should throw on readDouble for ${JSON.stringify(text)}`, () => {
      const parser = new Parser(text);
      expect(() => parser.readDouble()).throws(/Expected number/);
    });
  });

  it('should throw on readDouble at end of file', () => {
    const parser = new Parser('1.03');
    expect(() => parser.readDouble()).throws(/Unexpected end of file/);
  });

  [
    { text: '1.03\n...', expected: 1.03 },
    { text: '-1.03 \n...', expected: -1.03 },
  ].forEach((test) => {
    it(`should readDoubleLine for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      const actual = parser.readDoubleLine();
      expect(test.expected).to.eq(actual);
    });
  });

  it('should throw on readDoubleLine with extra characters', () => {
    const parser = new Parser('1.03 hello\n...');
    expect(() => parser.readDoubleLine()).throws(/Expected new line/);
  });

  [
    { text: '3 ', expected: 3 },
    { text: '-3 ', expected: -3 },
    { text: '+5 ', expected: +5 },
    { text: '0 ', expected: 0 },
  ].forEach((test) => {
    it(`should readInt for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      const actual = parser.readInt();
      expect(test.expected).to.eq(actual);
    });
  });

  // it('should throw on readInt double double', () => {
  //   const parser = new Parser('1.03 ');
  //   expect(() => parser.readInt()).throws(/Expected new line/);
  // });

  ['hello ', '1hello '].forEach((text) => {
    it(`should throw on readInt for ${JSON.stringify(text)}`, () => {
      const parser = new Parser(text);
      expect(() => parser.readInt()).throws(/Expected number/);
    });
  });

  it('should throw on readInt at end of file', () => {
    const parser = new Parser('1');
    expect(() => parser.readInt()).throws(/Unexpected end of file/);
  });

  [
    { text: '3\n...', expected: 3 },
    { text: '-4 \n...', expected: -4 },
  ].forEach((test) => {
    it(`should readIntLine for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      const actual = parser.readIntLine();
      expect(test.expected).to.eq(actual);
    });
  });

  it('should throw on readIntLine with extra characters', () => {
    const parser = new Parser('4 hello\n...');
    expect(() => parser.readIntLine()).throws(/Expected new line/);
  });

  [{ text: '1.0 2.0 3.0 more', expected: { x: 1, y: 2, z: 3 } }].forEach((test) => {
    it(`should readVector for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      const actual = parser.readVector();
      expect(test.expected).to.eql(actual);
    });
  });

  ['1.0 ', 'hello '].forEach((text) => {
    it(`should throw on readVector for ${JSON.stringify(text)}`, () => {
      const parser = new Parser(text);
      expect(() => parser.readVector()).throws(/ERROR/);
    });
  });

  [
    { text: '1.0 2.0 3.0\n...', expected: { x: 1, y: 2, z: 3 } },
    { text: '1.0 2.0 3.0 \n...', expected: { x: 1, y: 2, z: 3 } },
  ].forEach((test) => {
    it(`should readVectorLine for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      const actual = parser.readVectorLine();
      expect(test.expected).to.eql(actual);
    });
  });

  ['1.0 2.0 3.0 more\n...'].forEach((text) => {
    it(`should throw on readVectorLine for ${JSON.stringify(text)}`, () => {
      const parser = new Parser(text);
      expect(() => parser.readVectorLine()).throws(/ERROR/);
    });
  });

  [
    {
      text: '1.0 2.0 3.0 4.0\n5.0 6.0 7.0 8.0\n9.0 10.0 11.0 12.0\n13.0 14.0 15.0 16.0\n...',
      expected: {
        values: [
          [1, 2, 3, 4],
          [5, 6, 7, 8],
          [9, 10, 11, 12],
          [13, 14, 15, 16],
        ],
      },
    },
  ].forEach((test) => {
    it(`should readMatrixLines for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      const actual = parser.readMatrixLines();
      expect(test.expected).to.eql(actual);
    });
  });

  it('should throw on readMatrixLines with extra characters', () => {
    const parser = new Parser('1.0 2.0 3.0 4.0\n5.0 6.0 7.0 8.0 extra\n9.0 10.0 11.0 12.0\n13.0 14.0 15.0 16.0\n...');
    expect(() => parser.readMatrixLines()).throws(/Expected new line/);
  });

  [
    { text: '#~1 ', expected: '#~1' },
    { text: '1.03 ', expected: '1.03' },
    { text: '\n...', expected: '' },
    { text: ' ', expected: '' },
  ].forEach((test) => {
    it(`should readToken for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      const actual = parser.readToken();
      expect(test.expected).to.eq(actual);
    });
  });

  [
    { text: '#~1\n...', expected: '#~1' },
    { text: '#~1 \n...', expected: '#~1' },
  ].forEach((test) => {
    it(`should readTokenLine for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      const actual = parser.readTokenLine();
      expect(test.expected).to.eq(actual);
    });
  });

  it('should throw on readTokenLine with extra characters', () => {
    const parser = new Parser('#~1 hello\n...');
    expect(() => parser.readTokenLine()).throws(/Expected new line/);
  });

  [
    { text: ' \t X\n...', expected: 'X' },
    { text: 'X\n...', expected: 'X' },
  ].forEach((test) => {
    it(`should readTokenLine and readText for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      parser.skipWhiteSpace();
      const actual = parser.readText();
      expect(test.expected).to.eq(actual);
    });
  });

  [
    { text: '#~1\n...', expected: '1' },
    { text: '#~11 \n...', expected: '11' },
  ].forEach((test) => {
    it(`should readSectionStartLine for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      const actual = parser.readSectionStartLine();
      expect(test.expected).to.eq(actual);
    });
  });

  ['~11\n...', '##~~\n...'].forEach((text) => {
    it(`should throw on readSectionStartLine for ${JSON.stringify(text)}`, () => {
      const parser = new Parser(text);
      expect(() => parser.readSectionStartLine()).throws(/ERROR/);
    });
  });

  [{ text: '##~~\n...', expected: '##~~' }].forEach((test) => {
    it(`should not throw readExpectedTokenLine for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      expect(() => parser.readExpectedTokenLine(test.expected, 'TOKEN TYPE')).to.not.throw();
    });
  });

  [
    { text: '##~~\n...', expected: '#~1', throws: /Expected TOKEN TYPE/ },
    { text: '##~~ more\n...', expected: '##~~', throws: /Expected new line/ },
  ].forEach((test) => {
    it(`should throw readExpectedTokenLine for ${JSON.stringify(test.text)}`, () => {
      const parser = new Parser(test.text);
      expect(() => parser.readExpectedTokenLine(test.expected, 'TOKEN TYPE')).throws(test.throws);
    });
  });
});
