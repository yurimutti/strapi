/// <reference types="@strapi/utils" />
import type { Strapi as StrapiInterface } from './types/core';

declare module 'koa' {
  interface Response {
    _explicitStatus: boolean;
  }
}

declare global {
  namespace Strapi {
    /**
     * Global shorthand to access the `StrapiInterface` type
     */
    type Strapi = StrapiInterface;
  }

  /**
   * Strapi global variable definition
   **/
  export const strapi: StrapiInterface;

  /**
   * Adds the strapi global variable to the NodeJS Global interface
   */
  export interface Global {
    strapi: StrapiInterface;
  }
}
