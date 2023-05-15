import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { GeoReader } from '../src/persistency/GeoReader';
import { SvgWriter } from '../src/persistency/SvgWriter';

describe('test SvgWriter', () => {
  const sampleFiles = [
    '300T16.geo',
    '300T80X100.geo',
    'geo_with_bend_attributes.geo',
    'moon_withSortedPoints.geo',
    'moon.geo',
    'Test_withSortedPoints.geo',
    'Test.geo',
    'Text_Geo.geo',
    'Z_CAMEL.geo',
    '123456-A1-12345-123-12Stk.geo',
    'tmt-extract.geo',
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

  it('should convert sample GEO from README to SVG', () => {
    const geo =
      '#~1\n1.03\n0\n\n0.000000000 0.000000000 0.000000000\n724.264068712 848.528137424 0.000000000\n294860.320115468\n0\n0.000000000\n0\n1\n##~~\n#~11\n\n\n\n\n\n\n0.000000000\n\n\n\n0\n0\n0\n0\n0\n0\n0\n0\n0\n\n##~~\n#~END\n#~3\n\n\n\n0.000000000 0.000000000 1.000000000\n1.000000000 0.000000000 0.000000000 0.000000000\n0.000000000 1.000000000 0.000000000 0.000000000\n0.000000000 0.000000000 1.000000000 0.000000000\n0.000000000 0.000000000 0.000000000 1.000000000\n0.000000000 0.000000000 0.000000000\n724.264068712 848.528137424 0.000000000\n275.546406035 424.264068712 0.000000000\n294860.320115468\n1\n0\n0\n0\n0\n##~~\n#~30\nIDENT@\n#~TTINFO_END\n#~31\nP\n1\n0.000000000 424.264068712 0.000000000\n|~\nP\n4\n308.036302695 424.264068712 0.000000000\n|~\nP\n3\n424.264068712 424.264068712 0.000000000\n|~\nP\n5\n624.264068712 424.264068712 0.000000000\n|~\nP\n2\n724.264068712 124.264068712 0.000000000\n|~\nP\n6\n724.264068712 724.264068712 0.000000000\n|~\n##~~\n#~33\n\n1 24 0\n0\n0.000000000 0.000000000 1.000000000\n0.000000000 0.000000000 0.000000000\n724.264068712 848.528137424 0.000000000\n275.546406035 424.264068712 0.000000000\n294860.320115468\n0\n##~~\n#~331\nARC\n1 0\n3 1 2\n1\n|~\nARC\n1 0\n5 2 4\n-1\n|~\nARC\n1 0\n5 4 6\n-1\n|~\nARC\n1 0\n3 6 1\n1\n|~\n##~~\n#~KONT_END\n#~END\n#~EOF\n';
    const file = GeoReader.read(geo);
    const svg = new SvgWriter().toSvg(file);
    expect(svg).equals(
      '<svg viewBox="0 -848.528137424 724.264068712 848.528137424" xmlns="http://www.w3.org/2000/svg"><g stroke="#000000" stroke-width="0.1%" fill="none"><symbol id="point" viewport="-2 -2 2 2"><path d="M-2 0 H2 M0 -2 V2 M-1.5 -1.5 L1.5 1.5 M-1.5 1.5 L1.5 -1.5" /></symbol><g id=""><path fill="white" stroke="black" d="M0 -424.264068712 A424.264068712 424.264068712 0 0 0 724.264068712 -124.264068712 A316.22776601683796 316.22776601683796 0 0 1 308.036302695 -424.264068712 A316.227766017 316.227766017 0 0 1 724.264068712 -724.264068712 A424.2640687119286 424.2640687119286 0 0 0 0 -424.264068712 Z" /></g></g></svg>'
    );
  });
});
