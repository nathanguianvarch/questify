import type { ConfigContext, ExpoConfig } from 'expo/config';

const IS_DEV = process.env.APP_VARIANT === 'development';

const getAppName = (): string => IS_DEV ? 'Questify (Dev)' : 'Questify';
const getBundleId = (): string => IS_DEV ? 'com.nathanguianvarch.questify.dev' : 'com.nathanguianvarch.questify';
const getScheme = (): string => IS_DEV ? 'questify-dev' : 'questify';
const getIcon = (): string => IS_DEV ? './assets/images/icon-dev.png' : './assets/images/icon.png';


export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'questify',
  scheme: getScheme(),
  orientation: "portrait",
  version: "0.0.1",
  platforms: ["ios", "android"],
  userInterfaceStyle: "dark",
  ios: {
    ...config.ios,
    bundleIdentifier: getBundleId(),
    appleTeamId: "BQ55NP645U",
    icon: getIcon(),
  },
  android: {
    ...config.android,
    package: getBundleId(),
    icon: getIcon(),
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        "image": "./assets/images/splash-icon.png",
        "imageWidth": 200,
        "resizeMode": "contain"
      }
    ],
    "expo-secure-store",
    "expo-web-browser",
    "expo-audio",
    "expo-asset",
    "expo-font",
    "expo-image",
    "expo-status-bar"
  ]
})