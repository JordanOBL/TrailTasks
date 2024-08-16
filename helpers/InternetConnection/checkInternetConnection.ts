
import NetInfo from '@react-native-community/netinfo';

const checkInternetConnection = async () => {
  try {
    const connection = await NetInfo.fetch();
    console.debug("connection", connection)
    return {
      isConnected: connection.isConnected,
    };
  } catch (error) {
    console.error('Error checking internet connection:', error);
    return {
      isConnected: false,
    };
  }
};

export default checkInternetConnection;
