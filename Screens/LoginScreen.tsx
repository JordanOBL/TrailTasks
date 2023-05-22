import {StyleSheet, Text, View} from 'react-native';
import Login from '../components/Login';
import React from 'react';
interface Props {
  setUser: React.Dispatch<React.SetStateAction<any>>;
}
const LoginScreen = ({setUser}: Props) => {
  return (
    <View style={styles.container}>
      <Text>LoginScreen</Text>
      <Login setUser={setUser} />
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
});
