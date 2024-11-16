import React from 'react';
import { IonItem, IonLabel, IonButton } from '@ionic/react';
import { ProductPropsExt } from './ProductProps';

const Product: React.FC<ProductPropsExt> = ({
  _id,
  name,
  category,
  price,
  inStock,
  photos,
  location,
  onEdit,
  onViewOnMap,
}) => {
  // Add checks to prevent runtime errors
  if (!_id || !name || !category || !photos) {
    console.error('Missing required product props:', { _id, name, category, photos });
    return null;
  }

  return (
    <IonItem>
      {/* Display product photo */}
      <div
        style={{
          width: '60px',
          height: '60px',
          overflow: 'hidden',
          borderRadius: '8px',
          marginRight: '10px',
        }}
      >
        <img
          src={photos[0]?.webviewPath || 'placeholder.png'}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Display product details */}
      <IonLabel>{name}</IonLabel>
      <IonLabel>{category}</IonLabel>
      <IonLabel>{price || 'N/A'}</IonLabel>
      <IonLabel>{inStock ? 'Yes' : 'No'}</IonLabel>

      {/* Edit button */}
      <IonButton onClick={() => onEdit(_id)}>Edit</IonButton>

      {/* View on map button */}
      <IonButton
        onClick={() => {
          if (location) {
            onViewOnMap(location);
          } else {
            console.error('Location is undefined for product:', _id);
          }
        }}
      >
        View on Map
      </IonButton>
    </IonItem>
  );
};

export default Product;
