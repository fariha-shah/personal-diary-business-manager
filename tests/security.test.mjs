import { readFile } from 'node:fs/promises';
import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getMetadata, deleteObject } from 'firebase/storage';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-personal-diary',
    firestore: { host: '127.0.0.1', port: 8080, rules: await readFile('firestore.rules', 'utf8') },
    storage: { host: '127.0.0.1', port: 9199, rules: await readFile('storage.rules', 'utf8') },
  });
});
after(async () => { await env?.cleanup(); });

test('email/password login persists records across a new session', async () => {
  const app = initializeApp({ apiKey: 'demo-api-key', projectId: 'demo-personal-diary' }, 'login-test');
  try {
    const auth = getAuth(app);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    const db = getFirestore(app);
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    const email = `test-${Date.now()}@example.com`;
    const password = 'Test-only-password-123';
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    const record = doc(db, `users/${user.uid}/diaryEntries/session-test`);
    await assertSucceeds(setDoc(record, { title: 'Saved across sessions' }));
    await signOut(auth);
    await signInWithEmailAndPassword(auth, email, password);
    const snapshot = await assertSucceeds(getDoc(record));
    if (snapshot.data()?.title !== 'Saved across sessions') throw new Error('Saved diary entry was lost.');
    await assert.rejects(signInWithEmailAndPassword(auth, email, 'wrong-password'));
  } finally {
    await deleteApp(app);
  }
});

test('owners can create, read, list, update and delete each supported collection', async () => {
  const db = env.authenticatedContext('alice').firestore();
  for (const name of ['diaryEntries', 'expenses', 'loans', 'payments', 'paymentMethods',
    'calculatorHistory', 'calendarEvents', 'properties', 'clients', 'followups',
    'dashboardTasks', 'dashboardNotes', 'dashboardProperties', 'dashboardBuyers', 'dashboardDeals']) {
    const record = doc(db, `users/alice/${name}/record`);
    await assertSucceeds(setDoc(record, { title: 'test', createdAt: new Date().toISOString() }));
    await assertSucceeds(getDoc(record));
    await assertSucceeds(getDocs(collection(db, `users/alice/${name}`)));
    await assertSucceeds(updateDoc(record, { title: 'updated' }));
    await assertSucceeds(deleteDoc(record));
  }
});

test('anonymous users and other accounts cannot read or mutate private records', async () => {
  const owner = env.authenticatedContext('alice').firestore();
  await setDoc(doc(owner, 'users/alice/diaryEntries/private'), { title: 'private' });
  for (const ctx of [env.unauthenticatedContext(), env.authenticatedContext('bob')]) {
    const db = ctx.firestore();
    const record = doc(db, 'users/alice/diaryEntries/private');
    await assertFails(getDoc(record));
    await assertFails(getDocs(collection(db, 'users/alice/diaryEntries')));
    await assertFails(setDoc(record, { title: 'stolen' }));
    await assertFails(updateDoc(record, { title: 'changed' }));
    await assertFails(deleteDoc(record));
  }
});

test('unknown collections, root documents and nested paths are denied', async () => {
  const db = env.authenticatedContext('alice').firestore();
  for (const path of ['users/alice', 'users/alice/admin/role', 'users/alice/diaryEntries/a/nested/b']) {
    await assertFails(setDoc(doc(db, path), { title: 'test' }));
  }
});

test('settings accept the existing schema only and remain private', async () => {
  const db = env.authenticatedContext('alice').firestore();
  await assertSucceeds(setDoc(doc(db, 'users/alice/settings/profile'), { profile: { name: 'Alice' }, theme: 'dark' }));
  await assertFails(setDoc(doc(db, 'users/alice/settings/profile'), { role: 'admin' }));
  await assertFails(getDoc(doc(env.authenticatedContext('bob').firestore(), 'users/alice/settings/profile')));
});

test('storage accepts owner images and denies foreign access, invalid types, oversize files and overwrites', async () => {
  const store = env.authenticatedContext('alice').storage();
  const image = ref(store, 'users/alice/properties/test');
  await assertSucceeds(uploadBytes(image, new Uint8Array([1, 2, 3]), { contentType: 'image/png' }));
  await assertSucceeds(getMetadata(image));
  for (const ctx of [env.unauthenticatedContext(), env.authenticatedContext('bob')]) {
    const foreign = ref(ctx.storage(), 'users/alice/properties/test');
    await assertFails(getMetadata(foreign));
    await assertFails(uploadBytes(foreign, new Uint8Array([1]), { contentType: 'image/png' }));
    await assertFails(deleteObject(foreign));
  }
  await assertFails(uploadBytes(image, new Uint8Array([1]), { contentType: 'image/png' }));
  await assertFails(uploadBytes(ref(store, 'users/alice/properties/script'), new Uint8Array([1]), { contentType: 'text/html' }));
  await assertFails(uploadBytes(ref(store, 'users/alice/properties/large'), new Uint8Array(5 * 1024 * 1024 + 1), { contentType: 'image/png' }));
  await assertSucceeds(deleteObject(image));
});
