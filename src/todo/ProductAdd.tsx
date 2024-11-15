import React, { useCallback, useContext, useState } from 'react';
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

const log = getLogger('ProductAdd');

interface ProductEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const ProductAdd: React.FC<ProductEditProps> = ({ history }) => {
    const { updating, updatingError, addProduct } = useContext(ProductContext);
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState(0);
    const [inStock, setInStock] = useState(false);

    const handleAdd = useCallback(() => {
        const addedProduct: ProductProps = {
            name,
            category,
            price,
            inStock,
            photos: [], // Ensure photos is defined
            // Add other required fields with default or appropriate values if necessary
        };
        addProduct && addProduct(addedProduct).then(() => history.goBack());
    }, [addProduct, name, category, price, inStock, history]);

    const handleCancel = useCallback(() => {
        history.goBack();
    }, [history]);

    log('render');

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Add Product</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput
                    placeholder='Name'
                    value={name}
                    onIonChange={e => setName(e.detail.value || '')}
                />
                <br/>
                <IonInput
                    placeholder='Category'
                    value={category}
                    onIonChange={e => setCategory(e.detail.value || '')}
                />
                <br/>
                <IonInput
                    placeholder='Price'
                    type="number"
                    value={price}
                    onIonChange={e => setPrice(parseFloat(e.detail.value || '0'))}
                />
                <br/>
                <IonCheckbox
                    checked={inStock}
                    onIonChange={e => setInStock(e.detail.checked)}
                >
                    In Stock
                </IonCheckbox>
                <br/>

                <IonLoading isOpen={updating} />
                {updatingError && (
                    <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>
                        {updatingError.message || 'Failed to save product'}
                    </div>
                )}
            </IonContent>
            <IonToolbar>
                <IonButtons slot="start">
                    <IonButton onClick={handleCancel}>
                        Cancel
                    </IonButton>
                </IonButtons>
                <IonButtons slot="end">
                    <IonButton onClick={handleAdd}>
                        Save
                    </IonButton>
                </IonButtons>
            </IonToolbar>
        </IonPage>
    );
};

export default ProductAdd;
