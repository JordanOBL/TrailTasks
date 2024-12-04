import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
} from 'react-native-purchases';

const APIKeys = {
  apple: 'appl_lUErcJwyCLTUHuBLXxzHcbsgLdm',
  google: 'goog_QpLqbTzTPpaMLprBaGAhxbhpiwt',
};
const typesOfMemberships = {
  monthly: 'proMonthly',
  annually: 'proAnnual'
};

interface Props {
  userId: string;
}

const useRevenueCat = ({ userId }: Props) => {
  const [currentOffering, setCurrentOffering] = useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isProMember, setIsProMember] = useState<boolean>(false);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    const configurePurchases = async () => {
      try {
        await Purchases.setDebugLogsEnabled(true);
        await Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

        const apiKey = Platform.OS === 'android' ? APIKeys.google : APIKeys.apple;
        Purchases.configure({apiKey, appUserID: userId});

        setIsConfigured(true); // Set configuration as complete
      } catch (error) {
        console.error('Error configuring Purchases:', error);
      }
    };

    configurePurchases().catch(e => console.error('error in revcat se effect for config purchases', e));
  }, [userId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isConfigured) return; // Ensure SDK is configured before proceeding

      try {
        const offerings = await Purchases.getOfferings();
        setCurrentOffering(offerings.current);

        const customerInfo = await Purchases.getCustomerInfo();
        setCustomerInfo(customerInfo);

        const proMember =
          customerInfo?.activeSubscriptions.includes(typesOfMemberships.monthly) ||
          customerInfo?.activeSubscriptions.includes(typesOfMemberships.annually);
        setIsProMember(proMember);
      } catch (error) {
        console.error('Error fetching data in useRevenueCat:', error);
      }
    };

    fetchData().catch(e => console.error('Error in revcat use effect for fetchdata', e));
  }, [isConfigured]);

  useEffect(() => {
    const customerInfoUpdated = async (purchaserInfo: CustomerInfo) => {
      setCustomerInfo(purchaserInfo);

      const proMember =
        purchaserInfo?.activeSubscriptions.includes(typesOfMemberships.monthly) ||
        purchaserInfo?.activeSubscriptions.includes(typesOfMemberships.annually);
      setIsProMember(proMember);
    };

    const removeListener = Purchases.addCustomerInfoUpdateListener(customerInfoUpdated);

    return () => {
      // @ts-ignore
      removeListener();
    };
  }, []);

  return { currentOffering, customerInfo, isProMember };
};

export default useRevenueCat;

