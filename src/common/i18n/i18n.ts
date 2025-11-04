import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: require('./en.json'),
      },
      fr: {
        translation: require('./fr.json'),
      },
    },
    lng: 'fr', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18next;