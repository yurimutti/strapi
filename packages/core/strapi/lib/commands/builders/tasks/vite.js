'use strict';

const path = require('path');
const { build } = require('vite');
const react = require('@vitejs/plugin-react');
const ora = require('ora');

/**
 * @internal
 *
 * @type {(ctx: import('../packages').BuildContext, task: ViteTask) => import('vite').UserConfig}
 */
const resolveViteConfig = (ctx, task) => {
  const { cwd, distPath, target, external, extMap, pkg } = ctx;
  const { entry, format, output } = task;
  const outputExt = extMap[pkg.type || 'commonjs'][format];
  console.log('task.output >>>>>>', task.output);
  console.log('');
  const outDir = path.relative(cwd, distPath);

  /**
   * @type {import('vite').InlineConfig}
   */
  const config = {
    configFile: false,
    root: cwd,
    mode: 'production',

    build: {
      emptyOutDir: false,
      target,
      outDir,
      lib: {
        entry,
        formats: [format],
        fileName() {
          return `${path.relative(outDir, output).replace(/\.[^/.]+$/, '')}${outputExt}`;
        },
      },
      rollupOptions: {
        external,
        output: {
          chunkFileNames() {
            const parts = outputExt.split('.');

            if (parts.length === 3) {
              return `_chunks/[name]-[hash].${parts[2]}`;
            }

            return `_chunks/[name]-[hash]${outputExt}`;
          },
        },
      },
    },
    plugins: [react()],
  };

  return config;
};

/**
 * @typedef {Object} ViteTask
 * @property {"build:js"} type
 * @property {string} entry
 * @property {string} format
 * @property {string} output
 */

/**
 * @type {import('./index').TaskHandler<ViteTask>}
 */
const viteTask = {
  print() {
    return ora('vite pls').start();
  },
  async run(ctx, task) {
    const config = resolveViteConfig(ctx, task);
    await build(config);
  },
  async success() {
    // noop
  },
  async fail() {
    // noop
  },
};

module.exports = {
  viteTask,
};
