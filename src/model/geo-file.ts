import { Header } from './header';
import { Part } from './part';

export interface GeoFile {
  header: Header;
  parts: Part[];
}
