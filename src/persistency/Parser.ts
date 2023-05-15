import { Matrix } from '../model/Matrix';
import { Vector } from '../model/Vector';
import * as constants from './constants';
import { ParserError } from './ParserError';

export class Parser {
  private index = 0;

  private line = 1;

  // eslint-disable-next-line no-useless-constructor
  constructor(private text: string) {}

  get current(): string {
    return this.index < this.text.length ? this.text[this.index] : '';
  }

  get isSectionChar(): boolean {
    return this.current === constants.SECTION_CHAR;
  }

  get isElementEndChar(): boolean {
    return this.current === constants.ELEMENT_END_CHAR;
  }

  get isCurrentLineEnd(): boolean {
    return this.current === '\r' || this.current === '\n';
  }

  public readNewLine(): void {
    if (this.isCurrentLineEnd) {
      this.readNextByte();
    } else {
      const line = this.readText();
      this.assert(false, `Expected new line, but found: "${line}`);
    }
  }

  public readText(): string {
    const startIndex = this.index;
    while (!this.isCurrentLineEnd) {
      this.readNextByte();
    }
    return this.text.substring(startIndex, this.index);
  }

  public readTextLine(): string {
    const v = this.readText();
    this.readNewLine();
    return v;
  }

  public readDouble(): number {
    const s = this.readToken();
    const n = +s;
    this.assert(!Number.isNaN(n), `Expected number, but found "${s}"`);
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
    this.assert(!Number.isNaN(n), `Expected number, but found "${s}"`);
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

  public readTokenLineWithOptionalId(): [string, string] {
    const v = this.readToken();
    this.skipWhiteSpace();
    const id = this.readToken();
    this.skipWhiteSpace();
    this.readNewLine();
    return [v, id];
  }

  public readTokenLine(): string {
    const v = this.readToken();
    this.skipWhiteSpace();
    this.readNewLine();
    return v;
  }

  public readExpectedSectionEndLine(expected: string): void {
    this.readExpectedTokenLine(expected, 'section end');
  }

  public readExpectedTokenLine(expected: string, tokenType: string): void {
    const actual = this.readToken();
    this.assert(expected === actual, `Expected ${tokenType} "${expected}", but found "${actual}"`);
    this.readNewLine();
  }

  public readSectionStartLine(): [string, string] {
    this.skipExpected(constants.SECTION_TOKEN, 'section start');

    const sectionWithId = this.readTokenLineWithOptionalId();
    return sectionWithId;
  }

  public readExpectedSectionStartLine(expectedSection: string): [string, string] {
    const sectionWithId = this.readSectionStartLine();
    this.assert(expectedSection === sectionWithId[0], `Expect section "${expectedSection}", but found "${sectionWithId[0]}"`);
    return sectionWithId;
  }

  public skipWhiteSpace(): void {
    while (!this.isCurrentLineEnd && this.isWhiteSpace()) {
      this.readNextByte();
    }
  }

  public assertSectionEnd(expected: string, actual: string): void {
    this.assert(expected === actual, `Expected section end "${expected}", but found "${actual}"`);
  }

  public assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new ParserError(`ERROR in line ${this.line}: ${message}`, this.line);
    }
  }

  private isWhiteSpace() {
    return /\s/.test(this.current); // FIXME Optimize
  }

  private readNextByte() {
    if (this.isCurrentLineEnd) {
      if (this.current === '\r' && this.index + 1 < this.text.length && this.text[this.index + 1] === '\n') {
        ++this.index;
      }
      ++this.line;
    }

    ++this.index;
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
