'use strict';

const { join, resolve, sep, posix } = require('path');
const fs = require('fs');
// eslint-disable-next-line import/no-extraneous-dependencies
const glob = require('glob');

const getPlugins = (pluginsWhitelist) => {
  const rootPath = resolve(__dirname, '..', join('..', '..', '..', 'packages'));
  /**
   * So `glob` only supports '/' as a path separator, so we need to replace
   * the path separator for the current OS with '/'. e.g. on windows it's `\`.
   *
   * see https://github.com/isaacs/node-glob/#windows for more information
   *
   * and see https://github.com/isaacs/node-glob/issues/467#issuecomment-1114240501 for the recommended fix.
   */
  let corePath = join(rootPath, 'core', '*');
  let pluginsPath = join(rootPath, 'plugins', '*');

  if (process.platform === 'win32') {
    corePath = corePath.split(sep).join(posix.sep);
    pluginsPath = pluginsPath.split(sep).join(posix.sep);
  }

  const corePackageDirs = glob.sync(corePath);
  const pluginsPackageDirs = glob.sync(pluginsPath);

  const plugins = [...corePackageDirs, ...pluginsPackageDirs]
    .map((directory) => {
      const isCoreAdmin = directory.includes('packages/core/admin');

      if (isCoreAdmin) {
        return null;
      }

      const { name, strapi } = require(join(directory, 'package.json'));

      /**
       * this will remove any of our packages that are
       * not actually plugins for the application
       */
      if (!strapi) {
        return null;
      }

      /**
       * we want the name of the node_module
       */
      return {
        pathToPlugin: name,
        name: strapi.name,
        info: { ...strapi, packageName: name },
        directory,
      };
    })
    .filter((plugin) => {
      if (!plugin) {
        return false;
      }

      try {
        const isLocalPluginWithLegacyAdminFile = fs.existsSync(
          resolve(`${plugin.pathToPlugin}/strapi-admin.js`)
        );

        if (!isLocalPluginWithLegacyAdminFile) {
          const isModulewithLegacyAdminFile = require.resolve(
            `${plugin.pathToPlugin}/strapi-admin.js`
          );

          return isModulewithLegacyAdminFile;
        }

        return isLocalPluginWithLegacyAdminFile;
      } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
          /**
           * the plugin does not contain FE code, so we
           * don't want to import it anyway
           */
          return false;
        }

        throw err;
      }
    });

  if (Array.isArray(pluginsWhitelist)) {
    return plugins.filter((plugin) => pluginsWhitelist.includes(plugin.pathToPlugin));
  }

  return plugins;
};

module.exports = { getPlugins };
