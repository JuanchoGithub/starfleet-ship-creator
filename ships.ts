import { ShipParameters } from './types';
import { stargazerClassShip } from './ships/stargazer';
import { advancedEnterpriseShip } from './ships/advancedEnterprise';
import { galaxyClassShip } from './ships/galaxyClass';
import { enterpriseNX01Ship } from './ships/enterpriseNX01';
import { aegisDreadnoughtShip } from './ships/aegisDreadnought';
import { voyagerShip } from './ships/voyager';

export const STOCK_SHIPS: { [name: string]: ShipParameters } = {
  'Stargazer Class': stargazerClassShip,
  'Advanced Enterprise': advancedEnterpriseShip,
  'Galaxy Class': galaxyClassShip,
  'Enterprise NX-01': enterpriseNX01Ship,
  'Aegis Class Dreadnought': aegisDreadnoughtShip,
  'Voyager': voyagerShip,
};