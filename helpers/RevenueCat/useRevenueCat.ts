import {useState, useEffect} from 'react';
import {Platform} from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
} from 'react-native-purchases';

const APIKeys = {
  apple: 'appl_lUErcJwyCLTUHuBLXxzHcbsgLdm',
  google: '',
};
const typesOfMemberships = {
  monthly: 'proMonthly',
  annually: 'proAnnual',
};
const useRevenueCat = () => {
  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  //this tells us if user is pro or not
  const isProMember =
    customerInfo?.activeSubscriptions.includes(typesOfMemberships.monthly) ||
    customerInfo?.activeSubscriptions.includes(typesOfMemberships.annually);

  useEffect(() => {
    const fetchData = async () => {
      Purchases.setDebugLogsEnabled(true);

      if (Platform.OS === 'android') {
        await Purchases.configure({apiKey: APIKeys.google});
      } else {
        await Purchases.configure({apiKey: APIKeys.apple});
      }

      const offerings = await Purchases.getOfferings();
      const customerInfo = await Purchases.getCustomerInfo();
      setCurrentOffering(offerings.current);
      setCustomerInfo(customerInfo);
    };
    fetchData().catch(console.error)
  }, []);

  useEffect(() => {
    const customerInfoUpdated = async (purchaserInfo:CustomerInfo) =>
    {
      setCustomerInfo(purchaserInfo)
    }
    Purchases.addCustomerInfoUpdateListener(customerInfoUpdated)
  }, []);

  return {currentOffering, customerInfo, isProMember}
};

export default useRevenueCat;
