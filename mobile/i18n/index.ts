// i18next réexporte ses méthodes d'instance en exports nommés ; on passe bien
// par l'instance par défaut ici, la règle n'a rien à signaler.
/* eslint-disable import/no-named-as-default-member */
import { getLocales } from "expo-localization";
import { getItemAsync, setItemAsync } from "expo-secure-store";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import fr from "./locales/fr";

export const SUPPORTED_LANGUAGES = ["fr", "en"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  fr: "Français",
  en: "English",
};

const FALLBACK_LANGUAGE: SupportedLanguage = "en";

export const isSupportedLanguage = (
  value: string | null | undefined,
): value is SupportedLanguage =>
  SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);

// Première langue du téléphone qu'on sait parler, sinon l'anglais.
const getDeviceLanguage = (): SupportedLanguage => {
  for (const locale of getLocales()) {
    if (isSupportedLanguage(locale.languageCode)) return locale.languageCode;
  }
  return FALLBACK_LANGUAGE;
};

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: getDeviceLanguage(),
  fallbackLng: FALLBACK_LANGUAGE,
  // React échappe déjà les valeurs interpolées.
  interpolation: { escapeValue: false },
});

const LANGUAGE_STORAGE_KEY = "language";

// Applique le choix manuel de l'utilisateur s'il en a fait un. À appeler avant
// le premier rendu, sinon la langue de l'appareil s'affiche brièvement.
export const restoreStoredLanguage = async () => {
  const storedLanguage = await getItemAsync(LANGUAGE_STORAGE_KEY);
  if (isSupportedLanguage(storedLanguage) && storedLanguage !== i18n.language) {
    await i18n.changeLanguage(storedLanguage);
  }
};

export const setLanguage = async (language: SupportedLanguage) => {
  await i18n.changeLanguage(language);
  await setItemAsync(LANGUAGE_STORAGE_KEY, language);
};

export default i18n;
