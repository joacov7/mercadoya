import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { getStorageInstance } from "./app";

export async function uploadImage(path: string, file: Blob): Promise<string> {
  const storageRef = ref(getStorageInstance(), path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteImage(path: string): Promise<void> {
  const storageRef = ref(getStorageInstance(), path);
  await deleteObject(storageRef);
}
