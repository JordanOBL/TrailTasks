import Config from 'react-native-config';
import {resolveEnvironment} from './resolveEnvironment';

// Validate once, at import/startup, before any API request can use invalid config.
export const environment = resolveEnvironment(Config);
export const {APP_ENV, API_BASE_URL} = environment;
