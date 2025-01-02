import { useContext } from 'react';
import { InternetConnectionContext } from '../contexts/InternetConnectionProvider';

export const useInternetConnection = () => {
  const context = useContext(InternetConnectionContext);

  if (context === undefined) {
    throw new Error(
      'useInternetConnection must be used within an InternetConnectionProvider'
    );
  }

  return context;
};

