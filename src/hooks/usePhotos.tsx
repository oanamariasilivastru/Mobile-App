// usePhotos.ts
import { useEffect, useState, useCallback } from 'react';
import { useCamera } from './useCamera';
import { useFilesystem } from './useFilesystem';
import { usePreferences } from './usePreferences';
import { MyPhoto } from '../todo/ProductProps'; // Ensure correct import path

const PHOTOS_PREFIX = 'photos_';

export function usePhotos(productId: string) {
  const [photos, setPhotos] = useState<MyPhoto[]>([]);
  const { getPhoto } = useCamera();
  const { readFile, writeFile, deleteFile } = useFilesystem();
  const { get, set } = usePreferences();
  
  // Unique key for each product's photos
  const PHOTOS_KEY = `${PHOTOS_PREFIX}${productId}`;

  useEffect(() => {
    loadPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return {
    photos,
    takePhoto,
    deletePhoto,
    setInitialPhotos, // Expose setInitialPhotos
  };

  /**
   * Takes a new photo, saves it locally, and updates the photos state.
   */
  async function takePhoto() {
    try {
      const data = await getPhoto();
      const filepath = new Date().getTime() + '.jpeg';
      await writeFile(filepath, data.base64String!);
      const webviewPath = `data:image/jpeg;base64,${data.base64String}`;
      const newPhoto: MyPhoto = { filepath, webviewPath };
      const newPhotos = [newPhoto, ...photos];
      await set(PHOTOS_KEY, JSON.stringify(newPhotos.map(p => ({ filepath: p.filepath }))));
      setPhotos(newPhotos);
    } catch (error) {
      console.error('Error taking photo:', error);
      // Optionally, handle errors (e.g., show a toast notification)
    }
  }

  /**
   * Deletes a photo both locally and from the photos state.
   * @param photo The photo to delete.
   */
  async function deletePhoto(photo: MyPhoto) {
    try {
      const newPhotos = photos.filter(p => p.filepath !== photo.filepath);
      await set(PHOTOS_KEY, JSON.stringify(newPhotos));
      await deleteFile(photo.filepath);
      setPhotos(newPhotos);
    } catch (error) {
      console.error('Error deleting photo:', error);
      // Optionally, handle errors
    }
  }

  /**
   * Loads photos from local storage into the photos state.
   */
  async function loadPhotos() {
    try {
      const savedPhotoString = await get(PHOTOS_KEY);
      const savedPhotos = (savedPhotoString ? JSON.parse(savedPhotoString) : []) as MyPhoto[];
      console.log('Loaded photos:', savedPhotos);
      for (let photo of savedPhotos) {
        const data = await readFile(photo.filepath);
        photo.webviewPath = `data:image/jpeg;base64,${data}`;
      }
      setPhotos(savedPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
      // Optionally, handle errors
    }
  }

  /**
   * Sets initial photos when editing an existing product.
   * This is useful for populating the photos state with existing photos.
   * @param initialPhotos Array of existing photos from the product.
   */
  async function setInitialPhotos(initialPhotos: MyPhoto[]) {
    try {
      if (initialPhotos.length === 0) return;

      // Check if photos are already loaded to prevent overwriting
      const existingPhotosString = await get(PHOTOS_KEY);
      const existingPhotos = existingPhotosString ? JSON.parse(existingPhotosString) : [];
      if (existingPhotos.length > 0) return;

      // Save initial photos to local storage
      await set(PHOTOS_KEY, JSON.stringify(initialPhotos.map(p => ({ filepath: p.filepath }))));
      setPhotos(initialPhotos);
    } catch (error) {
      console.error('Error setting initial photos:', error);
      // Optionally, handle errors
    }
  }
}
