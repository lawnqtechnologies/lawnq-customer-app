import {Coords} from './Coords';
import {Extras} from './Extras';

export interface LocationData {
  coords: Coords;
  extras: Extras;
  mocked: boolean;
  timestamp: number;
}
