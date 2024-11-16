// src/ProductProvider.tsx

import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import {
  addProductApi,
  updateProductApi,
  deleteProductApi,
  getProductsApi,
  newWebSocket,
} from './ProductApi';
import { ProductProps } from './ProductProps';
import { AuthContext } from '../auth';
import { useNetwork } from '../hooks/useNetwork';
import { useIonToast } from '@ionic/react';
import { Preferences } from '@capacitor/preferences';

const log = getLogger('ProductProvider');

type UpdateProductFn = (product: ProductProps) => Promise<void>;
type AddProductFn = (product: ProductProps) => Promise<void>;
type DeleteProductFn = (id: string) => Promise<void>;

export interface ProductsState {
  products: ProductProps[];

  fetching: boolean;
  fetchingError: Error | null;

  updating: boolean;
  updatingError: Error | null;

  updateProduct?: UpdateProductFn;
  addProduct?: AddProductFn;
  deleteProduct?: DeleteProductFn;

  successMessage: string | null;

  closeShowSuccess?: () => void;
}

interface ActionProps {
  type: string;
  payload?: any;
}

const initialState: ProductsState = {
  products: [],
  fetching: false,
  fetchingError: null,
  updating: false,
  updatingError: null,
  successMessage: null,
};

const SHOW_SUCCESS_MESSAGE = 'SHOW_SUCCESS_MESSAGE';
const HIDE_SUCCESS_MESSAGE = 'HIDE_SUCCESS_MESSAGE';

const FETCH_PRODUCTS_STARTED = 'FETCH_PRODUCTS_STARTED';
const FETCH_PRODUCTS_SUCCEEDED = 'FETCH_PRODUCTS_SUCCEEDED';
const FETCH_PRODUCTS_FAILED = 'FETCH_PRODUCTS_FAILED';

const UPDATE_PRODUCT_STARTED = 'UPDATE_PRODUCT_STARTED';
const UPDATE_PRODUCT_SUCCEEDED = 'UPDATE_PRODUCT_SUCCEEDED';
const UPDATE_PRODUCT_FAILED = 'UPDATE_PRODUCT_FAILED';

const ADD_PRODUCT_STARTED = 'ADD_PRODUCT_STARTED';
const ADD_PRODUCT_SUCCEEDED = 'ADD_PRODUCT_SUCCEEDED';
const ADD_PRODUCT_FAILED = 'ADD_PRODUCT_FAILED';

const DELETE_PRODUCT_STARTED = 'DELETE_PRODUCT_STARTED';
const DELETE_PRODUCT_SUCCEEDED = 'DELETE_PRODUCT_SUCCEEDED';
const DELETE_PRODUCT_FAILED = 'DELETE_PRODUCT_FAILED';

const reducer: (state: ProductsState, action: ActionProps) => ProductsState = (
  state,
  { type, payload }
) => {
  switch (type) {
    case FETCH_PRODUCTS_STARTED:
      return { ...state, fetching: true, fetchingError: null };

    case FETCH_PRODUCTS_SUCCEEDED:
      return { ...state, products: payload.products, fetching: false };

    case FETCH_PRODUCTS_FAILED:
      return { ...state, fetchingError: payload.error, fetching: false };

    case UPDATE_PRODUCT_STARTED:
      return { ...state, updatingError: null, updating: true };

    case UPDATE_PRODUCT_SUCCEEDED:
      const updatedProducts = [...state.products];
      const updatedProduct = payload.product;
      const index = updatedProducts.findIndex((it) => it._id === updatedProduct._id);
      if (index !== -1) {
        updatedProducts[index] = updatedProduct;
      } else {
        updatedProducts.push(updatedProduct);
      }
      return { ...state, products: updatedProducts, updating: false };

    case UPDATE_PRODUCT_FAILED:
      return { ...state, updatingError: payload.error, updating: false };

    case ADD_PRODUCT_STARTED:
      return { ...state, updatingError: null, updating: true };

    case ADD_PRODUCT_SUCCEEDED:
      const newProducts = [...state.products];
      const newProduct = payload.product;
      newProducts.unshift(newProduct);
      return { ...state, products: newProducts, updating: false, updatingError: null };

    case ADD_PRODUCT_FAILED:
      return { ...state, updatingError: payload.error, updating: false };

    case DELETE_PRODUCT_STARTED:
      return { ...state, updatingError: null, updating: true };

    case DELETE_PRODUCT_SUCCEEDED:
      const remainingProducts = state.products.filter(
        (product) => product._id !== payload.product._id
      );
      return { ...state, products: remainingProducts, updating: false };

    case DELETE_PRODUCT_FAILED:
      return { ...state, updatingError: payload.error, updating: false };

    case SHOW_SUCCESS_MESSAGE:
      return { ...state, successMessage: payload.successMessage };

    case HIDE_SUCCESS_MESSAGE:
      return { ...state, successMessage: null };

    default:
      return state;
  }
};

export const ProductContext = React.createContext<ProductsState>(initialState);

interface ProductProviderProps {
  children: React.ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { products, fetching, fetchingError, updating, updatingError, successMessage } = state;
  const { token } = useContext(AuthContext);
  const { networkStatus } = useNetwork();
  const [presentToast] = useIonToast();

  useEffect(getProductsEffect, [token]);
  useEffect(wsEffect, [token]);
  useEffect(executePendingOperations, [networkStatus.connected, token]);

  const updateProduct = useCallback<UpdateProductFn>(updateProductCallback, [token]);
  const addProduct = useCallback<AddProductFn>(addProductCallback, [token]);
  const deleteProduct = useCallback<DeleteProductFn>(deleteProductCallback, [token]);

