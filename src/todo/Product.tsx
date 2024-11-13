import React, {memo} from "react";
import {IonItem, IonLabel, IonImg} from "@ionic/react";
import { getLogger } from "../core";
import { ProductProps } from "./ProductProps";

const log = getLogger('Product');

interface ProductPropsExt extends ProductProps {
    onEdit: (_id?: string) => void;
}

const Product: React.FC<ProductPropsExt> = ({ _id, name, price, category, inStock, photos, onEdit }) => {
    return (
        <IonItem onClick={() => onEdit(_id)}>
             {photos && photos.length > 0 && (
        <IonImg src={photos[0].webviewPath} style={{ width: '50px', height: '50px', marginRight: '10px' }} />
      )}
            <IonLabel>
                <h2>{name}</h2>
                <p>Price: ${price}</p>
                <p>Category: {category}</p>
                <p>{inStock ? 'In Stock' : 'Out of Stock'}</p>
            </IonLabel>
        </IonItem>
    );
};

export default memo(Product);