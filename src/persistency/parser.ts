import { Matrix } from '../model/matrix';
import { Vector } from '../model/vector';
import * as constants from './constants';
import { ParserError } from './parser-error';

export class Parser {
  private index = 0;
  private line = 1;

  constructor(private text: string) {
  }

  get current(): string {
    return this.index < this.text.length ? this.text[this.index] : '';
  }

  get isSectionChar(): boolean {
    return this.current === constants.SECTION_CHAR;
  }

  get isElementEndChar(): boolean {
    return this.current === constants.ELEMENT_END_CHAR;
  }

  public readNewLine() {
    if (this.isCurrentLineEnd()) {
      this.readNextByte();
    } else {
      const line = this.readText();
      this.assert(false, `Expected new line, but found: "${line}`);
    }
  }

  public readText(): string {
    const startIndex = this.index;
    while (!this.isCurrentLineEnd()) {
      this.readNextByte();
    }
    return this.text.substr(startIndex, this.index - startIndex);
  }

  public readTextLine(): string {
    const v = this.readText();
    this.readNewLine();
    return v;
  }

  public readDouble(): number {
    const s = this.readToken();
    const n = +s;
    this.assert(!isNaN(n), `Expected number, but found "${s}"`);
    return n;
  }

  public readDoubleLine(): number {
    const v = this.readDouble();
    this.skipWhiteSpace();
    this.readNewLine();
    return v;
  }

  public readInt(): number {
    const s = this.readToken();
    const n = +s;
    this.assert(!isNaN(n), `Expected number, but found "${s}"`);
    return n;
  }

  public readIntLine(): number {
    const v = this.readInt();
    this.skipWhiteSpace();
    this.readNewLine();
    return v;
  }

  public readVector(): Vector {
    const x = this.readDouble();
    this.skipWhiteSpace();
    const y = this.readDouble();
    this.skipWhiteSpace();
    const z = this.readDouble();
    return { x, y, z };
  }

  public readVectorLine(): Vector {
    const v = this.readVector();
    this.skipWhiteSpace();
    this.readNewLine();
    return v;
  }

  public readMatrixLines(): Matrix {
    const v = { values: [] } as Matrix;
    for (let i = 0; i < 4; i += 1) {
      v.values[i] = [];
      for (let j = 0; j < 4; j += 1) {
        v.values[i][j] = this.readDouble();
        this.skipWhiteSpace();
      }
      this.readNewLine();
    }
    return v;
  }

  public readToken(): string {
    const startIndex = this.index;
    while (!this.isWhiteSpace()) {
      this.readNextByte();
    }
    return this.text.substring(startIndex, this.index);
  }

  public readTokenLine(): string {
    const v = this.readToken();
    this.skipWhiteSpace();
    this.readNewLine();
    return v;
  }

  public readExpectedSectionEndLine(expected: string) {
    this.readExpectedTokenLine(expected, 'section end');
  }

  public readExpectedTokenLine(expected: string, tokenType: string) {
    const actual = this.readToken();
    this.assert(expected === actual, `Expected ${tokenType} "${expected}", but found "${actual}"`);
    this.readNewLine();
  }

  public readSectionStartLine(): string {
    this.skipExpected(constants.SECTION_TOKEN, 'section start');

    const section = this.readTokenLine();
    return section;
  }

  public readExpectedSectionStartLine(expectedSection: string) {
    const section = this.readSectionStartLine();
    this.assert(expectedSection === section, `Expect section "${expectedSection}", but found "${section}"`);
  }

  public skipWhiteSpace() {
    while (!this.isCurrentLineEnd() && this.isWhiteSpace()) {
      this.readNextByte();
    }
  }

  public assertSectionEnd(expected: string, actual: string) {
    this.assert(expected === actual, `Expected section end "${expected}", but found "${actual}"`);
  }

  public assert(condition: boolean, message: string) {
    if (!condition) {
      throw new ParserError(`ERROR in line ${this.line}: ${message}`, this.line);
    }
  }

  private isWhiteSpace() {
    return /\s/.test(this.current); // FIXME Optimize
  }

  private isCurrentLineEnd(): boolean {
    return this.current === '\r' || this.current === '\n';
  }

  private readNextByte() {
    this.index += 1;

    if (this.isCurrentLineEnd()) {
      if (this.text[this.index - 1] === '\r' && this.current === '\n') {
        this.index += 1;
      }
      this.line += 1;
    }

    this.assertNotEOF();
  }

  private assertNotEOF() {
    this.assert(this.index < this.text.length, 'Unexpected end of file');
  }

  private skipExpected(expected: string, expectedType: string) {
    const startIndex = this.index;
    for (let i = 0; i < expected.length; i += 1) {
      if (expected[i] !== this.current) {
        const found = this.text.substring(startIndex, this.index);
        this.assert(false, `Expected ${expectedType} "${expected}", but found "${found}"`);
      }
      this.readNextByte();
    }
  }
}
