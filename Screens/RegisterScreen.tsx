import {StyleSheet, Text, View} from 'react-native';
import Register from '../components/Register';
import React from 'react';
interface Props {
  setUser: React.Dispatch<React.SetStateAction<any>>;
  setisRegistering: React.Dispatch<React.SetStateAction<any>>;
  isRegistering: boolean;
}
const RegisterScreen = ({setUser, setisRegistering, isRegistering}: Props) => {
  return (
    <View style={styles.container}>
      <Register
        setUser={setUser}
        setisRegistering={setisRegistering}
        isRegistering={isRegistering}
      />
    </View>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {flex: 1},
});
