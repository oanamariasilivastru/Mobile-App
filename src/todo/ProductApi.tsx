// ProductApi.tsx
import axios from 'axios';
import { authConfig, getLogger, withLogs } from '../core';
import { ProductProps } from './ProductProps';
import { Preferences } from '@capacitor/preferences';

export const baseUrl = 'http://localhost:3000'; // Asigurați-vă că acesta este URL-ul corect al serverului

const productUrl = `${baseUrl}/api/product`;

const log = getLogger('ProductApi');

// API functions for CRUD operations on products
export const getProductsApi = (token: string): Promise<ProductProps[]> => {
  return withLogs(axios.get(productUrl, authConfig(token)), 'getProductsApi');
};

export const addProductApi = (
  token: string,
  product: ProductProps
): Promise<ProductProps> => {
  return withLogs(axios.post(productUrl, product, authConfig(token)), 'addProductApi');
};

export const updateProductApi = (
  token: string,
  product: ProductProps
): Promise<ProductProps> => {
  return withLogs(
    axios.put(`${productUrl}/${product._id}`, product, authConfig(token)),
    'updateProductApi'
  );
};

export const deleteProductApi = (token: string, id: string): Promise<{}> => {
  return withLogs(axios.delete(`${productUrl}/${id}`, authConfig(token)), 'deleteProductApi');
};

// WebSocket interface for real-time updates
interface MessageData {
  event: string;
  payload: {
    successMessage: string;
    updatedProduct: ProductProps;
  };
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  // Remove 'http://' or 'https://' from baseUrl
  const wsBaseUrl = baseUrl.replace(/^https?:\/\//, ''); // Removes 'http://' or 'https://'
  const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
  const ws = new WebSocket(`${wsProtocol}://${wsBaseUrl}`);

  ws.onopen = () => {
    log('WebSocket on open');
    ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
  };
  ws.onclose = () => {
    log('WebSocket on close');
  };
  ws.onerror = (error) => {
    log(`WebSocket on error:`, error);
  };
  ws.onmessage = (messageEvent) => {
    log('WebSocket on message', messageEvent.data);
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  };
};
