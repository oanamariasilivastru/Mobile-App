// AuthProvider.tsx
import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { login as loginApi } from './authApi';
import { Preferences } from '@capacitor/preferences';

const log = getLogger('AuthProvider');

type LoginFn = (username?: string, password?: string) => void;
type LogoutFn = () => void;

export interface AuthState {
  authenticationError: Error | null;

  isAuthenticated: boolean;
  isAuthenticating: boolean;
  pendingAuthentication?: boolean;

  login?: LoginFn;
  logout?: LogoutFn;

  username?: string;
  password?: string;

  token: string;
  tokenFound: boolean;
}

const initialState: AuthState = {
  authenticationError: null,

  isAuthenticated: false,
  isAuthenticating: false,
  pendingAuthentication: false,

  token: '',
  tokenFound: false,
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
  children: PropTypes.ReactNodeLike;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const {
    authenticationError,
    isAuthenticated,
    isAuthenticating,
    pendingAuthentication,
    token,
    tokenFound,
  } = state;
  const login = useCallback<LoginFn>(loginCallback, [state]);
  const logout = useCallback<LogoutFn>(logoutCallback, []);

  useEffect(authenticationEffect, [pendingAuthentication, tokenFound]);
  useEffect(checkTokenEffect, [tokenFound]);

  const value = {
    isAuthenticated,
    login,
    logout,
    isAuthenticating,
    authenticationError,
    token,
    tokenFound,
  };

  log('render');

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

  function loginCallback(username?: string, password?: string): void {
    log('login');

    setState((prevState) => ({
      ...prevState,
      pendingAuthentication: true,
      username,
      password,
    }));
  }

  function logoutCallback(): void {
    log('logout');

    Preferences.remove({ key: 'token' });

    setState((prevState) => ({
      ...prevState,
      isAuthenticated: false,
      token: '',
      tokenFound: false,
    }));
  }

  function authenticationEffect() {
    let canceled = false;

    authenticate();

    return () => {
      canceled = true;
    };

    async function authenticate() {
      if (!pendingAuthentication || tokenFound) {
        return;
      }

      try {
        log('authenticate');

        setState((prevState) => ({
          ...prevState,
          isAuthenticating: true,
        }));

        const { username, password } = state;
        const { token } = await loginApi(username, password);

        if (canceled) {
          return;
        }

        // Salvăm token-ul în Preferences
        await Preferences.set({ key: 'token', value: token });

        log('authentication succeeded');

        setState((prevState) => ({
          ...prevState,
          token,
          pendingAuthentication: false,
          isAuthenticated: true,
          isAuthenticating: false,
        }));
      } catch (error) {
        if (canceled) {
          return;
        }

        log('authentication failed');

        setState((prevState) => ({
          ...prevState,
          authenticationError: error as Error,
          pendingAuthentication: false,
          isAuthenticating: false,
        }));
      }
    }
  }

  function checkTokenEffect() {
    async function checkForToken() {
      if (tokenFound) {
        return;
      }

      const { keys } = await Preferences.keys();

      if (keys.includes('token')) {
        const tokenResult = await Preferences.get({ key: 'token' });
        const token = tokenResult.value;

        log('Token found:', token);

        setState((prevState) => ({
          ...prevState,
          token: token!,
          tokenFound: true,
          isAuthenticated: true,
          isAuthenticating: false,
        }));
      }
    }

    checkForToken();
  }
};
