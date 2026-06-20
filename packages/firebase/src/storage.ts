import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getFirebaseApp } from "./app";

export async function uploadImage(path: string, file: Blob): Promise<string> {
  const storageRef = ref(getStorage(getFirebaseApp()), path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteImage(path: string): Promise<void> {
  const storageRef = ref(getStorage(getFirebaseApp()), path);
  await deleteObject(storageRef);
}
