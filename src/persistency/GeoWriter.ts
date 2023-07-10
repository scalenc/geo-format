import { GeoFile } from '../model/GeoFile';
import { HeaderWriter } from './HeaderWriter';
import { PartsWriter } from './PartsWriter';
import { Writer } from './Writer';
import { FILE_END } from './constants';

export class GeoWriter {
  public static write(file: GeoFile, options?: { skipOptionalMirrorFlag?: boolean; newLine?: string }): string {
    const writer = HeaderWriter.write(file.header, new Writer());

    const partsWriter = new PartsWriter(writer, options);
    partsWriter.writeList(file.parts);

    return writer.writeTokenLine(FILE_END).lines.join(options?.newLine ?? '\n') + (options?.newLine ?? '\n');
  }
}
