'use strict';

const path = require('path');
// const { resolveConfigOptions } = require('@strapi/typescript-utils');
const browserslistToEsbuild = require('browserslist-to-esbuild');

const { parseExports } = require('../utils/pkg');

/**
 * @typedef {Object} BuildContextArgs
 * @property {string} cwd
 * @property {import('../utils/pkg').ExtMap} extMap
 * @property {import('../utils/logger').Logger} logger
 * @property {import('../utils/pkg').PackageJson} pkg
 * @property {string} tsconfigPath
 */

/**
 * @typedef {Object} BuildContext
 * @property {string} cwd
 * @property {import('../utils/pkg').Export[]} exports
 * @property {string[]} external
 * @property {import('../utils/pkg').ExtMap} extMap
 * @property {import('../utils/logger').Logger} logger
 * @property {import('../utils/pkg').PackageJson} pkg
 * @property {string} target
 * @property {object} ts
 * @property {string} ts.configPath
 */

const DEFAULT_BROWSERS_LIST_CONFIG = [
  'last 3 major versions',
  'Firefox ESR',
  'last 2 Opera  versions',
  'not dead',
  'node 16.0.0',
];

/**
 * @description
 *
 * @type {(args: BuildContextArgs) => Promise<BuildContext>}
 */
const createBuildContext = async ({ cwd, extMap, logger, pkg, tsconfigPath }) => {
  const target = browserslistToEsbuild(pkg.browserslist ?? DEFAULT_BROWSERS_LIST_CONFIG);

  const exports = parseExports({ extMap, pkg }).reduce((acc, x) => {
    const { _path: exportPath, ...exportEntry } = x;

    return { ...acc, [exportPath]: exportEntry };
  }, {});

  const external = [
    ...(pkg.dependencies ? Object.keys(pkg.dependencies) : []),
    ...(pkg.peerDependencies ? Object.keys(pkg.peerDependencies) : []),
  ];

  const outputPaths = Object.values(exports)
    .flatMap((exportEntry) => {
      return [exportEntry.import, exportEntry.require].filter(Boolean);
    })
    .map((p) => path.resolve(cwd, p));

  const distPath = findCommonDirPath(outputPaths);

  if (distPath === cwd) {
    throw new Error(
      'all output files must share a common parent directory which is not the root package directory'
    );
  }

  if (!distPath) {
    throw new Error("could not detect 'dist' path");
  }

  return {
    logger,
    cwd,
    pkg,
    exports,
    external,
    distPath,
    target,
    extMap,
    ts: {
      configPath: tsconfigPath,
    },
  };
};

/**
 * @type {(containerPath: string, itemPath: string) => boolean}
 */
const pathContains = (containerPath, itemPath) => {
  return !path.relative(containerPath, itemPath).startsWith('..');
};

/**
 * @type {(filePaths: string[]) => string | undefined}
 */
const findCommonDirPath = (filePaths) => {
  /**
   * @type {string | undefined}
   */
  let commonPath;

  for (const filePath of filePaths) {
    let dirPath = path.dirname(filePath);

    if (!commonPath) {
      commonPath = dirPath;
      // eslint-disable-next-line no-continue
      continue;
    }

    while (dirPath !== commonPath) {
      dirPath = path.dirname(dirPath);

      if (dirPath === commonPath) {
        break;
      }

      if (pathContains(dirPath, commonPath)) {
        commonPath = dirPath;
        break;
      }

      if (dirPath === '.') return undefined;
    }
  }

  return commonPath;
};

/**
 * @type {import('./tasks/vite').ViteTask} BuildTask
 */

/**
 * @description
 *
 * @type {(args: BuildContext) => Promise<BuildTask[]>}
 */
const createBuildTasks = async (ctx) => {
  console.log(ctx);

  /**
   * @type {BuildTask[]}
   */
  const tasks = [];

  /**
   * @type {import('./tasks/dts').DtsTask}
   */
  // const dtsTask = {};

  /**
   * @type {Record<string, import('./tasks/vite').ViteTask>}
   */
  const viteTasks = [];

  const createViteTask = (format, { entry, output }) => {
    viteTasks.push({
      type: 'build:js',
      format,
      entry: [entry],
      output,
    });
  };

  const exps = Object.entries(ctx.exports).map(([exportPath, exportEntry]) => ({
    ...exportEntry,
    _path: exportPath,
  }));

  for (const exp of exps) {
    if (exp.types) {
      /**
       * register DTS task
       */
    }

    if (exp.require) {
      /**
       * register CJS task
       */
      createViteTask('cjs', {
        entry: exp.source,
        output: exp.require,
      });
    }

    if (exp.import) {
      /**
       * register ESM task
       */
      createViteTask('es', {
        entry: exp.source,
        output: exp.import,
      });
    }
  }

  tasks.push(...viteTasks);

  return tasks;
};

module.exports = {
  createBuildContext,
  createBuildTasks,
};
