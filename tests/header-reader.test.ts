import { expect } from 'chai';
import { Header, VERSIONS } from '../src/model/header';
import { HeaderReader } from '../src/persistency/header-reader';
import { Parser } from '../src/persistency/parser';

describe('test HeaderReader', () => {

  const makeValidHeaderText = (version: string) => `${version}
4
02.06.2015
0.000000000 0.000000000 0.000000000
180.000000000 500.000000000 0.000000000
74166.693744970
1
0.001000000
0
1
##~~
#~11






0.000000000



0
0
0
0
0
0
0
0
0

##~~
#~END
...`;

  it('should read expected', () => {
    const reader = new HeaderReader(new Parser(makeValidHeaderText(VERSIONS.V1_03)));
    const header = reader.read();
    expect(header).to.eql({
      area: 74166.69374497,
      assemblyName: '',
      author: '',
      columnsCountInBlock: 0,
      customer: '',
      date: '02.06.2015',
      description: '',
      is3D: 0,
      isAssemblyPart: 0,
      isGoodForMiniNests: 0,
      isGoodForTwinline: 0,
      isRotatable: 0,
      machineName: '',
      material: '',
      min: { x: 0, y: 0, z: 0 },
      max: { x: 180, y: 500, z: 0 },
      name: '',
      orderID: '',
      partsCount: 1,
      processingRule: '',
      processingTable: '',
      repetitionCount: 0,
      revision: 4,
      rollingDirection: 0,
      rowsCountInBlock: 0,
      sheetThickness: 0,
      shouldNestInBlocks: 0,
      tolerance: 0.001,
      unit: 1,
      version: VERSIONS.V1_03,
    } as Header);
  });

  it('should throw for unknown version', () => {
    const reader = new HeaderReader(new Parser(makeValidHeaderText('1.05')));
    expect(() => reader.read()).throws(/Unknown GEO version/);
  });

});
