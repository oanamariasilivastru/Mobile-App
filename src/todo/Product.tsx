import React, {memo} from "react";
import {IonItem, IonLabel} from "@ionic/react";
import { getLogger } from "../core";
import { ProductProps } from "./ProductProps";

const log = getLogger('Product');

interface ProductPropsExt extends ProductProps {
    onEdit: (id?: string) => void;
}

const Product: React.FC<ProductPropsExt> = ({ id, name, price, category, inStock, onEdit }) => {
    return (
        <IonItem onClick={() => onEdit(id)}>
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