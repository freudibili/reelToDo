import i18next from "i18next";
import { initReactI18next } from "react-i18next";

import commonEn from "./locales/common.en.json";
import commonFr from "./locales/common.fr.json";
import authEn from "@features/auth/locales/en.json";
import authFr from "@features/auth/locales/fr.json";
import homeEn from "@features/home/locales/en.json";
import homeFr from "@features/home/locales/fr.json";
import activitiesEn from "@features/activities/locales/en.json";
import activitiesFr from "@features/activities/locales/fr.json";
import importEn from "@features/import/locales/en.json";
import importFr from "@features/import/locales/fr.json";

i18next.use(initReactI18next).init({
  resources: {
    en: {
      common: commonEn,
      auth: authEn,
      home: homeEn,
      activities: activitiesEn,
      import: importEn,
    },
    fr: {
      common: commonFr,
      auth: authFr,
      home: homeFr,
      activities: activitiesFr,
      import: importFr,
    },
  },
  lng: "fr", // default language
  fallbackLng: "en",
  ns: ["common", "auth", "home", "activities", "import"],
  defaultNS: "common",
  interpolation: {
    escapeValue: false, // React already does escaping
  },
});

export default i18next;
