import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { InternetConnectionProvider } from '../contexts/InternetConnectionProvider';
import { AuthProvider } from '../services/AuthContext';
import {testDb as mockDatabase} from '../watermelon/testDB';
export const TestWrapper = ({ children, testUser }: { children: React.ReactNode }) => {
  return (
    <NavigationContainer>
      <DatabaseProvider database={mockDatabase}>
        <InternetConnectionProvider>
          <AuthProvider initialUser={testUser || null}>
            {children}
          </AuthProvider>
        </InternetConnectionProvider>
      </DatabaseProvider>
    </NavigationContainer>
  );
};

