import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Config from 'react-native-config';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

interface Props {
  userId?: string;
}

const ENTITLEMENT_ID = 'pro';

const hasProEntitlement = (info: CustomerInfo | null) =>
  !!info?.entitlements?.active?.[ENTITLEMENT_ID];

const getRevenueCatApiKey = () => (Platform.OS === 'android' ? Config.REVCAT_GOOGLE : Config.REVCAT_APPLE);

const useRevenueCat = ({ userId }: Props) => {
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isProMember, setIsProMember] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const applyCustomerInfo = useCallback((info: CustomerInfo | null) => {
    setCustomerInfo(info);
    setIsProMember(hasProEntitlement(info));
  }, []);

  const refreshCustomerInfo = useCallback(async () => {
    if (!isConfigured) return null;

    const info = await Purchases.getCustomerInfo();
    applyCustomerInfo(info);
    return info;
  }, [applyCustomerInfo, isConfigured]);

  useEffect(() => {
    let alive = true;

    const configurePurchases = async () => {
      setError('');
      setIsConfigured(false);

      if (!userId) {
        setLoading(false);
        setCurrentOffering(null);
        applyCustomerInfo(null);
        return;
      }

      const apiKey = getRevenueCatApiKey();
      if (!apiKey) {
        setLoading(false);
        setCurrentOffering(null);
        applyCustomerInfo(null);
        setError('Trail Tasks Pro is unavailable because RevenueCat is not configured for this build.');
        return;
      }

      try {
        setLoading(true);
        await Purchases.setDebugLogsEnabled(__DEV__);
        await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
        await Purchases.configure({ apiKey, appUserID: userId });

        if (alive) {
          setIsConfigured(true);
        }
      } catch (err) {
        if (alive) {
          setError(err instanceof Error ? err.message : 'Unable to configure RevenueCat.');
          setCurrentOffering(null);
          applyCustomerInfo(null);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    configurePurchases();

    return () => {
      alive = false;
    };
  }, [applyCustomerInfo, userId]);

  useEffect(() => {
    let alive = true;

    const fetchData = async () => {
      if (!isConfigured) return;

      try {
        setLoading(true);
        setError('');
        const [offerings, info] = await Promise.all([
          Purchases.getOfferings(),
          Purchases.getCustomerInfo(),
        ]);

        if (alive) {
          setCurrentOffering(offerings.current ?? null);
          applyCustomerInfo(info);
        }
      } catch (err) {
        if (alive) {
          setCurrentOffering(null);
          setError(err instanceof Error ? err.message : 'Unable to load subscription options.');
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      alive = false;
    };
  }, [applyCustomerInfo, isConfigured]);

  useEffect(() => {
    const removeListener: any = Purchases.addCustomerInfoUpdateListener(updatedInfo => {
      applyCustomerInfo(updatedInfo);
    });

    return () => {
      removeListener?.();
    };
  }, [applyCustomerInfo]);

  const purchasePackage = useCallback(
    async (selectedPackage: PurchasesPackage) => {
      setError('');
      setLoading(true);
      try {
        const { customerInfo: purchasedInfo } = await Purchases.purchasePackage(selectedPackage);
        applyCustomerInfo(purchasedInfo);
        return purchasedInfo;
      } catch (err: any) {
        if (!err?.userCancelled) {
          setError(err instanceof Error ? err.message : 'Unable to complete purchase.');
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [applyCustomerInfo],
  );

  const restorePurchases = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const restoredInfo = await Purchases.restorePurchases();
      applyCustomerInfo(restoredInfo);
      return restoredInfo;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to restore purchases.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [applyCustomerInfo]);

  return {
    currentOffering,
    customerInfo,
    isProMember,
    isConfigured,
    loading,
    error,
    purchasePackage,
    restorePurchases,
    refreshCustomerInfo,
  };
};

export default useRevenueCat;
export { ENTITLEMENT_ID, hasProEntitlement };
