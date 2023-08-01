import { AsyncLocalStorage } from 'async_hooks';

const storage = new AsyncLocalStorage();

const requestCtx = {
  async run(store: unknown, cb: () => unknown) {
    return storage.run(store, cb);
  },

  get() {
    return storage.getStore();
  },
};

export default requestCtx;
