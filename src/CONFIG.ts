import type {NativeConfig} from 'react-native-config';
import Config from 'react-native-config';

// react-native-config doesn't trim whitespace on iOS for some reason so we
// add a trim() call to prevent headaches
const get = (config: NativeConfig, key: string, defaultValue: string): string => (config?.[key] ?? defaultValue).trim();

// Set default values to contributor friendly values to make development work out of the box without an .env file
const useNgrok = get(Config, 'USE_NGROK', 'false') === 'true';
const googleGeolocationAPIKey = get(Config, 'GCP_GEOLOCATION_API_KEY', '');

// Ngrok helps us avoid many of our cross-domain issues with connecting to our API
// and is required for viewing images on mobile and for developing on android
// To enable, set the USE_NGROK value to true in .env and update the NGROK_URL
export default {
    APP_NAME: 'NewExpensify',
    AUTH_TOKEN_EXPIRATION_TIME: 1000 * 60 * 90,
    EXPENSIFY: {
        // The DEFAULT API is the API used by most environments, except staging, where we use STAGING (defined below)
        // The "staging toggle" in settings toggles between DEFAULT and STAGING APIs
        // On both STAGING and PROD this (DEFAULT) address points to production
        // On DEV it can be configured through ENV settings and can be a proxy or ngrok address (defaults to PROD)
        // Usually you don't need to use this URL directly - prefer `ApiUtils.getApiRoot()`
        PARTNER_NAME: get(Config, 'EXPENSIFY_PARTNER_NAME', 'chat-expensify-com'),
        PARTNER_PASSWORD: get(Config, 'EXPENSIFY_PARTNER_PASSWORD', 'e21965746fd75f82bb66'),
        EXPENSIFY_CASH_REFERER: 'ecash',
        CONCIERGE_URL_PATHNAME: 'concierge/',
        DEVPORTAL_URL_PATHNAME: '_devportal/',
    },
    PUSHER: {
        APP_KEY: get(Config, 'PUSHER_APP_KEY', '268df511a204fbb60884'),
        CLUSTER: 'mt1',
    },
    SITE_TITLE: 'New Expensify',
    FAVICON: {
        DEFAULT: '/favicon.png',
        UNREAD: '/favicon-unread.png',
    },
    CAPTURE_METRICS: get(Config, 'CAPTURE_METRICS', 'false') === 'true',
    ONYX_METRICS: get(Config, 'ONYX_METRICS', 'false') === 'true',
    DEV_PORT: 8082,
    E2E_TESTING: get(Config, 'E2E_TESTING', 'false') === 'true',
    SEND_CRASH_REPORTS: get(Config, 'SEND_CRASH_REPORTS', 'false') === 'true',
    APPLE_SIGN_IN: {
        SERVICE_ID: 'com.chat.expensify.chat.AppleSignIn',
    },
    GOOGLE_SIGN_IN: {
        // cspell:disable-next-line
        WEB_CLIENT_ID: '921154746561-gpsoaqgqfuqrfsjdf8l7vohfkfj7b9up.apps.googleusercontent.com',
        IOS_CLIENT_ID: '921154746561-s3uqn2oe4m85tufi6mqflbfbuajrm2i3.apps.googleusercontent.com',
    },
    GCP_GEOLOCATION_API_KEY: googleGeolocationAPIKey,
    FIREBASE_WEB_CONFIG: {
        apiKey: get(Config, 'FB_API_KEY', 'AIzaSyBrLKgCuo6Vem6Xi5RPokdumssW8HaWBow'),
        appId: get(Config, 'FB_APP_ID', '1:1008697809946:web:ca25268d2645fc285445a3'),
        projectId: get(Config, 'FB_PROJECT_ID', 'expensify-mobile-app'),
    },
    // to read more about StrictMode see: contributingGuides/STRICT_MODE.md
    USE_REACT_STRICT_MODE_IN_DEV: false,
    ELECTRON_DISABLE_SECURITY_WARNINGS: 'true',
    IS_TEST_ENV: 'test',
    // Added new config line for demonstration
    NEW_CONFIG_LINE: 'demo-config',
} as const;
