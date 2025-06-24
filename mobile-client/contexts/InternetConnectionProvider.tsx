import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

const InternetConnectionContext = createContext();

export const InternetConnectionProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [ipAddress, setIpAddress] = useState(null);

  const updateConnectionStatus = (state) => {
    setIsConnected(state.isConnected);
    if (state.details && state.details.ipAddress) {
      setIpAddress(state.details.ipAddress);
    } else {
      setIpAddress(null);
    }
  };

  // Fetch connection state manually
  const refreshConnectionStatus = async () => {
    const state = await NetInfo.fetch();
    updateConnectionStatus(state);
  };

  useEffect(() => {

    refreshConnectionStatus() 
    // Subscribe to real-time updates
    const unsubscribe = NetInfo.addEventListener(updateConnectionStatus);

     return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      } else {
        console.warn('NetInfo unsubscribe is not a function');
      }
    };
  }, []);

  return (
    <InternetConnectionContext.Provider
      value={{ isConnected, ipAddress, refreshConnectionStatus }}
    >
      {children}
    </InternetConnectionContext.Provider>
  );
};

export { InternetConnectionContext };

