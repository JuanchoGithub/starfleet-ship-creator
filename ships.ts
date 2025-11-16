import { ShipParameters } from './types';
import { stargazerClassShip } from './ships/stargazer';
import { advancedEnterpriseShip } from './ships/advancedEnterprise';
import { galaxyClassShip } from './ships/galaxyClass';
import { enterpriseNX01Ship } from './ships/enterpriseNX01';
import { voyagerShip } from './ships/voyager';
import { excelsiorClassShip } from './ships/excelsior';
import { belisariusShip } from './ships/belisarius';

export const STOCK_SHIPS: { [name: string]: ShipParameters } = {
  'Stargazer Class': stargazerClassShip,
  'Advanced Enterprise': advancedEnterpriseShip,
  'Galaxy Class': galaxyClassShip,
  'Enterprise NX-01': enterpriseNX01Ship,
  'Voyager': voyagerShip,
  'Excelsior Class': excelsiorClassShip,
  'Belisarius Class': belisariusShip,
};
