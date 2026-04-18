import { Injectable } from '@angular/core';
import {
  Firestore,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  collectionData,
  query,
  where,
  QueryConstraint,
  getDocs
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {

  constructor(private firestore: Firestore) { }

  setDocument(path: string, id: string, data: any) {
    const ref = doc(this.firestore, path, id);
    return setDoc(ref, data);
  }

  async getDocument(path: string, id: string) {
    const ref = doc(this.firestore, path, id);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  }

  updateDocument(path: string, id: string, data: any) {
    const ref = doc(this.firestore, path, id);
    return updateDoc(ref, data);
  }
  delteDocument(path: string, id: string) {
    const ref = doc(this.firestore, path, id);
    return deleteDoc(ref);
  }

  getCollection(path: string, field: string, value?: any) {
    const ref = collection(this.firestore, path);
    const q = query(ref, where(field, '==', value));
    return collectionData(q, { idField: 'id' });
  }


   async queryCollection<T>(path: string, ...constraints: QueryConstraint[]): Promise<T[]> {
    const ref = collection(this.firestore, path);
    const q = query(ref, ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
  }

}
