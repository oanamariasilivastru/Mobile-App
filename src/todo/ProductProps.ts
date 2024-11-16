// src/ProductProps.ts

export interface MyPhoto {
  filepath: string;
  webviewPath?: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface ProductProps {
  _id?: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  photos: MyPhoto[];
  location?: Location;
}
