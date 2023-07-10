import { Vector } from './Vector';

export const VERSIONS = {
  V1_01: '1.01',
  V1_02: '1.02',
  V1_03: '1.03',

  get current(): string {
    return this.V1_03;
  },

  isV1_03_orLater(version: string): boolean {
    return version === this.V1_03;
  },

  includes(version: string): boolean {
    return version === this.V1_01 || version === this.V1_02 || version === this.V1_03;
  },
};

export interface Header {
  id?: string;
  version: string;
  revision: number;
  date: string;
  min: Vector;
  max: Vector;
  area: number;
  unit: number;
  tolerance: number;
  is3D: number;
  partsCount: number;
  subHeaderId?: string;
  name?: string;
  description?: string;
  customer?: string;
  author?: string;
  orderID?: string;
  material?: string;
  sheetThickness?: number;
  processingRule?: string;
  processingTable?: string;
  machineName?: string;
  isRotatable?: number;
  isGoodForMiniNests?: number;
  repetitionCount?: number;
  isGoodForTwinline?: number;
  shouldNestInBlocks?: number;
  columnsCountInBlock?: number;
  rowsCountInBlock?: number;
  rollingDirection?: number;
  isAssemblyPart?: number;
  assemblyName?: string;
}
