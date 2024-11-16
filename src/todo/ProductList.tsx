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
  IonModal,
  IonPage,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { motion } from 'framer-motion'; // Import framer-motion
import { AuthContext } from '../auth';
import { NetworkState } from '../hooks/NetworkState';
import { ProductContext } from './ProductProvider';
import Product from './Product';
import MyMap from '../hooks/MyMap';
import { getLogger } from '../core';

const log = getLogger('ProductList');

const ProductList: React.FC<RouteComponentProps> = ({ history }) => {
  const { products, fetchingError, successMessage, closeShowSuccess } = useContext(ProductContext);
  const { logout } = useContext(AuthContext);

  const [currentIndex, setCurrentIndex] = useState<number>(8);
  const [searchText, setSearchText] = useState<string>('');
  const [filter, setFilter] = useState<string>('all');
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );

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

  log('render');

  // Animation Variants for Blinking Text
  const blinkAnimation = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  // Animated Fab Button
  const AnimatedFab = ({ onClick }: { onClick: () => void }) => {
    const bounceVariants = {
      hover: { scale: 1.2 },
      rest: { scale: 1 },
    };

    return (
      <motion.div variants={bounceVariants} initial="rest" whileHover="hover">
        <IonFabButton onClick={onClick}>
          <IonIcon icon={add} />
        </IonFabButton>
      </motion.div>
    );
  };

  // Animated Modal
  const AnimatedModal = ({
    isOpen,
    onClose,
    children,
  }: {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
  }) => {
    const modalVariants = {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    };

    return (
      <motion.div
        variants={modalVariants}
        initial={isOpen ? 'hidden' : 'visible'}
        animate={isOpen ? 'visible' : 'hidden'}
        transition={{ duration: 0.5 }}
        style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
      >
        <IonModal isOpen={isOpen} onDidDismiss={onClose}>
          {children}
        </IonModal>
      </motion.div>
    );
  };

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
            debounce={500}
            onIonInput={(e) => setSearchText(e.detail.value!)}
            slot="secondary"
          />
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>Logout</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Animated Blinking Text */}
        <motion.div
          variants={blinkAnimation}
          initial="visible"
          animate="hidden"
          transition={{ repeat: Infinity, duration: 1 }}
          style={{
            textAlign: 'center',
            padding: '10px',
            fontSize: '18px',
            color: '#4caf50',
          }}
        >
          Welcome to the Product List! 🚀
        </motion.div>

        <IonLoading isOpen={isLoading} message="Loading products..." />
        {filteredProducts && (
          <IonList inset={true}>
            <IonItem lines="none">
              <IonLabel><strong>Photo</strong></IonLabel>
              <IonLabel><strong>Name</strong></IonLabel>
              <IonLabel><strong>Category</strong></IonLabel>
              <IonLabel><strong>Price</strong></IonLabel>
              <IonLabel><strong>In Stock</strong></IonLabel>
              <IonLabel><strong>Actions</strong></IonLabel>
            </IonItem>
            {filteredProducts.slice(0, currentIndex).map((product) =>
              product && product._id ? (
                <Product
                  key={product._id}
                  {...product}
                  onEdit={(id) => history.push(`/product/${id}`)}
                  onViewOnMap={(location) => {
                    if (location) {
                      setSelectedLocation(location);
                      setShowMapModal(true);
                    } else {
                      console.error('No location provided for this product.');
                    }
                  }}
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
          <IonInfiniteScrollContent loadingText="Loading more products..." />
        </IonInfiniteScroll>
        {fetchingError && (
          <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
            {fetchingError.message || 'Failed to fetch products'}
          </div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <AnimatedFab onClick={() => history.push('/product')} />
        </IonFab>
        {successMessage && (
          <IonToast
            isOpen={!!successMessage}
            message={successMessage}
            position="bottom"
            buttons={[{ text: 'Dismiss', role: 'cancel' }]}
            onDidDismiss={closeShowSuccess}
            duration={5000}
          />
        )}
        <AnimatedModal isOpen={showMapModal} onClose={() => setShowMapModal(false)}>
          <IonContent>
            {selectedLocation && (
              <MyMap
                lat={selectedLocation.lat}
                lng={selectedLocation.lng}
                onMapClick={() => {}}
                onMarkerClick={() => {}}
              />
            )}
          </IonContent>
        </AnimatedModal>
      </IonContent>
    </IonPage>
  );
};

export default ProductList;
