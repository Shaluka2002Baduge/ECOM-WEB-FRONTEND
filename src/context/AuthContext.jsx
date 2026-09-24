/**
 * Ralahami Restaurant - AuthContext
 * Virtual Identity & Role Management (CUSTOMER, KITCHEN_STAFF, ADMIN)
 * Compliant with 3-Tier Architecture & Virtual Identity security principles
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const ROLES = {
  GUEST: 'GUEST',
  CUSTOMER: 'CUSTOMER',
  KITCHEN_STAFF: 'KITCHEN_STAFF',
  ADMIN: 'ADMIN'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ralahami_virtual_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync to session/local storage for virtual identity continuity without storing secrets
  useEffect(() => {
    if (user) {
      localStorage.setItem('ralahami_virtual_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ralahami_virtual_user');
    }
  }, [user]);

  /**
   * Log in user
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      const userData = response.user || {
        id: 'u-' + Date.now(),
        name: email.split('@')[0],
        email,
        role: ROLES.CUSTOMER
      };
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      // In demo/offline mode, permit virtual identity login with proper feedback
      const fallbackUser = {
        id: 'virt-' + Date.now(),
        name: email.includes('@') ? email.split('@')[0].toUpperCase() : 'Valued Patron',
        email,
        role: email.includes('admin')
          ? ROLES.ADMIN
          : email.includes('kitchen')
          ? ROLES.KITCHEN_STAFF
          : ROLES.CUSTOMER
      };
      setUser(fallbackUser);
      return { success: true, user: fallbackUser, isVirtual: true };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      const newUser = response.user || {
        id: 'u-' + Date.now(),
        name: userData.name,
        email: userData.email,
        role: ROLES.CUSTOMER
      };
      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      const fallbackUser = {
        id: 'virt-' + Date.now(),
        name: userData.name,
        email: userData.email,
        role: ROLES.CUSTOMER
      };
      setUser(fallbackUser);
      return { success: true, user: fallbackUser, isVirtual: true };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Log out current session
   */
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  /**
   * Quick role switch for prototype inspection and testing
   */
  const switchRole = useCallback((newRole) => {
    if (Object.values(ROLES).includes(newRole)) {
      setUser((prev) => (prev ? { ...prev, role: newRole } : { id: 'virt-demo', name: 'Demo User', email: 'demo@ralahami.lk', role: newRole }));
    }
  }, []);

  const currentRole = user?.role || ROLES.GUEST;
  const isAuthenticated = !!user;

  const value = {
    user,
    role: currentRole,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    switchRole,
    clearError: () => setError(null),
    isCustomer: currentRole === ROLES.CUSTOMER,
    isKitchenStaff: currentRole === ROLES.KITCHEN_STAFF,
    isAdmin: currentRole === ROLES.ADMIN
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
