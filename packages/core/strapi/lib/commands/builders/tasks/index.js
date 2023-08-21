'use strict';

const { viteTask } = require('./vite');

/**
 * @template Task
 * @param {Task}
 * @returns {Task}
 *
 * @typedef {Object} TaskHandler
 * @property {(ctx: import("../packages").BuildContext, task: Task) => import('ora').Ora} print
 * @property {(ctx: import("../packages").BuildContext, task: Task) => Promise<void>} run
 * @property {(ctx: import("../packages").BuildContext, task: Task) => Promise<void>} success
 * @property {(ctx: import("../packages").BuildContext, task: Task, err: unknown) => Promise<void>} fail
 */

/**
 * @type {{ "build:js": TaskHandler<import("./vite").ViteTask> }}}
 */
const buildTaskHandlers = {
  'build:js': viteTask,
};

module.exports = {
  buildTaskHandlers,
};
