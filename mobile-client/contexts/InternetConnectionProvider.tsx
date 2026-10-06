import NetInfo from '@react-native-community/netinfo';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';

interface InternetConnectionContextProps {
  isConnected: boolean;
  ipAddress: string | null;
  refreshConnectionStatus: () => Promise<void>;
}

const InternetConnectionContext = createContext<InternetConnectionContextProps | null>(null);

const isOnline = (state: any) => state?.isConnected === true && state?.isInternetReachable !== false;

export const InternetConnectionProvider = ({ children }: any) => {
  const [isConnected, setIsConnected] = useState(true);
  const [ipAddress, setIpAddress] = useState<string | null>(null);

  const updateConnectionStatus = useCallback((state: any) => {
    setIsConnected(isOnline(state));
    if (state?.details?.ipAddress) {
      setIpAddress(state.details.ipAddress);
    } else {
      setIpAddress(null);
    }
  }, []);

  const refreshConnectionStatus = useCallback(async () => {
    const state = await NetInfo.fetch();
    updateConnectionStatus(state);
  }, [updateConnectionStatus]);

  useEffect(() => {
    refreshConnectionStatus();

    const unsubscribe = NetInfo.addEventListener(updateConnectionStatus);
    const appStateSubscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        refreshConnectionStatus();
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      } else {
        console.warn('NetInfo unsubscribe is not a function');
      }
      appStateSubscription.remove();
    };
  }, [refreshConnectionStatus, updateConnectionStatus]);

  useEffect(() => {
    if (isConnected) return undefined;

    const reconnectPoll = setInterval(() => {
      refreshConnectionStatus();
    }, 5000);

    return () => clearInterval(reconnectPoll);
  }, [isConnected, refreshConnectionStatus]);

  return (
    <InternetConnectionContext.Provider value={{ isConnected, ipAddress, refreshConnectionStatus }}>
      {children}
    </InternetConnectionContext.Provider>
  );
};

export const useInternetConnection = () => {
  const ctx = useContext(InternetConnectionContext);
  if (!ctx) {
    throw new Error('useInternetConnection must be used within <InternetProvider>');
  }
  return ctx;
};
