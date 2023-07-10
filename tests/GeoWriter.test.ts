import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { GeoReader, GeoWriter } from '../src';

describe(GeoWriter.name, () => {
  before(async () => {
    await fs.promises.mkdir(path.join(__dirname, 'dump', 'refs'), { recursive: true });
  });

  ['300T16.geo', '300T80X100.geo'].forEach((filename) => {
    it(`should read and write ${filename} equal to input (skipOptionalMirrorFlag)`, async () => {
      const content = await fs.promises.readFile(path.join(__dirname, 'data', filename), 'latin1');
      const file = GeoReader.read(content);

      const output = GeoWriter.write(file, { skipOptionalMirrorFlag: true });

      await fs.promises.writeFile(path.join(__dirname, 'dump', `${filename}.geo`), output, 'latin1');

      const contentLines = content.trimEnd().split(/\r?\n/);
      const outputLines = output.trimEnd().split(/\r?\n/);
      expect(outputLines).to.deep.equal(contentLines);
    });
  });

  [
    'geo_with_bend_attributes.geo',
    'moon_withSortedPoints.geo',
    'Test_withSortedPoints.geo',
    'Text_Geo.geo',
    'Z_CAMEL.geo',
    'refs/moon.geo',
    'refs/Test.geo',
    'refs/Text_GeoWithAttribute.geo',
    'refs/tmt-extract.geo',
    'refs/tmt-extract-2.geo',
  ].forEach((filename) => {
    it(`should read and write ${filename} equal to input`, async () => {
      const content = await fs.promises.readFile(path.join(__dirname, 'data', filename), 'latin1');
      const file = GeoReader.read(content);

      const output = GeoWriter.write(file);

      await fs.promises.writeFile(path.join(__dirname, 'dump', `${filename}.geo`), output, 'latin1');

      const contentLines = content.trimEnd().split(/\r?\n/);
      const outputLines = output.trimEnd().split(/\r?\n/);
      expect(outputLines).to.deep.equal(contentLines);
    });
  });

  ['moon.geo', 'Test.geo', 'Text_GeoWithAttribute.geo', 'tmt-extract.geo', 'tmt-extract-2.geo'].forEach((filename) => {
    it(`should read and write ${filename} equal to reference`, async () => {
      const content = await fs.promises.readFile(path.join(__dirname, 'data', filename), 'latin1');
      const file = GeoReader.read(content);

      const output = GeoWriter.write(file);

      await fs.promises.writeFile(path.join(__dirname, 'dump', filename), output, 'latin1');

      const reference = await fs.promises.readFile(path.join(__dirname, 'data', 'refs', filename), 'latin1');
      const referenceLines = reference.trimEnd().split(/\r?\n/);
      const outputLines = output.trimEnd().split(/\r?\n/);
      expect(outputLines).to.deep.equal(referenceLines);
    });
  });
});
