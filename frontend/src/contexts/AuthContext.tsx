'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Types for authentication
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_verified: boolean;
  role: string;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearError: () => void;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Auth provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Clear error function
  const clearError = () => {
    setAuthState(prev => ({ ...prev, error: null }));
  };

  // Check authentication status
  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
        method: 'GET',
        credentials: 'include', // Include cookies for session
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else if (response.status === 401) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: 'Failed to check authentication status',
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  // Login function
  const login = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Clear any previous callback processing flag
      sessionStorage.removeItem('oauth_callback_processed');
      
      // Get OAuth URL from backend
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        // Store state for callback verification
        localStorage.setItem('oauth_state', data.state);
        // Redirect to Google OAuth
        window.location.href = data.auth_url;
      } else {
        const errorData = await response.json();
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorData.error || 'Failed to initiate login',
        }));
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Login failed',
      }));
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      } else {
        const errorData = await response.json();
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: errorData.error || 'Logout failed',
        }));
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      }));
    }
  };

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      // Check if we've already processed this callback (to prevent infinite loops)
      const callbackProcessed = sessionStorage.getItem('oauth_callback_processed');
      if (callbackProcessed) {
        return;
      }

      if (error) {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: `OAuth error: ${error}`,
        }));
        sessionStorage.setItem('oauth_callback_processed', 'true');
        return;
      }

      if (code && state) {
        // Mark callback as being processed
        sessionStorage.setItem('oauth_callback_processed', 'true');
        try {
          setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
          
          // Get stored state
          const storedState = localStorage.getItem('oauth_state');
          
          // Verify state matches
          if (state !== storedState) {
            throw new Error('State mismatch - possible CSRF attack');
          }
          
          const response = await fetch(`${API_BASE_URL}/api/auth/callback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ code, state }),
          });

          if (response.ok) {
            const data = await response.json();
            setAuthState({
              user: data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            // Clean up stored OAuth data
            localStorage.removeItem('oauth_state');
            sessionStorage.removeItem('oauth_callback_processed');
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            const errorData = await response.json();
            setAuthState(prev => ({
              ...prev,
              isLoading: false,
              error: errorData.error || 'Authentication failed',
            }));
            
            // Clean up stored OAuth data on error
            localStorage.removeItem('oauth_state');
            sessionStorage.removeItem('oauth_callback_processed');
          }
        } catch (error) {
          // Clean up stored OAuth data on error
          localStorage.removeItem('oauth_state');
          sessionStorage.removeItem('oauth_callback_processed');
          
          setAuthState(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Authentication failed',
          }));
        }
      }
    };

    // Check if we're on the callback page
    if (window.location.pathname === '/auth/callback') {
      handleOAuthCallback();
    }
  }, []);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    checkAuthStatus,
    clearError,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
