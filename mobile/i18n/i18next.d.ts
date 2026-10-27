import type fr from "./locales/fr";

// Rend `t()` typé : une clé inconnue ou mal orthographiée devient une erreur
// de compilation.
declare module "i18next" {
  interface CustomTypeOptions {
    resources: { translation: typeof fr };
  }
}
