import React, { useContext, useEffect, useState, useMemo } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonLoading,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';

import { add } from 'ionicons/icons';
import { AuthContext } from '../auth';
import { NetworkState } from '../hooks/NetworkState';
import Product from './Product';
import { getLogger } from '../core';
import { ProductContext } from './ProductProvider';

const log = getLogger('ProductList');

const ProductList: React.FC<RouteComponentProps> = ({ history }) => {
  const { products, fetchingError, successMessage, closeShowSuccess } = useContext(ProductContext);
  const { logout } = useContext(AuthContext);

  const [currentIndex, setCurrentIndex] = useState<number>(8);
  const [searchText, setSearchText] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const filterValues = ['all', 'inStock', 'outOfStock'];

  const filteredProducts = useMemo(() => {
    let filtered = products || [];

    if (searchText) {
      filtered = filtered.filter(
        (product) =>
          product.name && product.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (filter && filter !== 'all') {
      filtered = filtered.filter((product) =>
        filter === 'inStock' ? product.inStock : !product.inStock
      );
    }

    return filtered;
  }, [products, searchText, filter]);

  const handleLogout = () => {
    logout?.();
    history.push('/login');
  };

  const fetchData = () => {
    if (isLoading) return;

    setIsLoading(true);

    setTimeout(() => {
      if (filteredProducts && currentIndex < filteredProducts.length) {
        const newIndex = Math.min(currentIndex + 8, filteredProducts.length);
        setCurrentIndex(newIndex);

        if (newIndex >= filteredProducts.length) {
          setDisableInfiniteScroll(true);
        }
      } else {
        setDisableInfiniteScroll(true);
      }

      setIsLoading(false);
    }, 500);
  };

  const searchNext = (event: CustomEvent<void>) => {
    fetchData();
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };

  useEffect(() => {
    const initialIndex = Math.min(8, filteredProducts.length);
    setCurrentIndex(initialIndex);
    setDisableInfiniteScroll(initialIndex >= filteredProducts.length);
  }, [filteredProducts]);

  useEffect(() => {
    if (filteredProducts.length > 0) {
      setIsLoading(false);
    } else if (filteredProducts.length === 0 && !disableInfiniteScroll) {
      setIsLoading(true);
    }
  }, [filteredProducts, disableInfiniteScroll]);

  log('render');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Product List</IonTitle>
          <IonSelect
            slot="end"
            value={filter}
            placeholder="Filter"
            onIonChange={(e) => {
              setFilter(e.detail.value);
            }}
          >
            {filterValues.map((each) => (
              <IonSelectOption key={each} value={each}>
                {each}
              </IonSelectOption>
            ))}
          </IonSelect>
          <NetworkState />
          <IonSearchbar
            placeholder="Search by name"
            value={searchText}
            debounce={500}
            onIonInput={(e) => {
              setSearchText(e.detail.value!);
            }}
            slot="secondary"
          ></IonSearchbar>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>Logout</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Controlled IonLoading based on 'isLoading' */}
        <IonLoading isOpen={isLoading} message="Loading products..." />
        {filteredProducts && (
          <IonList inset={true}>
            {/* Header Row */}
            <IonItem lines="none">
              <IonLabel><strong>Name</strong></IonLabel>
              <IonLabel><strong>Category</strong></IonLabel>
              <IonLabel><strong>Price</strong></IonLabel>
              <IonLabel><strong>In Stock</strong></IonLabel>
              <IonLabel><strong>Location</strong></IonLabel>
            </IonItem>

            {/* Render Products */}
            {filteredProducts
              .slice(0, currentIndex)
              .map((product) =>
                product && product._id ? (
                  <Product
                    key={product._id}
                    _id={product._id}
                    name={product.name}
                    category={product.category}
                    price={product.price}
                    inStock={product.inStock}
                    photos={product.photos} // Pass the photos prop
                    location={product.location} // Pass the location prop
                    onEdit={(id) => history.push(`/product/${id}`)}
                  />
                ) : null
              )}
          </IonList>
        )}
        <IonInfiniteScroll
          threshold="100px"
          disabled={disableInfiniteScroll || isLoading}
          onIonInfinite={searchNext}
        >
          <IonInfiniteScrollContent loadingText="Loading more products..."></IonInfiniteScrollContent>
        </IonInfiniteScroll>
        {fetchingError && (
          <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
            {fetchingError.message || 'Failed to fetch products'}
          </div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/product')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
        {successMessage && (
          <IonToast
            isOpen={!!successMessage}
            message={successMessage}
            position="bottom"
            buttons={[
              {
                text: 'Dismiss',
                role: 'cancel',
              },
            ]}
            onDidDismiss={closeShowSuccess}
            duration={5000}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductList;
