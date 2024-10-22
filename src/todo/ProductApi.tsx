import axios from 'axios';
import { getLogger } from '../core';
import { ProductProps } from './ProductProps';
import { ProductsProps } from './useProducts';

const log = getLogger('productApi');

const baseUrl = 'http://localhost:3000';
const productUrl = `${baseUrl}/product`;
const wsBaseUrl = baseUrl.replace(/^http(s)?:\/\//, '');

interface ResponseProps<T> {
  data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
  log(`${fnName} - started`);
  return promise
    .then(res => {
      log(`${fnName} - succeeded`);
      return Promise.resolve(res.data);
    })
    .catch(err => {
      log(`${fnName} - failed`);
      return Promise.reject(err);
    });
}

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

export const getProducts: () => Promise<ProductProps[]> = () => {
  return withLogs(axios.get(productUrl, config), 'getProducts');
}

export const createProduct: (product: ProductProps) => Promise<ProductProps[]> = product => {
  return withLogs(axios.post(productUrl, product, config), 'createProduct');
}

export const updateProduct: (product: ProductProps) => Promise<ProductProps[]> = product => {
  return withLogs(axios.put(`${productUrl}/${product.id}`, product, config), 'updateProduct');
}

interface MessageData {
  event: string;
  payload: {
    product: ProductsProps;
  };
}

export const newWebSocket = (onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${wsBaseUrl}`);
  ws.onopen = () => {
    log('web socket onopen');
  };
  ws.onclose = () => {
    log('web socket onclose');
  };
  ws.onerror = error => {
    log('web socket onerror');
  };
  ws.onmessage = messageEvent => {
    log('web socket onmessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}