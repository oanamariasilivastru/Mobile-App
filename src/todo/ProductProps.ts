// ProductProps.ts
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

export interface ProductsState {
  products: ProductProps[];
  fetchingError: Error | null;
  successMessage: string;
  closeShowSuccess: () => void;
  loadProducts: () => Promise<void>;
  updateProduct: (product: ProductProps) => Promise<void>;
  // Alte proprietăți după necesitate
}
