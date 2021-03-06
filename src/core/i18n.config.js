import i18n from 'i18next';
import detector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { USER_PREFERENCES_LOCALSTORAGE_KEY } from 'Constants';
import resources from './i18n';

i18n
  .use(detector)
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en', // use en if detected lng is not available
    saveMissing: true, // send not translated keys to endpoint
    keySeparator: false, // we do not use keys in form messages.welcome
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

const { parse, stringify } = JSON;

i18n.on('languageChanged', (language) => {
  const userPreferences = parse(localStorage.getItem(USER_PREFERENCES_LOCALSTORAGE_KEY) || '{}');
  localStorage.setItem(
    USER_PREFERENCES_LOCALSTORAGE_KEY,
    stringify({ ...userPreferences, language })
  );
});

const userPreferences = parse(localStorage.getItem(USER_PREFERENCES_LOCALSTORAGE_KEY) || '{}');
const preferredLanguage = userPreferences.language;

if (preferredLanguage) {
  i18n.changeLanguage(preferredLanguage);
}

export default i18n;
