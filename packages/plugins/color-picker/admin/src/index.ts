import { prefixPluginTranslations } from '@strapi/helper-plugin';
import { Strapi } from '@strapi/strapi';

import { ColorPickerIcon } from './components/ColorPickerIcon';
import { pluginId } from './pluginId';
import { getTrad } from './utils/getTrad';

// eslint-disable-next-line import/no-default-export
export default {
  register(app: Strapi) {
    console.log('register');
    app.customFields.register({
      name: 'color',
      pluginId: 'color-picker',
      type: 'string',
      icon: ColorPickerIcon,
      intlLabel: {
        id: getTrad('color-picker.label'),
        defaultMessage: 'Color',
      },
      intlDescription: {
        id: getTrad('color-picker.description'),
        defaultMessage: 'Select any color',
      },
      components: {
        Input: async () =>
          import(
            /* webpackChunkName: "color-picker-input-component" */ './components/ColorPickerInput'
          ).then((module) => module.ColorPickerInput),
      },
      options: {
        advanced: [
          {
            intlLabel: {
              id: getTrad('color-picker.options.advanced.regex'),
              defaultMessage: 'RegExp pattern',
            },
            name: 'regex',
            type: 'text',
            defaultValue: '^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$',
            description: {
              id: getTrad('color-picker.options.advanced.regex.description'),
              defaultMessage: 'The text of the regular expression',
            },
          },
          {
            sectionTitle: {
              id: 'global.settings',
              defaultMessage: 'Settings',
            },
            items: [
              {
                name: 'required',
                type: 'checkbox',
                intlLabel: {
                  id: getTrad('color-picker.options.advanced.requiredField'),
                  defaultMessage: 'Required field',
                },
                description: {
                  id: getTrad('color-picker.options.advanced.requiredField.description'),
                  defaultMessage: "You won't be able to create an entry if this field is empty",
                },
              },
            ],
          },
        ],
      },
    });
  },
  async registerTrads({ locales }: { locales: string[] }) {
    const importedTrads = await Promise.all(
      locales.map(async (locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
