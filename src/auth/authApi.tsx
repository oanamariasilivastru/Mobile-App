import axios from 'axios';
import { baseUrl, config, withLogs } from '../core';

const authUrl = `${baseUrl}/api/auth/login`;
const signupUrl = `${baseUrl}/api/auth/signup`;

export interface AuthProps {
  token: string;
}

export const login = (
  username?: string,
  password?: string
): Promise<AuthProps> => {
  return withLogs(
    axios.post(authUrl, { username, password }, config),
    'login'
  );
};

export const signup = (
  username?: string,
  password?: string
): Promise<AuthProps> => {
  return withLogs(
    axios.post(signupUrl, { username, password }, config),
    'signup'
  );
};
