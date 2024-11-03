// PrivateRoute.tsx
import React, { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { AuthContext, AuthState } from './AuthProvider';
import { getLogger } from '../core';

const log = getLogger('PrivateRoute');

export interface PrivateRouteProps {
  component: any;
  path: string;
  exact?: boolean;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { isAuthenticated } = useContext<AuthState>(AuthContext);

  log('isAuthenticated: ' + isAuthenticated);

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: '/login' }} />
        )
      }
    />
  );
};
