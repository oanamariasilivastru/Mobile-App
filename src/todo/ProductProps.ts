export interface MyPhoto {
  filepath: string;
  webviewPath?: string;
}

export interface ProductProps {
  _id?: string;
  name: string;
  category: string;
  price: number;
  inStock: boolean;
  photos: MyPhoto[];
  location?: {
    lat: number;
    lng: number;
  };
}
