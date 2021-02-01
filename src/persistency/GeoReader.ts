import { GeoFile } from '../model/GeoFile';
import { Parser } from './Parser';
import { PartReader } from './PartReader';
import * as constants from './constants';
import { HeaderReader } from './HeaderReader';

export class GeoReader {
  public static read(content: string): GeoFile {
    const parser = new Parser(content);

    parser.readExpectedSectionStartLine(constants.HEADER_SECTION);
    const headerReader = new HeaderReader(parser);
    const header = headerReader.read();

    const partReader = new PartReader(parser);
    const parts = [];
    for (;;) {
      const section = parser.readToken();
      if (section === constants.FILE_END) {
        break;
      }
      parser.readNewLine();

      parts.push(partReader.read());
    }

    return { header, parts };
  }
}
