'use client';

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/api';

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'employee' | 'hr' | 'mis';
  profileImage?: string;
  employeeId?: string;
}

interface DecodedToken {
  exp: number;
  role: string;
  id: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedUser) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedAccessToken);
        const now = Date.now() / 1000;

        if (decoded.exp > now) {
          const userData = JSON.parse(storedUser) as User;
          setUser(userData);
          setToken(storedAccessToken);
          
          // Only fetch profile data if user doesn't have profileImage yet
          if (!userData.profileImage && (decoded.role === 'employee' || decoded.role === 'hr')) {
            api.get('/employee/profile')
              .then(response => {
                if (response.data.profileImage) {
                  const updatedUser = { ...userData, profileImage: response.data.profileImage };
                  setUser(updatedUser);
                  localStorage.setItem('user', JSON.stringify(updatedUser));
                }
              })
              .catch(err => console.error('Failed to fetch profile image:', err));
          }
        } else {
          // expired → clear
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      } catch {
        // Invalid token → clear
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    const userWithImage: User = {
      ...userData,
      profileImage: userData.profileImage || undefined,
    };
    
    setUser(userWithImage);
    setToken(accessToken);
    localStorage.setItem('user', JSON.stringify(userWithImage));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      const updatedUser = { ...prevUser, ...userData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
