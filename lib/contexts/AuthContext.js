'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';

// Auth context
const AuthContext = createContext();

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
};

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        token: null,
        error: action.payload,
      };
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

// Initial state
const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
  error: null,
};

// Auth provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found in localStorage');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        return;
      }
      
      console.log('Auth token found, checking session...');
      console.log('Token first 10 chars:', token.substring(0, 10) + '...');

      const response = await fetch('/api/auth/session', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Session check response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Session check successful, user data received');
        dispatch({
          type: AUTH_ACTIONS.SET_USER,
          payload: data.user,
        });
      } else {
        console.error('Session check failed with status:', response.status);
        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);
        } catch (parseError) {
          console.error('Could not parse error response');
        }
        localStorage.removeItem('auth_token');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error('Auth check error:', error);
      localStorage.removeItem('auth_token');
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const signup = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: data.user, token: data.token },
        });
        return { success: true, user: data.user };
      } else {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: data.error,
        });
        return { success: false, error: data.error };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const signin = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    console.log('Starting signin process for email:', credentials.email);
    
    try {
      console.log('Sending signin request to API...');
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('Signin API response status:', response.status);
      console.log('Signin API response status text:', response.statusText);
      
      let data;
      try {
        data = await response.json();
        console.log('Signin API response data structure:', 
          Object.keys(data).length ? Object.keys(data) : 'Empty response');
        
        // Log token info if available (safely)
        if (data.token) {
          console.log('Token received, length:', data.token.length);
          console.log('Token first 10 chars:', data.token.substring(0, 10) + '...');
        } else {
          console.error('No token received in response');
        }
        
        // Log user info if available (safely)
        if (data.user) {
          console.log('User data received:', 
            JSON.stringify({
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              hasSubscription: !!data.user.subscription
            }));
        }
      } catch (parseError) {
        console.error('Failed to parse API response:', parseError);
        data = { error: 'Failed to parse server response' };
      }

      if (response.ok && data.token) {
        console.log('Login successful, storing token and user data');
        localStorage.setItem('auth_token', data.token);
        
        // Store token in cookie as well for middleware access
        document.cookie = `auth_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`;
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user: data.user, token: data.token },
        });
        return { success: true, user: data.user };
      } else {
        console.error('Login failed with status:', response.status);
        console.error('Error message:', data.error || 'Unknown error');
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: data.error || 'Authentication failed',
        });
        return { success: false, error: data.error || 'Authentication failed' };
      }
    } catch (error) {
      console.error('Signin network error:', error);
      const errorMessage = 'Network error. Please try again.';
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    console.log('Logging out user...');
    // Clear token from localStorage
    localStorage.removeItem('auth_token');
    
    // Clear token from cookies
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    
    console.log('Auth tokens cleared');
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const value = {
    ...state,
    signup,
    signin,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
