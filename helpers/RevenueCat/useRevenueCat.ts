import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { Config } from 'react-native-config';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
} from 'react-native-purchases';

interface Props {
  userId: string;
}

const ENTITLEMENT_ID = 'pro';

const useRevenueCat = ({ userId }: Props) => {
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isProMember, setIsProMember] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  // 1. Configure Purchases
  useEffect(() => {
    const configurePurchases = async () => {
      try {
        await Purchases.setDebugLogsEnabled(true);
        await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

        const apiKey = Platform.OS === 'android' ? Config.REVCAT_GOOGLE : Config.REVCAT_APPLE;
        await Purchases.configure({ apiKey, appUserID: userId });

        setIsConfigured(true);
      } catch (error) {
        console.error('❌ Error configuring Purchases:', error);
      }
    };

    if (userId) {
      configurePurchases();
    }
  }, [userId]);

  // 2. Fetch Offerings and Customer Info
  useEffect(() => {
    const fetchData = async () => {
      if (!isConfigured) return;

      try {
        const offerings = await Purchases.getOfferings();
        setCurrentOffering(offerings.current);

        const info = await Purchases.getCustomerInfo();
        setCustomerInfo(info);
        setIsProMember(!!info.entitlements.active[ENTITLEMENT_ID]);
      } catch (error) {
        console.error('❌ Error fetching RevenueCat data:', error);
      }
    };

    fetchData();
  }, [isConfigured]);

  // 3. Listen for subscription changes
  useEffect(() => {
    const listener = Purchases.addCustomerInfoUpdateListener(async (updatedInfo) => {
      setCustomerInfo(updatedInfo);
      setIsProMember(!!updatedInfo.entitlements.active[ENTITLEMENT_ID]);
    });

    return () => {
      // @ts-ignore
      listener(); // remove listener
    };
  }, []);

  return {
    currentOffering,
    customerInfo,
    isProMember,
  };
};

export default useRevenueCat;

