import {StyleSheet, Text, View} from 'react-native';
import Register from '../components/Register';
import React from 'react';
interface Props {
  setUser: React.Dispatch<React.SetStateAction<any>>;
}
const RegisterScreen = ({setUser}: Props) => {
  return (
    <View style={styles.container}>
      <Text>RegisterScreen</Text>
      <Register setUser={setUser} />
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
});
