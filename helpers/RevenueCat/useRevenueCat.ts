import {useState, useEffect} from 'react';
import {Platform} from 'react-native';
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
const useRevenueCat = ({userId}: Props) => {
  const [currentOffering, setCurrentOffering] =
    useState<PurchasesOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  //this tells us if user is pro or not
  const [isProMember, setIsProMember] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      //debug logs can be enabled or disabled by setting the Purchases.logLevel property before configuring Purchases.
      //Debug logs will provide detailed log output in Xcode or LogCat for what is going on behind the scenes and should be the first //thing you check if your app is behaving unexpectedly, and also to confirm there aren't any unhandled warnings or errors
      try {
        Purchases.setDebugLogsEnabled(true);
        Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

        const apiKey =
          Platform.OS === 'android' ? APIKeys.google : APIKeys.apple;
        Purchases.configure({apiKey, appUserID: userId});

        const offerings = await Purchases.getOfferings();
        setCurrentOffering(offerings.current);

        const customerInfo = await Purchases.getCustomerInfo();
        setCustomerInfo(customerInfo);

        const proMember =
          customerInfo?.activeSubscriptions.includes(
            typesOfMemberships.monthly
          ) ||
          customerInfo?.activeSubscriptions.includes(
            typesOfMemberships.annually
          );
        setIsProMember(proMember);
      } catch (error) {
        console.error('Error fetching in useRevenueCat():', error);
      }
    };
    fetchData().catch(console.error);
  }, [userId]);

  useEffect(() => {
    const customerInfoUpdated = async (purchaserInfo: CustomerInfo) => {
      setCustomerInfo(purchaserInfo);
    };
    Purchases.addCustomerInfoUpdateListener(customerInfoUpdated);
  }, []);

  return {currentOffering, customerInfo, isProMember};
};

export default useRevenueCat;
