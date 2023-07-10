import { Header, VERSIONS } from '../model/Header';
import { Writer } from './Writer';
import { BLOCK_END, HEADER_SECTION, SECTION_END, SUBHEADER_SECTION } from './constants';

export class HeaderWriter {
  static write(header: Header, writer: Writer): Writer {
    writer
      .writeSectionLine(HEADER_SECTION, header.id)
      .writeTokenLine(header.version)
      .writeIntLine(header.revision)
      .writeTokenLine(header.date)
      .writeVectorLine(header.min)
      .writeVectorLine(header.max)
      .writeDoubleLine(header.area)
      .writeIntLine(header.unit)
      .writeDoubleLine(header.tolerance)
      .writeIntLine(header.is3D)
      .writeIntLine(header.partsCount)
      .writeTokenLine(SECTION_END);

    HeaderWriter.writeDetails(header, writer);

    return writer.writeTokenLine(BLOCK_END);
  }

  private static writeDetails(header: Header, writer: Writer) {
    writer
      .writeTokenLine(SUBHEADER_SECTION, header.subHeaderId)
      .writeTextLine(header.name ?? '')
      .writeTextLine(header.description ?? '')
      .writeTextLine(header.customer ?? '')
      .writeTextLine(header.author ?? '')
      .writeTextLine(header.orderID ?? '')
      .writeTextLine(header.material ?? '')
      .writeDoubleLine(header.sheetThickness ?? 0)
      .writeTextLine(header.processingRule ?? '')
      .writeTextLine(header.processingTable ?? '')
      .writeTextLine(header.machineName ?? '')
      .writeIntLine(header.isRotatable ?? 0)
      .writeIntLine(header.isGoodForMiniNests ?? 0)
      .writeIntLine(header.repetitionCount ?? 0);

    if (VERSIONS.isV1_03_orLater(header.version)) {
      writer
        .writeIntLine(header.isGoodForTwinline ?? 0)
        .writeIntLine(header.shouldNestInBlocks ?? 0)
        .writeIntLine(header.columnsCountInBlock ?? 0)
        .writeIntLine(header.rowsCountInBlock ?? 0)
        .writeIntLine(header.rollingDirection ?? 0)
        .writeIntLine(header.isAssemblyPart ?? 0)
        .writeTextLine(header.assemblyName ?? '');
    }

    writer.writeTokenLine(SECTION_END);
  }
}
