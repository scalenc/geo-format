import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { GeoReader } from '../src/persistency/GeoReader';

describe(GeoReader.name, () => {
  const sampleFiles = [
    '300T16.geo',
    '300T80X100.geo',
    'geo_with_bend_attributes.geo',
    'moon_withSortedPoints.geo',
    'moon.geo',
    'Test_withSortedPoints.geo',
    'Test.geo',
    'Text_Geo.geo',
    'Text_GeoWithAttribute.geo',
    'Z_CAMEL.geo',
    'tmt-extract.geo',
    'tmt-extract-2.geo',
  ];

  sampleFiles.forEach((filename) => {
    it(`should read ${filename} without errors`, () => {
      const content = fs.readFileSync(path.join(__dirname, 'data', filename)).toString('latin1');
      const file = GeoReader.read(content);
      expect(file).to.be.not.null;
      expect(file).to.be.not.undefined;
    });
  });
});
