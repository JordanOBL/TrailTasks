
import NetInfo from '@react-native-community/netinfo';
import handleError from "../ErrorHandler";

const checkInternetConnection = async () => {
  try {
    const connection = await NetInfo.fetch();
    console.debug("connection", connection)
    return {
      isConnected: connection.isConnected,
    };
  } catch (err) {
    handleError(err, "checkInternetConnection");
    return {
      isConnected: false,
    };
  }
};

export default checkInternetConnection;
