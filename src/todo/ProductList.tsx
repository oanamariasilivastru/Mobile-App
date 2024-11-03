import React, { useContext, useEffect, useState } from 'react';
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
import { ProductProps } from './ProductProps';

const log = getLogger('ProductList');
const productsPerPage = 10;
const filterValues = ['inStock', 'outOfStock'];

const ProductList: React.FC<RouteComponentProps> = ({ history }) => {
  const { products, fetchingError, successMessage, closeShowSuccess } = useContext(ProductContext);
  const { logout } = useContext(AuthContext);
  const [productsAux, setProductsAux] = useState<ProductProps[] | undefined>([]);
  const [index, setIndex] = useState<number>(0);
  const [more, setHasMore] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchData();
  }, [products]);

  useEffect(() => {
    let filteredProducts = products;
    if (searchText) {
      filteredProducts = filteredProducts?.filter(
        (product) => product.name && product.name.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (filter) {
      filteredProducts = filteredProducts?.filter((product) =>
        filter === 'inStock' ? product.inStock : !product.inStock
      );
    }

    console.log('Filtered Products:', filteredProducts);

    setProductsAux(filteredProducts);
  }, [products, filter, searchText]);

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
            onIonChange={(e) => setFilter(e.detail.value)}
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
            debounce={200}
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
        {productsAux && (
          <IonList inset={true}>
            <IonItem>
              <IonLabel>Name</IonLabel>
              <IonLabel>Category</IonLabel>
              <IonLabel>Price</IonLabel>
              <IonLabel>In Stock</IonLabel>
            </IonItem>

            {productsAux.map((product) =>
              product && product._id ? (
                <Product
                  key={product._id}
                  _id={product._id}
                  name={product.name}
                  category={product.category}
                  price={product.price}
                  inStock={product.inStock}
                  onEdit={(id) => history.push(`/product/${id}`)}
                />
              ) : null
            )}
          </IonList>
        )}
        <IonInfiniteScroll
          threshold="100px"
          disabled={!more}
          onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}
        >
          <IonInfiniteScrollContent loadingText="Loading more products..."></IonInfiniteScrollContent>
        </IonInfiniteScroll>
        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch products'}</div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/product')}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
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
      </IonContent>
    </IonPage>
  );

  function handleLogout() {
    logout?.();
    history.push('/login');
  }

  function fetchData() {
    if (products) {
      const newIndex = Math.min(index + productsPerPage, products.length);
      if (newIndex >= products.length) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
      setProductsAux(products.slice(0, newIndex));
      setIndex(newIndex);
    }
  }

  async function searchNext($event: CustomEvent<void>) {
    await fetchData();
    await ($event.target as HTMLIonInfiniteScrollElement).complete();
  }
};

export default ProductList;
