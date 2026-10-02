import { AuthProvider } from '../services/AuthContext';
import { DatabaseProvider } from '@nozbe/watermelondb/react';
import { InternetConnectionProvider } from '../contexts/InternetConnectionProvider';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { ServiceProvider } from '../contexts/ServiceProvider';
import { ThemeProvider } from '../contexts/ThemeProvider';
import {testDb as mockDatabase} from '../watermelon/testDB';
export const TestWrapper = ({ children, testUser }: { children: React.ReactNode, testUser: any }) => {
  return (
    <NavigationContainer>
      <DatabaseProvider database={mockDatabase}>
        <InternetConnectionProvider>
          <AuthProvider initialUser={testUser || null}>
            <ThemeProvider>
              <ServiceProvider>
            {children}
              </ServiceProvider>
            </ThemeProvider>
          </AuthProvider>
        </InternetConnectionProvider>
      </DatabaseProvider>
    </NavigationContainer>
  );
};

