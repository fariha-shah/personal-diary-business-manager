import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, storage } from '../config/firebase';

// Existing UI components use image strings; keep that interface while moving
// new image payloads out of Firestore. Old inline images remain readable.
export async function storeImage(value, kind, uploadedPaths) {
  if (!value || !value.startsWith('data:')) return value;
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Sign in before uploading files.');
  const match = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/.exec(value);
  if (!match) throw new Error('Choose a JPEG, PNG, WebP or GIF image.');
  const bytes = Math.floor(match[2].replace(/\s/g, '').length * 3 / 4)
    - (match[2].endsWith('==') ? 2 : match[2].endsWith('=') ? 1 : 0);
  if (bytes > 5 * 1024 * 1024) throw new Error('Images must be 5 MB or smaller.');
  const path = `users/${uid}/${kind}/${crypto.randomUUID()}`;
  const result = await uploadString(ref(storage, path), value, 'data_url', { contentType: match[1] });
  uploadedPaths.push(path);
  return getDownloadURL(result.ref);
}

// If a record fails to save, remove only objects created for that attempt.
export async function withUploads(operation) {
  const uploadedPaths = [];
  try {
    return await operation((value, kind) => storeImage(value, kind, uploadedPaths));
  } catch (error) {
    await Promise.allSettled(uploadedPaths.map((path) => deleteObject(ref(storage, path))));
    throw error;
  }
}
