# TRUMPF GEO file format

[![License](https://img.shields.io/badge/license-BSD3-green)](https://github.com/scalenc/geo-format)
[![NPM version](https://img.shields.io/npm/v/@scalenc/geo-format)](https://www.npmjs.com/package/@scalenc/geo-format)

This is a typescript library to read text in TRUMPF GEO file format.

It comes with a plain class model of the GEO file and a persistency layer to read this model from a string.

Additionally, it provides a SVG writer to output the GEO class model into a SVG string.

## Installation

```sh
npm install @scalenc/geo-format
yarn add @scalenc/geo-format
pnpm add @scalenc/geo-format
```

## Examples

Sample usage to read TRUMPF GEO file

```typescript
import { GeoReader, SvgWriter } from '@scalenc/geo-format';

const geo =
  '#~1\n1.03\n0\n\n0.000000000 0.000000000 0.000000000\n724.264068712 848.528137424 0.000000000\n294860.320115468\n0\n0.000000000\n0\n1\n##~~\n#~11\n\n\n\n\n\n\n0.000000000\n\n\n\n0\n0\n0\n0\n0\n0\n0\n0\n0\n\n##~~\n#~END\n#~3\n\n\n\n0.000000000 0.000000000 1.000000000\n1.000000000 0.000000000 0.000000000 0.000000000\n0.000000000 1.000000000 0.000000000 0.000000000\n0.000000000 0.000000000 1.000000000 0.000000000\n0.000000000 0.000000000 0.000000000 1.000000000\n0.000000000 0.000000000 0.000000000\n724.264068712 848.528137424 0.000000000\n275.546406035 424.264068712 0.000000000\n294860.320115468\n1\n0\n0\n0\n0\n##~~\n#~30\nIDENT@\n#~TTINFO_END\n#~31\nP\n1\n0.000000000 424.264068712 0.000000000\n|~\nP\n4\n308.036302695 424.264068712 0.000000000\n|~\nP\n3\n424.264068712 424.264068712 0.000000000\n|~\nP\n5\n624.264068712 424.264068712 0.000000000\n|~\nP\n2\n724.264068712 124.264068712 0.000000000\n|~\nP\n6\n724.264068712 724.264068712 0.000000000\n|~\n##~~\n#~33\n\n1 24 0\n0\n0.000000000 0.000000000 1.000000000\n0.000000000 0.000000000 0.000000000\n724.264068712 848.528137424 0.000000000\n275.546406035 424.264068712 0.000000000\n294860.320115468\n0\n##~~\n#~331\nARC\n1 0\n3 1 2\n1\n|~\nARC\n1 0\n5 2 4\n-1\n|~\nARC\n1 0\n5 4 6\n-1\n|~\nARC\n1 0\n3 6 1\n1\n|~\n##~~\n#~KONT_END\n#~END\n#~EOF\n';
const file = GeoReader.read(geo);
const svg = new SvgWriter().toSvg(file);
console.log(svg);
```

## Development

Run `yarn` to setup project and install all dependencies.

Run `yarn test` to run all tests.

Run `yarn lint` to check for linting issues.

Run `yarn build` to build.

## License

All rights reserved to ScaleNC GmbH.

Source Code and Binaries licensed under BSD-3-Clause.
