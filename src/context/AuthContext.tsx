import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { directus } from '../services/directus';
import { readMe } from '@directus/sdk';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Try to fetch the current user
      // If the cookie is valid, this will succeed
      const currentUser = await directus.request(
        readMe({
          fields: ['id', 'first_name', 'last_name', 'email', 'avatar', 'role'],
        })
      );
      setUser(currentUser as unknown as User);
    } catch (err) {
      // If this fails (401/403), the user is not logged in
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // The SDK (v20+) requires credentials to be passed as a single object.
      // Passing (email, password) separately causes the password to be treated as 'options',
      // throwing the "Cannot use 'in' operator" error.
      // @ts-ignore
      await directus.login({ email, password });

      await checkAuth(); // Fetch user details after successful login
    } catch (err: any) {
      console.error("Login failed:", err);

      // Directus returns error codes, we can map them to friendly messages
      if (err?.errors?.[0]?.message === 'Invalid user credentials.') {
        setError('ایمیل یا رمز عبور اشتباه است.');
      } else {
        setError('خطا در ورود به سیستم. لطفا ارتباط خود را بررسی کنید.');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await directus.logout();
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
      // Even if API call fails, we clear local state
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};