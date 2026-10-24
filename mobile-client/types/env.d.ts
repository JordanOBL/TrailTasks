// react-native-config is the only env loader. Values are optional until the
// resolver validates them; RevenueCat public SDK key names remain unchanged.
declare module 'react-native-config' {
  interface NativeConfig {
    APP_ENV?: string;
    API_BASE_URL?: string;
    REVCAT_GOOGLE?: string;
    REVCAT_APPLE?: string;
  }
  const Config: NativeConfig;
  export default Config;
}
