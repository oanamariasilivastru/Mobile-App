// src/pages/ProductEdit.tsx
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonFab,
  IonFabButton,
  IonIcon,
  IonActionSheet,
  IonToast,
} from '@ionic/react';
import { camera, trash, close } from 'ionicons/icons';
import { getLogger } from '../core';
import { ProductContext } from './ProductProvider';
import { RouteComponentProps } from 'react-router';
import { ProductProps, MyPhoto } from './ProductProps';
import { usePhotos } from '../hooks/usePhotos';
import MyMap from '../hooks/MyMap';
import axios from 'axios';

const log = getLogger('ProductEdit');

interface ProductEditProps extends RouteComponentProps<{ id?: string }> {}

const ProductEdit: React.FC<ProductEditProps> = ({ history, match }) => {
  const { products, updating, updatingError, updateProduct } = useContext(ProductContext);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [inStock, setInStock] = useState<boolean>(false);
  const [product, setProduct] = useState<ProductProps>();

  const routeId = match.params.id || '';

  // Initialize usePhotos with productId
  const { photos, takePhoto, deletePhoto, setInitialPhotos } = usePhotos(routeId);
  const [photoToDelete, setPhotoToDelete] = useState<MyPhoto | undefined>(undefined);

  // State for location
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  // State for toast
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    log('useEffect triggered');
    const currentProduct = products?.find((it) => it._id === routeId);
    setProduct(currentProduct);
    if (currentProduct) {
      setName(currentProduct.name);
      setCategory(currentProduct.category);
      setPrice(currentProduct.price);
      setInStock(currentProduct.inStock);
      log('Product found:', currentProduct);
      if (currentProduct.photos && currentProduct.photos.length > 0 && photos.length === 0) {
        // Initialize usePhotos with existing photos
        setInitialPhotos(currentProduct.photos);
        log('Initialized photos with existing product photos');
      }
      if (currentProduct.location) {
        setLocation(currentProduct.location);
      }
    } else {
      log('No product found for the given ID');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, products]);

  /**
   * Handles updating the product, including saving photos and location.
   */
  const handleUpdate = useCallback(async () => {
    if (!location) {
      setToastMessage('Please select a location on the map.');
      setShowToast(true);
      return;
    }
    try {
      log('handleUpdate triggered');

      // Pregătește produsul editat cu locația și pozele
      const editedProduct: ProductProps = product
        ? { ...product, name, category, price, inStock, photos, location: location || undefined }
        : { name, category, price, inStock, photos, location: location || undefined };
      
      log('Edited Product:', editedProduct);
      
      // Actualizează produsul prin context
      await updateProduct?.(editedProduct);
      log('Product updated via context');

      // Afișează toast de succes
      setToastMessage('Product updated successfully!');
      setShowToast(true);
      log('Success toast shown');

      // Navighează înapoi după un scurt delay
      setTimeout(() => {
        history.goBack();
        log('Navigated back');
      }, 1500);
    } catch (error) {
      console.error('Error updating product:', error);
      // Afișează toast de eroare
      setToastMessage('Failed to update product.');
      setShowToast(true);
    }
  }, [photos, routeId, product, name, category, price, inStock, location, updateProduct, history]);

  /**
   * Handles canceling the edit and navigating back.
   */
  const handleCancel = useCallback(() => {
    history.goBack();
    log('handleCancel triggered');
  }, [history]);

  /**
   * Handles taking a new photo.
   */
  const handleTakePhoto = async () => {
    log('handleTakePhoto triggered');
    await takePhoto();
    // Photos are updated via usePhotos hook
    log('Photo taken and added');
  };

  /**
   * Handles deleting a selected photo.
   * @param photo Photo to delete.
   */
  const handleDeletePhoto = (photo: MyPhoto) => {
    log('Deleting photo:', photo.filepath);
    deletePhoto(photo);
    setPhotoToDelete(undefined);
    log('Photo deleted');
  };

  /**
   * Handles map click to select location.
   * @param e Event object containing coordinates.
   */
  const handleMapClick = (e: { latitude: number; longitude: number }) => {
    setLocation({ lat: e.latitude, lng: e.longitude });
    log('Location selected via map:', e.latitude, e.longitude);
  };

  /**
   * Handles marker click (if needed).
   * @param e Event object containing marker details.
   */
  const handleMarkerClick = (e: { markerId: string; latitude: number; longitude: number }) => {
    log('Marker clicked:', e.markerId, e.latitude, e.longitude);
    // Add additional functionalities if needed
  };

  // Gestionarea evenimentelor de rețea
  useEffect(() => {
    const handleOffline = () => {
      log('Internet disconnected');
      setToastMessage('Internet connection lost. Some features may not work.');
      setShowToast(true);
    };

    const handleOnline = () => {
      log('Internet reconnected');
      setToastMessage('Internet connection restored.');
      setShowToast(true);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  log('render called');

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit Product</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Form Fields */}
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonInput
                placeholder="Name"
                value={name}
                onIonChange={(e) => setName(e.detail.value || '')}
                clearInput
                style={{ marginBottom: '10px' }}
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonInput
                placeholder="Category"
                value={category}
                onIonChange={(e) => setCategory(e.detail.value || '')}
                clearInput
                style={{ marginBottom: '10px' }}
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonInput
                placeholder="Price"
                type="number"
                value={price}
                onIonChange={(e) => setPrice(parseFloat(e.detail.value || '0'))}
                clearInput
                style={{ marginBottom: '10px' }}
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonCheckbox
                checked={inStock}
                onIonChange={(e) => setInStock(e.detail.checked)}
              >
                In Stock
              </IonCheckbox>
            </IonCol>
          </IonRow>
        </IonGrid>
        <br />

        {/* Map for selecting location */}
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <MyMap
                lat={location ? location.lat : 37.7749} // Default latitude if no location
                lng={location ? location.lng : -122.4194} // Default longitude if no location
                onMapClick={handleMapClick}
                onMarkerClick={handleMarkerClick}
              />
              {location && (
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <strong>Selected Location:</strong> Latitude: {location.lat.toFixed(4)}, Longitude: {location.lng.toFixed(4)}
                </div>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
        <br />

        {/* Photo Gallery Section */}
        <IonGrid>
          <IonRow>
            {photos.map((photo, index) => (
              <IonCol size="6" key={index}>
                <IonImg
                  onClick={() => setPhotoToDelete(photo)}
                  src={photo.webviewPath}
                  style={{ cursor: 'pointer', width: '100%', height: 'auto', borderRadius: '8px' }}
                />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={handleTakePhoto}>
            <IonIcon icon={camera} />
          </IonFabButton>
        </IonFab>
        <IonActionSheet
          isOpen={!!photoToDelete}
          buttons={[
            {
              text: 'Delete',
              role: 'destructive',
              icon: trash,
              handler: () => {
                if (photoToDelete) {
                  handleDeletePhoto(photoToDelete);
                }
              },
            },
            {
              text: 'Cancel',
              icon: close,
              role: 'cancel',
            },
          ]}
          onDidDismiss={() => setPhotoToDelete(undefined)}
        />

        {/* Loading and Error Handling */}
        <IonLoading isOpen={updating} message="Saving product..." />
        {updatingError && (
          <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
            {updatingError.message || 'Failed to save product'}
          </div>
        )}

        {/* Success Toast */}
        <IonToast
          isOpen={showToast}
          message={toastMessage}
          position="bottom"
          onDidDismiss={() => setShowToast(false)}
          duration={2000}
          color={toastMessage.includes('successfully') ? 'success' : 'danger'}
        />
      </IonContent>
      <IonToolbar>
        <IonButtons slot="start">
          <IonButton onClick={handleCancel}>Cancel</IonButton>
        </IonButtons>
        <IonButtons slot="end">
          <IonButton onClick={handleUpdate}>Save</IonButton>
        </IonButtons>
      </IonToolbar>
    </IonPage>
  );
};

export default ProductEdit;
