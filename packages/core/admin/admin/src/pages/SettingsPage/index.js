import * as React from 'react';

import { Layout } from '@strapi/design-system';
import { LoadingIndicatorPage, useStrapiApp } from '@strapi/helper-plugin';
import { Helmet } from 'react-helmet';
import { useIntl } from 'react-intl';
import { Redirect, Route, Switch, useParams } from 'react-router-dom';

import { useSettingsMenu } from '../../hooks';
import { useEnterprise } from '../../hooks/useEnterprise';
import { createRoute } from '../../utils/createRoute';

import SettingsNav from './components/SettingsNav';
import { SETTINGS_ROUTES_CE } from './constants';
import ApplicationInfosPage from './pages/ApplicationInfosPage';

export function SettingsPage() {
  const { settingId } = useParams();
  const { settings } = useStrapiApp();
  const { formatMessage } = useIntl();
  const { isLoading, menu } = useSettingsMenu();
  const routes = useEnterprise(
    SETTINGS_ROUTES_CE,
    async () =>
      (await import('../../../../ee/admin/pages/SettingsPage/constants')).SETTINGS_ROUTES_EE,
    {
      combine(ceRoutes, eeRoutes) {
        return [...ceRoutes, ...eeRoutes];
      },
      defaultValue: [],
    }
  );

  const pluginSettingsRoutes = Object.values(settings).flatMap((section) =>
    section.links.map(({ Component, to, exact }) => {
      /**
       * Async components are deprecated and will be removed in v5.
       *
       * `Component` is an async function, which is passed as property of the
       * addSettingsLink() API during the plugin bootstrap step.
       *
       * Because of that we can't just render <Route component={Component} />,
       * but have to await the function.
       *
       */

      if (Component[Symbol.toStringTag] === 'AsyncFunction') {
        return createRoute(Component, to, exact);
      }

      /**
       *
       * Component is a loadable from React.lazy.
       *
       * In v6 this will become:
       *
       * ```
       *   <Route path="{to}" lazy={Component} />
       * ```
       *
       * and we can remove the conversation to a loadable in StrapiApp.
       */

      return (
        <Route key={to} path={to}>
          <Component />
        </Route>
      );
    })
  );

  // Since the useSettingsMenu hook can make API calls in order to check the links permissions
  // We need to add a loading state to prevent redirecting the user while permissions are being checked
  if (isLoading) {
    return <LoadingIndicatorPage />;
  }

  if (!settingId) {
    return <Redirect to="/settings/application-infos" />;
  }

  return (
    <Layout sideNav={<SettingsNav menu={menu} />}>
      <Helmet
        title={formatMessage({
          id: 'global.settings',
          defaultMessage: 'Settings',
        })}
      />

      <Switch>
        <Route path="/settings/application-infos" component={ApplicationInfosPage} exact />

        {routes.map(({ path, component }) => (
          <Route key={path} path={path} component={component} exact />
        ))}

        {pluginSettingsRoutes}
      </Switch>
    </Layout>
  );
}
