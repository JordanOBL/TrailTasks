
import NetInfo from '@react-native-community/netinfo';

const checkInternetConnection = async () => {
  try {
    const connection = await NetInfo.fetch();
    console.debug("connection", connection)
    return {connection};
  } catch (error) {
    console.error('Error checking internet connection:', error);
    return false;
  }
};

export default checkInternetConnection;
