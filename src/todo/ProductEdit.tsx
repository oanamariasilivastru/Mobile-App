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
    IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { ProductContext } from './ProductProvider';
import { RouteComponentProps } from 'react-router';
import { ProductProps } from './ProductProps';

const log = getLogger('ProductEdit');

interface ProductEditProps extends RouteComponentProps<{
    id?: string;
}> {
}

const ProductEdit: React.FC<ProductEditProps> = ({ history, match }) => {
    const { products, updating, updatingError, updateProduct } = useContext(ProductContext);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState(0);
    const [inStock, setInStock] = useState(false);
    const [product, setProduct] = useState<ProductProps>();

    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const product = products?.find(it => it._id === routeId);
        setProduct(product);
        if (product) {
            setName(product.name);
            setCategory(product.category);
            setPrice(product.price);
            setInStock(product.inStock);
        }
    }, [match.params.id, products]);

    const handleUpdate = useCallback(() => {
        const editedProduct = product ? { ...product, name, category, price, inStock } : {
            name,
            category,
            price,
            inStock
        };
        updateProduct && updateProduct(editedProduct).then(() => history.goBack());
    }, [product, updateProduct, name, category, price, inStock, history]);

    const handleCancel = useCallback(() => {
        history.goBack();
    }, [product, history]);

    log('render');

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit Product</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput placeholder='Name' value={name} onIonChange={e => setName(e.detail.value || '')} />
                <br/>
                <IonInput placeholder='Category' value={category} onIonChange={e => setCategory(e.detail.value || '')} />
                <br/>
                <IonInput placeholder='Price' type="number" value={price}
                          onIonChange={e => setPrice(parseFloat(e.detail.value || '0'))} />
                <br/>
                <IonCheckbox checked={inStock}
                             onIonChange={e => setInStock(e.detail.checked)}> In Stock </IonCheckbox>
                <br/>

                <IonLoading isOpen={updating} />
                {updatingError && (
                    <div>{updatingError.message || 'Failed to save product'}</div>
                )}
            </IonContent>
            <IonToolbar>
                <IonButtons slot="start">
                    <IonButton onClick={handleCancel}>
                        Cancel
                    </IonButton>
                </IonButtons>
                <IonButtons slot="end">
                    <IonButton onClick={handleUpdate}>
                        Save
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonPage>
    );
};

export default ProductEdit;
