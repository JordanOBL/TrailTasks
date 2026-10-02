import NetInfo, { NetInfoConnectedStates, NetInfoStateType, NetInfoUnknownState } from '@react-native-community/netinfo';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface InternetConnectionContextProps {
  isConnected: boolean;
  ipAddress: string | null;
  refreshConnectionStatus: () => Promise<void>;
}

interface NetInfoState {
  isConnected: boolean;
  details: {
    bssid?: string;
    frequency?: number;
    ipAddress?: string;
    isConnectionExpensive?: boolean;
    linkSpeed?: number;
    rxLinkSpeed?: number;
    strength?: number;
    subnet?: string;
    txLinkSpeed?: number;

  };
  isInternetReachable?: boolean;
  type: string;
}
const InternetConnectionContext = createContext<InternetConnectionContextProps | null>(null);

export const InternetConnectionProvider = ({ children }: any) => {
  const [isConnected, setIsConnected] = useState(true);
  const [ipAddress, setIpAddress] = useState<string | null>(null);

  const updateConnectionStatus = (state:any) => {
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
    console.log(state)
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

export const useInternetConnection = () => {
  const ctx = useContext(InternetConnectionContext)
  if (!ctx){
    throw new Error('useInternetConnection must be used within <InternetProvider>');
  }
  return ctx

}

