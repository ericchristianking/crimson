import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

// ─── API Keys ────────────────────────────────────────────────────────────────
// Replace with your Android key when you add Android support.
const RC_API_KEY_IOS     = 'test_DvuEFWVAllgHedthtQykkApkDeF';
const RC_API_KEY_ANDROID = 'YOUR_ANDROID_RC_KEY_HERE';

// ─── Constants ───────────────────────────────────────────────────────────────
export const ENTITLEMENT_ID = 'Crimson Pro';

export const OFFERING_IDS = {
  monthly: 'monthly',
  yearly:  'yearly',
} as const;

// ─── Initialization ──────────────────────────────────────────────────────────
export function initializePurchases() {
  const apiKey = Platform.select({
    ios:     RC_API_KEY_IOS,
    android: RC_API_KEY_ANDROID,
    default: RC_API_KEY_IOS,
  })!;

  // Verbose logs in dev, errors only in production
  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);

  Purchases.configure({ apiKey });
}
