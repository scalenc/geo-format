import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { GeoReader } from '../src/persistency/GeoReader';
import { SvgWriter } from '../src/persistency/SvgWriter';

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
    '123456-A1-12345-123-12Stk.geo',
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

  it(`should write expected colored svg for 300T80X100.svg`, () => {
    const filename = '300T80X100.geo';
    const content = fs.readFileSync(path.join(__dirname, 'data', filename)).toString('latin1');
    const file = GeoReader.read(content);
    const svgWriter = new SvgWriter();
    svgWriter.setColors(['orange', 'blue']);
    const svg = svgWriter.toSvg(file);
    fs.mkdirSync(path.join(__dirname, 'dump'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, 'dump', filename.replace(/\.geo$/i, '-colored.svg')), svg);

    const coloredSvgFilename = path.join(__dirname, 'data', 'svgs', filename.replace(/\.geo$/i, '-colored.svg'));
    const expectedColoredSvg = fs.readFileSync(coloredSvgFilename).toString('utf-8');
    expect(expectedColoredSvg).to.eq(svg);
  });

  it(`should write expected padded svg for 300T80X100.svg`, () => {
    const filename = '300T80X100.geo';
    const content = fs.readFileSync(path.join(__dirname, 'data', filename)).toString('latin1');
    const file = GeoReader.read(content);
    const svgWriter = new SvgWriter();
    const svg = svgWriter.toSvg(file, {
      targetWidth: 1000,
      targetHeight: 1000,
      targetStrokeWidth: 18,
    });
    fs.mkdirSync(path.join(__dirname, 'dump'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, 'dump', filename.replace(/\.geo$/i, '-padded.svg')), svg);

    const coloredSvgFilename = path.join(__dirname, 'data', 'svgs', filename.replace(/\.geo$/i, '-padded.svg'));
    const expectedColoredSvg = fs.readFileSync(coloredSvgFilename).toString('utf-8');
    expect(expectedColoredSvg).to.eq(svg);
  });
});
