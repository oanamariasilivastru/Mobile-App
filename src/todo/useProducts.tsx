import { useCallback, useEffect, useReducer } from 'react';
import { getLogger } from '../core';
import { ProductProps } from './ProductProps';
import { getProducts } from './ProductApi';
const log = getLogger('useProducts');

export interface ProductsState {
  products?: ProductProps[],
  fetching: boolean,
  fetchingError?: Error,
}

export interface ProductsProps extends ProductsState {
  addProduct: () => void,
}

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: ProductsState = {
  products: undefined,
  fetching: false,
  fetchingError: undefined,
};

const FETCH_PRODUCTS_STARTED = 'FETCH_PRODUCTS_STARTED';
const FETCH_PRODUCTS_SUCCEEDED = 'FETCH_PRODUCTS_SUCCEEDED';
const FETCH_PRODUCTS_FAILED = 'FETCH_PRODUCTS_FAILED';

const reducer: (state: ProductsState, action: ActionProps) => ProductsState =
  (state, { type, payload }) => {
    switch(type) {
      case FETCH_PRODUCTS_STARTED:
        return { ...state, fetching: true };
      case FETCH_PRODUCTS_SUCCEEDED:
        return { ...state, products: payload.products, fetching: false };
      case FETCH_PRODUCTS_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      default:
        return state;
    }
  };

export const useProducts: () => ProductsProps = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { products, fetching, fetchingError } = state;
  const addProduct = useCallback(() => {
    log('addProduct - TODO');
  }, []);
  useEffect(getProductsEffect, [dispatch]);
  log(`returns - fetching = ${fetching}, products = ${JSON.stringify(products)}`);
  return {
    products,
    fetching,
    fetchingError,
    addProduct,
  };

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
};
