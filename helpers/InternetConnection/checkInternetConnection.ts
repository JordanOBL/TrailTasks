import NetInfo from '@react-native-community/netinfo';
const checkInternetConnection = async () => {
  const connection = await NetInfo.fetch();
  return {connection}
};

export default checkInternetConnection;
