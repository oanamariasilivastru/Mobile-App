import React from 'react';
import { IonButton, IonLabel, IonItem } from '@ionic/react';
import { motion } from 'framer-motion';
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
  const imageUrl = photos && photos.length > 0 ? photos[0].webviewPath : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <IonItem>
        {/* Product Photo */}
        {imageUrl ? (
          <div
            style={{
              width: '50px',
              height: '50px',
              marginRight: '10px',
              overflow: 'hidden',
              borderRadius: '8px',
            }}
          >
            <img
              src={imageUrl}
              alt={name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div style={{ width: '50px', height: '50px', marginRight: '10px' }}></div> // Empty placeholder
        )}

        {/* Product Details */}
        <IonLabel>
          <h2>{name}</h2>
          <p>{category}</p>
        </IonLabel>
        <IonLabel>{price}</IonLabel>
        <IonLabel>{inStock ? 'Yes' : 'No'}</IonLabel>

        {/* Animated Actions */}
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <IonButton onClick={() => onEdit(_id)}>Edit</IonButton>
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <IonButton onClick={() => onViewOnMap(location)}>View on Map</IonButton>
        </motion.div>
      </IonItem>
    </motion.div>
  );
};

export default Product;
