import { Header, VERSIONS } from '../model/header';
import { Parser } from './parser';
import * as constants from './constants';

export class HeaderReader {
  // eslint-disable-next-line no-useless-constructor
  public constructor(private parser: Parser) {}

  public read(): Header {
    const version = this.parser.readTextLine();
    this.parser.assert(VERSIONS.includes(version), `Unknown GEO version ${version}`);

    const revision = this.parser.readIntLine();
    const date = this.parser.readTokenLine();
    const min = this.parser.readVectorLine();
    const max = this.parser.readVectorLine();
    const area = this.parser.readDoubleLine();
    const unit = this.parser.readIntLine();
    const tolerance = this.parser.readDoubleLine();
    const is3D = this.parser.readIntLine();
    const partsCount = this.parser.readIntLine();
    this.parser.readExpectedSectionEndLine(constants.SECTION_END);

    const header = { version, revision, date, min, max, area, unit, tolerance, is3D, partsCount } as Header;

    let section = this.parser.readTokenLine();
    if (section === constants.SUBHEADER_SECTION) {
      this.readDetails(header);
      this.parser.readExpectedSectionEndLine(constants.SECTION_END);
      section = this.parser.readTokenLine();
    }
    this.parser.assertSectionEnd(constants.BLOCK_END, section);
    return header;
  }

  private readDetails(header: Header) {
    /* eslint-disable no-param-reassign */
    header.name = this.parser.readTextLine();
    header.description = this.parser.readTextLine();
    header.customer = this.parser.readTextLine();
    header.author = this.parser.readTextLine();
    header.orderID = this.parser.readTextLine();
    header.material = this.parser.readTextLine();
    header.sheetThickness = this.parser.readDoubleLine();
    header.processingRule = this.parser.readTextLine();
    header.processingTable = this.parser.readTextLine();
    header.machineName = this.parser.readTextLine();
    header.isRotatable = this.parser.readIntLine();
    header.isGoodForMiniNests = this.parser.readIntLine();
    header.repetitionCount = this.parser.readIntLine();

    if (VERSIONS.isV1_03_orLater(header.version)) {
      header.isGoodForTwinline = this.parser.readIntLine();
      header.shouldNestInBlocks = this.parser.readIntLine();
      header.columnsCountInBlock = this.parser.readIntLine();
      header.rowsCountInBlock = this.parser.readIntLine();
      header.rollingDirection = this.parser.readIntLine();
      header.isAssemblyPart = this.parser.readIntLine();
      header.assemblyName = this.parser.readTextLine();
    }
    /* eslint-enable no-param-reassign */
  }
}
