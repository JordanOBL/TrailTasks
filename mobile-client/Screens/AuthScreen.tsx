import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
interface Props {
  form?: string;

  handleFormChange?: () => void;
}
const AuthScreen = ({ form, handleFormChange }: Props ) => {
 const onFormChange = handleFormChange ?? (() => {});
 if (form === 'login') {
   return <LoginScreen handleFormChange={onFormChange} />;
 } else {
   return <RegisterScreen handleFormChange={onFormChange} />;
 } 
};

export default AuthScreen;
