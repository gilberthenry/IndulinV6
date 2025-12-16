import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedUser) {
      try {
        const decoded = jwtDecode(storedAccessToken);
        const now = Date.now() / 1000;

        if (decoded.exp > now) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedAccessToken);
          
          // Only fetch profile data if user doesn't have profileImage yet
          // This prevents unnecessary API calls on every page load
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
      } catch (error) {
        // Invalid token → clear
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    const userWithImage = {
      ...userData,
      profileImage: userData.profileImage || null
    };
    
    setUser(userWithImage);
    setToken(accessToken);
    localStorage.setItem('user', JSON.stringify(userWithImage));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  const updateUser = (userData) => {
    setUser(prevUser => {
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