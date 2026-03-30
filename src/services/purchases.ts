import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

// ─── API Keys ────────────────────────────────────────────────────────────────
const RC_API_KEY_IOS     = 'appl_txVuCBeueUUQGNzyraVpsAJtLjA';
const RC_API_KEY_ANDROID = 'YOUR_ANDROID_RC_KEY_HERE';

// ─── Constants ───────────────────────────────────────────────────────────────
export const ENTITLEMENT_ID = 'Crimson Pro';

export const OFFERING_IDS = {
  monthly: 'monthly',
  yearly:  'yearly',
} as const;

// ─── Initialization ──────────────────────────────────────────────────────────
export function initializePurchases() {
  if (Platform.OS === 'web') return;

  const apiKey = Platform.select({
    ios:     RC_API_KEY_IOS,
    android: RC_API_KEY_ANDROID,
  })!;

  Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.ERROR);
  Purchases.configure({ apiKey });
}
