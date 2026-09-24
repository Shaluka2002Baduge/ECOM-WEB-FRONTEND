/**
 * Raalahami Restaurant - AuthContext
 * Dynamic Role-Based Authentication & Session Management
 * Roles: CUSTOMER, KITCHEN_STAFF, ADMIN, MANAGER
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const ROLES = {
  GUEST: 'GUEST',
  CUSTOMER: 'CUSTOMER',
  KITCHEN_STAFF: 'KITCHEN_STAFF',
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('ralahami_auth_user') || localStorage.getItem('ralahami_virtual_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync authenticated user to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('ralahami_auth_user', JSON.stringify(user));
      // Cleanup legacy virtual user key if present
      localStorage.removeItem('ralahami_virtual_user');
    } else {
      localStorage.removeItem('ralahami_auth_user');
    }
  }, [user]);

  /**
   * Log in user via backend API
   * @param {string} email
   * @param {string} password
   */
  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login({ email, password });
      
      // Support standard backend response structures
      const data = response?.data || response;
      const userData = data?.user || (data?.email ? data : null);
      const token = data?.token || data?.accessToken || response?.token;

      if (!userData) {
        throw new Error('Authentication response did not contain user data.');
      }

      const rawRole = userData.role || data.role || ROLES.CUSTOMER;
      const normalizedRole = String(rawRole).trim().toUpperCase();

      const authenticatedUser = {
        ...userData,
        role: normalizedRole
      };

      if (token) {
        localStorage.setItem('ralahami_auth_token', token);
      }
      localStorage.setItem('ralahami_auth_user', JSON.stringify(authenticatedUser));
      localStorage.removeItem('ralahami_virtual_user');

      setUser(authenticatedUser);
      return { success: true, user: authenticatedUser };
    } catch (err) {
      const message = err.message || 'Authentication failed. Please verify your credentials.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Register new customer user via backend API
   * Strictly creates the account without auto-authenticating or saving session tokens.
   */
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = {
        displayName: userData.displayName || userData.fullName || userData.name,
        email: userData.email,
        password: userData.password,
        ...(userData.phone ? { phone: userData.phone } : {})
      };

      const response = await authService.register(payload);

      // Explicit authentication required: Do NOT save token or set user session
      return {
        success: true,
        message:
          response?.message ||
          'Account created successfully! Please sign in with your credentials to continue.',
        email: payload.email
      };
    } catch (err) {
      const message = err.message || 'Registration failed. Please try again.';
      setError(message);
      throw err;
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
    } catch (err) {
      console.warn('Logout network notice:', err.message);
    } finally {
      localStorage.removeItem('ralahami_auth_user');
      localStorage.removeItem('ralahami_auth_token');
      localStorage.removeItem('ralahami_virtual_user');
      localStorage.removeItem('token');
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const currentRole = user?.role ? String(user.role).trim().toUpperCase() : ROLES.GUEST;
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
    clearError: () => setError(null),
    isCustomer: currentRole === ROLES.CUSTOMER,
    isKitchenStaff: currentRole === ROLES.KITCHEN_STAFF,
    isAdmin: currentRole === ROLES.ADMIN || currentRole === ROLES.MANAGER,
    isManager: currentRole === ROLES.MANAGER
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
