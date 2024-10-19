import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { ProductProps } from './ProductProps';
import { createProduct, getProducts, updateProduct } from './ProductApi';

const log = getLogger('ProductProvider');

type SaveProductFn = (product: ProductProps) => Promise<any>;

export interface ProductsState {
  products?: ProductProps[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  saveProduct?: SaveProductFn,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: ProductsState = {
  fetching: false,
  saving: false,
};

const FETCH_PRODUCTS_STARTED = 'FETCH_PRODUCTS_STARTED';
const FETCH_PRODUCTS_SUCCEEDED = 'FETCH_PRODUCTS_SUCCEEDED';
const FETCH_PRODUCTS_FAILED = 'FETCH_PRODUCTS_FAILED';
const SAVE_PRODUCT_STARTED = 'SAVE_PRODUCT_STARTED';
const SAVE_PRODUCT_SUCCEEDED = 'SAVE_PRODUCT_SUCCEEDED';
const SAVE_PRODUCT_FAILED = 'SAVE_PRODUCT_FAILED';

const reducer: (state: ProductsState, action: ActionProps) => ProductsState =
  (state, { type, payload }) => {
    switch(type) {
      case FETCH_PRODUCTS_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_PRODUCTS_SUCCEEDED:
        return { ...state, products: payload.products, fetching: false };
      case FETCH_PRODUCTS_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_PRODUCT_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_PRODUCT_SUCCEEDED:
        const products = [...(state.products || [])];
        const product = payload.product;
        const index = products.findIndex(p => p.id === product.id);
        if (index === -1) {
          products.splice(0, 0, product);
        } else {
          products[index] = product;
        }
        return { ...state, products, saving: false };
      case SAVE_PRODUCT_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      default:
        return state;
    }
  };

export const ProductContext = React.createContext<ProductsState>(initialState);

interface ProductProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { products, fetching, fetchingError, saving, savingError } = state;
  useEffect(getProductsEffect, []);
  const saveProduct = useCallback<SaveProductFn>(saveProductCallback, []);
  const value = { products, fetching, fetchingError, saving, savingError, saveProduct };
  log('returns');
  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );

  function getProductsEffect() {
    let canceled = false;
    fetchProducts();
    return () => {
      canceled = true;
    }

    async function fetchProducts() {
      try {
        log('fetchProducts started');
        dispatch({ type: FETCH_PRODUCTS_STARTED });
        const products = await getProducts(); 
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

  async function saveProductCallback(product: ProductProps) {
    try {
      log('saveProduct started');
      dispatch({ type: SAVE_PRODUCT_STARTED });
      const savedProduct = await (product.id ? updateProduct(product) : createProduct(product));
      log('saveProduct succeeded');
      dispatch({ type: SAVE_PRODUCT_SUCCEEDED, payload: { product: savedProduct } });
    } catch (error) {
      log('saveProduct failed');
      dispatch({ type: SAVE_PRODUCT_FAILED, payload: { error } });
    }
  }
};
