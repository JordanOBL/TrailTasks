import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { InternetConnectionProvider } from '../contexts/InternetConnectionProvider';
import { AuthProvider } from '../services/AuthContext';
import {testDb as mockDatabase} from '../watermelon/testDB';
export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <NavigationContainer>
      <DatabaseProvider database={mockDatabase}>
        <InternetConnectionProvider>
          <AuthProvider >
            {children}
          </AuthProvider>
        </InternetConnectionProvider>
      </DatabaseProvider>
    </NavigationContainer>
  );
};

