import { GeoFile } from '../model/GeoFile';
import { Parser } from './Parser';
import { PartReader } from './PartReader';
import * as constants from './constants';
import { HeaderReader } from './HeaderReader';

export class GeoReader {
  public static read(content: string): GeoFile {
    const parser = new Parser(content);

    const [, id] = parser.readExpectedSectionStartLine(constants.HEADER_SECTION);
    const headerReader = new HeaderReader(parser);
    const header = headerReader.read(id);

    const partReader = new PartReader(parser);
    const parts = [];
    for (;;) {
      const section = parser.readToken();
      if (section === constants.FILE_END) {
        break;
      }
      parser.skipWhiteSpace();
      const id = parser.readToken();
      parser.skipWhiteSpace();
      parser.readNewLine();

      parts.push(partReader.read(id));
    }

    return { header, parts };
  }
}
