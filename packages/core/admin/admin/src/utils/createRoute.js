import * as React from 'react';

import { LoadingIndicatorPage, once } from '@strapi/helper-plugin';
import PropTypes from 'prop-types';
import { Route } from 'react-router-dom';

const warnOnce = once(console.warn);

const LazyComponent = ({ loadComponent }) => {
  const [Component, setComponent] = React.useState(null);

  React.useEffect(() => {
    async function load() {
      try {
        const loadedCompo = await loadComponent();

        setComponent(() => loadedCompo.default);
      } catch (err) {
        // silence
      }
    }

    load();
  }, [loadComponent]);

  if (Component) {
    return <Component />;
  }

  return <LoadingIndicatorPage />;
};

LazyComponent.propTypes = {
  loadComponent: PropTypes.func.isRequired,
};

/**
 *
 * @deprecated
 * @export
 */

export const createRoute = (Component, to, exact) => {
  warnOnce('`createRoute` is deprecated and will be removed.');

  return (
    <Route
      render={() => <LazyComponent loadComponent={Component} />}
      key={to}
      path={to}
      exact={exact || false}
    />
  );
};
