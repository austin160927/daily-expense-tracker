import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from './firebase';
import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { Transaction } from '../constants/types';

const STORAGE_KEY = '@my_tracker_transactions_v1';
const FIRESTORE_COLLECTION = 'user_transactions';

// Fetch all transactions: Checks Firestore cloud first, merges with local cache
export const getLocalTransactions = async (): Promise<Transaction[]> => {
  try {
    let cloudList: Transaction[] = [];
    try {
      const querySnapshot = await getDocs(collection(db, FIRESTORE_COLLECTION));
      querySnapshot.forEach((d) => {
        cloudList.push(d.data() as Transaction);
      });
    } catch (cloudErr) {
      console.log('Firebase fetch offline / reading local cache:', cloudErr);
    }

    const localJson = await AsyncStorage.getItem(STORAGE_KEY);
    const localList: Transaction[] = localJson ? JSON.parse(localJson) : [];

    // Merge cloud and local without duplicates
    const map = new Map<string, Transaction>();
    [...localList, ...cloudList].forEach(item => map.set(item.id, item));
    const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);

    // Update local cache
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error('Error reading transactions:', e);
    return [];
  }
};

// Save transaction: Saves locally and directly persists to Firebase Cloud Firestore
export const saveTransaction = async (tx: Transaction): Promise<void> => {
  try {
    // 1. Instant local save
    const current = await getLocalTransactions();
    const updated = [tx, ...current.filter(item => item.id !== tx.id)];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // 2. Direct Sync to Firebase Firestore cloud database
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, tx.id);
      await setDoc(docRef, tx);
      console.log('Successfully synced to Firebase Firestore:', tx.id);
    } catch (fbErr) {
      console.error('Firebase Cloud Sync Error:', fbErr);
    }
  } catch (error) {
    console.error('Error saving transaction:', error);
    throw error;
  }
};

// Delete transaction from both local & Firebase Cloud
export const removeTransaction = async (id: string): Promise<void> => {
  try {
    // 1. Remove from local storage
    const current = await getLocalTransactions();
    const filtered = current.filter(item => item.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

    // 2. Delete from Firebase Firestore cloud
    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, id);
      await deleteDoc(docRef);
      console.log('Successfully deleted from Firebase Firestore:', id);
    } catch (fbErr) {
      console.error('Firebase Delete Error:', fbErr);
    }
  } catch (error) {
    console.error('Error removing transaction:', error);
    throw error;
  }
};

// Helper: Get today's ISO date string 'YYYY-MM-DD'
export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
