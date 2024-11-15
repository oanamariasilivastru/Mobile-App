// ProductEdit.tsx
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
import { usePhotos } from '../hooks/usePhotos'; // Ensure correct path
import axios from 'axios'; // For photo uploads

const log = getLogger('ProductEdit');

interface ProductEditProps extends RouteComponentProps<{
  id?: string;
}> {}

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

  // Toast state for success messages
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
    } else {
      log('No product found for the given ID');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, products]);

  /**
   * Handles updating the product, including uploading new photos.
   */
  const handleUpdate = useCallback(async () => {
    try {
      log('handleUpdate triggered');
      // Simplify by temporarily removing photo uploads to isolate issue
      /*
      // Uncomment the following block after verifying basic save functionality
      // Example: Upload all new photos and get their URLs
      const uploadedPhotos: MyPhoto[] = [];
      for (let photo of photos) {
        if (!photo.webviewPath?.startsWith('https://')) { // Assuming uploaded photos have URLs
          log('Uploading photo:', photo.filepath);
          const response = await axios.post(`/api/products/${routeId}/photos`, {
            filepath: photo.filepath,
            base64: photo.webviewPath?.split(',')[1], // Extract base64 string
          });
          
          if (response.status === 200) {
            const uploadedPhotoUrl = response.data.url; // Ensure your backend returns the URL
            uploadedPhotos.push({ filepath: photo.filepath, webviewPath: uploadedPhotoUrl });
            log('Photo uploaded successfully:', uploadedPhotoUrl);
          } else {
            console.error('Failed to upload photo:', response.statusText);
            // Optionally, handle upload failure (e.g., retry or notify user)
          }
        } else {
          // Photo already has a URL
          uploadedPhotos.push(photo);
          log('Photo already has URL:', photo.webviewPath);
        }
      }

      // Prepare the edited product
      const editedProduct: ProductProps = product
        ? { ...product, name, category, price, inStock, photos: uploadedPhotos }
        : { name, category, price, inStock, photos: uploadedPhotos };
      */

      // Temporarily bypass photo uploads
      const editedProduct: ProductProps = product
        ? { ...product, name, category, price, inStock, photos }
        : { name, category, price, inStock, photos };
      
      log('Edited Product:', editedProduct);
      
      // Update the product via context
      await updateProduct?.(editedProduct);
      log('Product updated via context');

      // Show success toast
      setToastMessage('Product updated successfully!');
      setShowToast(true);
      log('Success toast shown');

      // Navigate back after a short delay
      setTimeout(() => {
        history.goBack();
        log('Navigated back');
      }, 1500);
    } catch (error) {
      console.error('Error updating product:', error);
      // Optionally, handle errors (e.g., show an error toast)
      setToastMessage('Failed to update product.');
      setShowToast(true);
    }
  }, [photos, routeId, product, name, category, price, inStock, updateProduct, history]);

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
   * @param photo The photo to delete.
   */
  const handleDeletePhoto = (photo: MyPhoto) => {
    log('Deleting photo:', photo.filepath);
    deletePhoto(photo);
    setPhotoToDelete(undefined);
    log('Photo deleted');
  };

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
