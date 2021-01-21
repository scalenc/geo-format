import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { GeoReader } from '../src/persistency/geo-reader';
import { SvgWriter } from '../src/persistency/svg-writer';

describe('test SvgWriter', () => {
  const sampleFiles = [
    '300T16.geo',
    '300T80X100.geo',
    '554.geo',
    '555.geo',
    '556.geo',
    'geo_with_bend_attributes.geo',
    'moon_withSortedPoints.geo',
    'moon.geo',
    'Test_withSortedPoints.geo',
    'Test.geo',
    'Text_Geo.geo',
    'Z_CAMEL.geo',
  ];

  sampleFiles.forEach((filename) => {
    it(`should write expected svg for ${filename}`, () => {
      const content = fs.readFileSync(path.join(__dirname, 'data', filename)).toString('latin1');
      const file = GeoReader.read(content);
      const svgWriter = new SvgWriter();
      const svg = svgWriter.toSvg(file);

      fs.mkdirSync(path.join(__dirname, 'dump'), { recursive: true });
      fs.writeFileSync(path.join(__dirname, 'dump', filename.replace(/\.geo$/i, '.svg')), svg);

      const svgFilename = path.join(__dirname, 'data', 'svgs', filename.replace(/\.geo$/i, '.svg'));
      const expectedSvg = fs.readFileSync(svgFilename).toString('utf-8');
      expect(expectedSvg).to.eq(svg);
    });
  });
});
