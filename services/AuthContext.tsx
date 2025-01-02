// AuthContext.tsx
import React, { createContext, useContext } from 'react';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useAuth } from '../hooks/useAuth'; // your custom hook that needs DB
import { User } from '../watermelon/models';

// 1. Create the context type
type AuthContextType = {
 user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  error: string;
  login: (email: string, password: string) => Promise<void>;
  register: ( firstName: string,
      lastName: string,
      email: string,
      password: string,
      confirmPassword: string,
      username: string) => Promise<void>;
  logout: () => Promise<void>;
  // etc...
};

// 2. Create the context
const AuthContext = createContext<AuthContextType | null>(null);

// 3. Provider that fetches DB from useDatabase and calls your useAuthLogic
export function AuthProvider({ children, initialUser = null }: { children: React.ReactNode, initialUser?: User | null }) {
  // The Watermelon DB instance from the DatabaseProvider context
  const watermelonDatabase = useDatabase();

  // Suppose useAuthLogic encapsulates your logic:
  // export function useAuth(database: Database) { ... }
  // returning { user, error, login, logout, ... }
  const auth = useAuth({ watermelonDatabase, initialUser }); 

  return <AuthContext.Provider value={auth} >{children}</AuthContext.Provider>;
}

// 4. Hook to access the context
export function useAuthContext() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return auth;
}


