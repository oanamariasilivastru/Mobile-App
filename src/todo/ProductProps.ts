export interface MyPhoto {
    filepath: string;
    webviewPath?: string;
  }
export interface ProductProps{
    _id?: string;
    name: string;
    price: number;
    category: string;
    inStock: boolean;
    photos: MyPhoto[];
}