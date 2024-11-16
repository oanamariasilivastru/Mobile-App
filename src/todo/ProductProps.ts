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

// Extended interface for additional functionality
export interface ProductPropsExt extends ProductProps {
  onEdit: (id: string | undefined) => void;
  onViewOnMap: (location: Location | undefined) => void;
}
