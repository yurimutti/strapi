import Strapi from './Strapi';

import * as factories from './factories';
import compile from './compile';

export * from './types';

Strapi.factories = factories;
Strapi.compile = compile;

export = Strapi;
