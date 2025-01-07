import React, { useState } from 'react';
import LoginScreen from './LoginScreen';
import RegisterScreen from './RegisterScreen';
interface Props {
  form?: string;

  handleFormChange?: () => void;
}
const AuthScreen = ({ form, handleFormChange }: Props ) => {
 if (form === 'login') {
   return <LoginScreen handleFormChange={handleFormChange} />;
 } else {
   return <RegisterScreen handleFormChange={handleFormChange} />;
 } 
};

export default AuthScreen;
