import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your live Firebase Project credentials
const firebaseConfig = {
  apiKey: "AIzaSyA27EvThfoiapGreHZ7EMyIgSZjZms3PQ4",
  authDomain: "my-tracker-90313.firebaseapp.com",
  projectId: "my-tracker-90313",
  storageBucket: "my-tracker-90313.firebasestorage.app",
  messagingSenderId: "678371668298",
  appId: "1:678371668298:web:9886cced36480f1c25d1b3",
  measurementId: "G-RKE5GY2WKZ"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export default app;
