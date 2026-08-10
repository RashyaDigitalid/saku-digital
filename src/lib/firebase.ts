import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB3BbnzXOeLz0RSZWBx_e5U-FfhV-wkvP0",
  authDomain: "saku-digital.firebaseapp.com",
  projectId: "saku-digital",
  storageBucket: "saku-digital.firebasestorage.app",
  messagingSenderId: "871144579779",
  appId: "1:871144579779:web:e8977e37a59d15da3ff876"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
