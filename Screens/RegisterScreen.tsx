import {StyleSheet, Text, View} from 'react-native';
import Register from '../components/Register';
import React from 'react';
interface Props {
  setUserId: React.Dispatch<React.SetStateAction<any>>;
  setisRegistering: React.Dispatch<React.SetStateAction<any>>;
  isRegistering: boolean;
}
const RegisterScreen = ({setUserId, setisRegistering, isRegistering}: Props) => {
  return (
    <View style={styles.container}>
      <Register
        setUserId={setUserId}
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
