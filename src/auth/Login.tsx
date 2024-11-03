// Login.tsx
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { AuthContext } from './AuthProvider';
import { getLogger } from '../core';

const log = getLogger('Login');

interface LoginState {
  username?: string;
  password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({ history }) => {
  const { isAuthenticated, isAuthenticating, login, authenticationError } =
    useContext(AuthContext);
  const [state, setState] = useState<LoginState>({});
  const { username, password } = state;

  const handlePasswordChange = useCallback(
    (e: any) =>
      setState((prevState) => ({
        ...prevState,
        password: e.detail.value || '',
      })),
    []
  );

  const handleUsernameChange = useCallback(
    (e: any) =>
      setState((prevState) => ({
        ...prevState,
        username: e.detail.value || '',
      })),
    []
  );

  const handleLogin = useCallback(() => {
    log('handleLogin...');
    login?.(username, password);
  }, [login, username, password]);

  log('render');

  useEffect(() => {
    if (isAuthenticated) {
      log('redirecting to home');
      history.push('/');
    }
  }, [isAuthenticated, history]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput
          placeholder="Username"
          value={username}
          onIonChange={handleUsernameChange}
        />
        <IonInput
          placeholder="Password"
          type="password"
          value={password}
          onIonChange={handlePasswordChange}
        />
        <IonLoading isOpen={isAuthenticating} />
        {authenticationError && (
          <div>{authenticationError.message || 'Failed to authenticate'}</div>
        )}
        <IonButton onClick={handleLogin}>Login</IonButton>
      </IonContent>
    </IonPage>
  );
};
