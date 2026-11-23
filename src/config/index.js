import { getAppConfig, validateConfig } from './app-config.js';

export const config = getAppConfig();
export const configValidation = validateConfig(config);

export { getAppConfig, validateConfig };