  const value = {
    products,
    fetching,
    fetchingError,
    updating,
    updatingError,
    updateProduct,
    addProduct,
    deleteProduct,
    successMessage,
    closeShowSuccess,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;

  function getProductsEffect() {
    let canceled = false;

    if (token) {
      fetchProducts();
    }

    return () => {
      canceled = true;
    };

    async function fetchProducts() {
      try {
        log('fetchProducts started');

        dispatch({ type: FETCH_PRODUCTS_STARTED });

        const products = await getProductsApi(token);

        log('fetchProducts succeeded');

        if (!canceled) {
          dispatch({ type: FETCH_PRODUCTS_SUCCEEDED, payload: { products } });
        }
      } catch (error) {
        log('fetchProducts failed');

        if (!canceled) {
          dispatch({ type: FETCH_PRODUCTS_FAILED, payload: { error } });
        }
      }
    }
  }

  async function updateProductCallback(product: ProductProps) {
    try {
      log('updateProduct started');

      dispatch({ type: UPDATE_PRODUCT_STARTED });

      const updatedProduct = await updateProductApi(token, product);

      log('updateProduct succeeded:', updatedProduct);

      dispatch({ type: UPDATE_PRODUCT_SUCCEEDED, payload: { product: updatedProduct } });
    } catch (error: any) {
      log('updateProduct failed:', error);

      // Save to Preferences for offline handling
      await Preferences.set({
        key: `upd-${product._id}`, // use _id for unique key
        value: JSON.stringify({ token, product }),
      });

      // Dispatch UPDATE_PRODUCT_FAILED with error
      dispatch({ type: UPDATE_PRODUCT_FAILED, payload: { error: new Error(error.response?.data?.message || 'Network error') } });

      presentToast({
        message: 'You are offline... Updating product locally!',
        duration: 3000,
        color: 'warning',
      });
    }
  }

  async function addProductCallback(product: ProductProps) {
    try {
      log('addProduct started');

      dispatch({ type: ADD_PRODUCT_STARTED });

      const savedProduct = await addProductApi(token, product);

      log('addProduct succeeded:', savedProduct);

      dispatch({ type: ADD_PRODUCT_SUCCEEDED, payload: { product: savedProduct } });
    } catch (error: any) {
      log('addProduct failed:', error);

      // Save to Preferences for offline handling
      await Preferences.set({
        key: `sav-${Date.now()}`, // unique key with timestamp
        value: JSON.stringify({ token, product }),
      });

      // Dispatch ADD_PRODUCT_FAILED with error
      dispatch({ type: ADD_PRODUCT_FAILED, payload: { error: new Error(error.response?.data?.message || 'Network error') } });

      presentToast({
        message: 'You are offline... Adding product locally!',
        duration: 3000,
        color: 'warning',
      });
    }
  }

  async function deleteProductCallback(id: string) {
    try {
      log('deleteProduct started');

      dispatch({ type: DELETE_PRODUCT_STARTED });

      const deletedProduct = await deleteProductApi(token, id);

      log('deleteProduct succeeded:', deletedProduct);

      dispatch({ type: DELETE_PRODUCT_SUCCEEDED, payload: { product: deletedProduct } });
    } catch (error: any) {
      log('deleteProduct failed:', error);

      dispatch({
        type: DELETE_PRODUCT_FAILED,
        payload: { error: new Error(error.response?.data?.message || 'Delete failed') },
      });

      presentToast({
        message: 'Failed to delete product.',
        duration: 3000,
        color: 'danger',
      });
    }
  }

  function executePendingOperations() {
    async function helperMethod() {
      if (networkStatus.connected && token?.trim()) {
        log('executing pending operations');

        const { keys } = await Preferences.keys();

        for (const key of keys) {
          if (key.startsWith('sav-')) {
            const res = await Preferences.get({ key });
            console.log('result for key', key, ':', res);

            if (res.value) {
              try {
                const value = JSON.parse(res.value);
                const pendingProduct: ProductProps = value.product;
                log('creating product from pending:', pendingProduct);

                await addProductCallback(pendingProduct);
                await Preferences.remove({ key });
              } catch (error) {
                console.error('Error processing saved product:', error);
              }
            }
          }
        }

        for (const key of keys) {
          if (key.startsWith('upd-')) {
            const res = await Preferences.get({ key });
            console.log('result for key', key, ':', res);

            if (res.value) {
              try {
                const value = JSON.parse(res.value);
                const pendingProduct: ProductProps = value.product;
                log('updating product from pending:', pendingProduct);

                await updateProductCallback(pendingProduct);
                await Preferences.remove({ key });
              } catch (error) {
                console.error('Error processing updated product:', error);
              }
            }
          }
        }
      }
    }

    helperMethod();
  }

  function wsEffect() {
    let canceled = false;

    log('wsEffect - connecting');

    let closeWebSocket: () => void = () => {};

    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, (message) => {
        if (canceled) {
          return;
        }

        const { event, payload } = message;

        log(`ws message, event: ${event}`);

        if (event === 'updated') {
          dispatch({
            type: UPDATE_PRODUCT_SUCCEEDED,
            payload: { product: payload.updatedProduct },
          });
          dispatch({
            type: SHOW_SUCCESS_MESSAGE,
            payload: { successMessage: 'Product updated successfully!' },
          });
        } else if (event === 'created') {
          dispatch({
            type: ADD_PRODUCT_SUCCEEDED,
            payload: { product: payload.updatedProduct },
          });
        } else if (event === 'deleted') {
          dispatch({
            type: DELETE_PRODUCT_SUCCEEDED,
            payload: { product: payload.updatedProduct },
          });
        }
      });
    }
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket();
    };
  }

  function closeShowSuccess() {
    dispatch({ type: HIDE_SUCCESS_MESSAGE });
  }
};
