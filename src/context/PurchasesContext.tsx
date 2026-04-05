import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import Purchases, { type CustomerInfo } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import Constants from 'expo-constants';
import { ENTITLEMENT_ID } from '@/src/services/purchases';

const isExpoGo = Constants.appOwnership === 'expo';

// ─── Types ────────────────────────────────────────────────────────────────────
export { PAYWALL_RESULT };

type PurchasesContextValue = {
  /** True when the user has an active "Crimson Pro" entitlement */
  isPro: boolean;
  /** True while the initial customer info fetch is in flight */
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  /** Present the RC paywall unconditionally */
  presentPaywall: () => Promise<PAYWALL_RESULT>;
  /** Present the RC paywall only if the user does NOT have Crimson Pro */
  presentPaywallIfNeeded: () => Promise<PAYWALL_RESULT>;
  /** Open the RC Customer Center (manage / cancel / restore from within app) */
  presentCustomerCenter: () => Promise<void>;
  /** Restore previous purchases and refresh entitlement state */
  restorePurchases: () => Promise<CustomerInfo | null>;
  /** Force-refresh customer info from RevenueCat */
  refreshCustomerInfo: () => Promise<void>;
};

// ─── Context ─────────────────────────────────────────────────────────────────
const PurchasesContext = createContext<PurchasesContextValue | null>(null);

// ─── Helper ──────────────────────────────────────────────────────────────────
function resolveIsPro(info: CustomerInfo | null): boolean {
  if (!info) return false;
  return !!info.entitlements.active[ENTITLEMENT_ID];
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function PurchasesProvider({ children }: { children: React.ReactNode }) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isLoading, setIsLoading]       = useState(true);

  const isPro = resolveIsPro(customerInfo);

  useEffect(() => {
    if (isExpoGo) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    Purchases.getCustomerInfo()
      .then((info) => { if (mounted) setCustomerInfo(info); })
      .catch(console.error)
      .finally(() => { if (mounted) setIsLoading(false); });

    const listener = Purchases.addCustomerInfoUpdateListener((info) => {
      if (mounted) setCustomerInfo(info);
    });

    return () => {
      mounted = false;
      listener.remove();
    };
  }, []);

  // ── Paywall ────────────────────────────────────────────────────────────────
  const presentPaywall = useCallback(async (): Promise<PAYWALL_RESULT> => {
    try {
      return await RevenueCatUI.presentPaywall();
    } catch (e) {
      console.error('[RC] presentPaywall error:', e);
      return PAYWALL_RESULT.ERROR;
    }
  }, []);

  const presentPaywallIfNeeded = useCallback(async (): Promise<PAYWALL_RESULT> => {
    try {
      return await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: ENTITLEMENT_ID,
      });
    } catch (e) {
      console.error('[RC] presentPaywallIfNeeded error:', e);
      return PAYWALL_RESULT.ERROR;
    }
  }, []);

  // ── Customer Center ────────────────────────────────────────────────────────
  const presentCustomerCenter = useCallback(async (): Promise<void> => {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (e) {
      console.error('[RC] presentCustomerCenter error:', e);
    }
  }, []);

  // ── Restore ────────────────────────────────────────────────────────────────
  const restorePurchases = useCallback(async (): Promise<CustomerInfo | null> => {
    try {
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);
      return info;
    } catch (e) {
      console.error('[RC] restorePurchases error:', e);
      return null;
    }
  }, []);

  // ── Refresh ────────────────────────────────────────────────────────────────
  const refreshCustomerInfo = useCallback(async (): Promise<void> => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
    } catch (e) {
      console.error('[RC] refreshCustomerInfo error:', e);
    }
  }, []);

  return (
    <PurchasesContext.Provider
      value={{
        isPro,
        isLoading,
        customerInfo,
        presentPaywall,
        presentPaywallIfNeeded,
        presentCustomerCenter,
        restorePurchases,
        refreshCustomerInfo,
      }}
    >
      {children}
    </PurchasesContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
export function usePurchases(): PurchasesContextValue {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error('usePurchases must be used inside <PurchasesProvider>');
  return ctx;
}

/** Convenience hook — returns true when the user has Crimson Pro */
export function useIsPro(): boolean {
  return usePurchases().isPro;
}
