import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { directus } from '../services/directus';
import { readMe, passwordRequest, passwordReset, createUser, readSingleton, updateMe } from '@directus/sdk';

export interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar?: string | null;
  role?: any;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  requestReset: (email: string) => Promise<void>;
  confirmReset: (token: string, password: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ROLE_ID = "968723f2-d383-4156-b7d9-c1ff6800d022";

export const AuthProvider = ({ children }: PropsWithChildren) => {
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
      // @ts-ignore
      await directus.login(email, password);
      await checkAuth(); // Fetch user details and update state
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err?.errors?.[0]?.message === 'Invalid user credentials.') {
        setError('ایمیل یا رمز عبور اشتباه است.');
      } else {
        setError('خطا در ورود به سیستم. لطفا ارتباط خود را بررسی کنید.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get the Role ID
      let roleId = DEFAULT_ROLE_ID;
      try {
        // Attempt to fetch role from configuration, fallback to default if fails or not set
        const config = await directus.request(readSingleton('configuration'));
        if (config && config.app_role) {
          roleId = config.app_role;
        }
      } catch (configErr) {
        console.warn("Could not fetch configuration for role ID, using default.", configErr);
      }

      // 2. Create User
      await directus.request(createUser({
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        role: roleId,
        status: 'active' // Assuming we want active users immediately
      }));

      // 3. Auto Login
      // @ts-ignore
      await directus.login(data.email, data.password);
      await checkAuth();
      
    } catch (err: any) {
      console.error("Registration failed:", err);
      // Directus error codes
      if (err?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
        setError('این ایمیل قبلا ثبت شده است.');
      } else {
        setError('خطا در ثبت نام. لطفا ورودی‌های خود را بررسی کنید.');
      }
      throw err;
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
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const requestReset = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      // The reset URL should point back to this app's root
      const resetUrl = typeof window !== 'undefined' ? window.location.origin : '';
      await directus.request(passwordRequest(email, resetUrl));
    } catch (err: any) {
      console.error("Request reset failed:", err);
      setError('خطا در ارسال ایمیل بازیابی. لطفا مجددا تلاش کنید.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const confirmReset = async (token: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await directus.request(passwordReset(token, password));
    } catch (err: any) {
      console.error("Password reset failed:", err);
      setError('خطا در تغییر رمز عبور. لینک بازیابی ممکن است منقضی شده باشد.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      // Update in Directus
      const updatedUser = await directus.request(updateMe(data));
      // Merge returned data into current user state
      setUser(prev => prev ? { ...prev, ...updatedUser } as User : null);
    } catch (err: any) {
      console.error("Profile update failed:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, requestReset, confirmReset, updateProfile, loading, error }}>
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