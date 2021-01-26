import { Header } from './Header';
import { Part } from './Part';

export interface GeoFile {
  header: Header;
  parts: Part[];
}
