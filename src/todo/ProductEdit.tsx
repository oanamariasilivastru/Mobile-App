import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { ProductContext } from './ProductProvider';
import { RouteComponentProps } from 'react-router';
import { ProductProps } from './ProductProps';

const log = getLogger('ProductEdit');

interface ProductEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const ProductEdit: React.FC<ProductEditProps> = ({ history, match }) => {
  const { products, saving, savingError, saveProduct } = useContext(ProductContext);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState('');
  const [inStock, setInStock] = useState<boolean>(false);
  const [product, setProduct] = useState<ProductProps>();

  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id || '';
    const foundProduct = products?.find(it => it._id === routeId);
    setProduct(foundProduct);
    if (foundProduct) {
      setName(foundProduct.name);
      setPrice(foundProduct.price);
      setCategory(foundProduct.category);
      setInStock(foundProduct.inStock);
    }
  }, [match.params.id, products]);

  const handleSave = useCallback(() => {
    const editedProduct: ProductProps = {
      _id: product?._id, // Preserve the ID if it exists
      name,
      price: price !== undefined ? price : 0, // Default to 0 if price is undefined
      category,
      inStock,
    };

    saveProduct && saveProduct(editedProduct).then(() => history.goBack());
  }, [product, saveProduct, name, price, category, inStock, history]);

  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit Product</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput
          value={name}
          placeholder="Product Name"
          onIonChange={e => setName(e.detail.value || '')}
        />
        <IonInput
          type="number"
          value={price !== undefined ? price : ''}
          placeholder="Price"
          onIonChange={e => setPrice(e.detail.value ? Number(e.detail.value) : undefined)}
        />
        <IonSelect
          value={category}
          placeholder="Select Category"
          onIonChange={e => setCategory(e.detail.value)}
        >
          <IonSelectOption value="Electronics">Electronics</IonSelectOption>
          <IonSelectOption value="Clothing">Clothing</IonSelectOption>
          <IonSelectOption value="Food">Food</IonSelectOption>
          <IonSelectOption value="Books">Books</IonSelectOption>
        </IonSelect>
        <IonSelect
          value={inStock ? 'true' : 'false'}
          placeholder="In Stock"
          onIonChange={e => setInStock(e.detail.value === 'true')}
        >
          <IonSelectOption value="true">Yes</IonSelectOption>
          <IonSelectOption value="false">No</IonSelectOption>
        </IonSelect>
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save product'}</div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default ProductEdit;
