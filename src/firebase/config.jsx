import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCWuItY3Tn7nYPOcbryDWWk6PM7D6cLUnM",
  authDomain: "inventory-dbc6c.firebaseapp.com",
  projectId: "inventory-dbc6c",
  storageBucket: "inventory-dbc6c.firebasestorage.app",
  messagingSenderId: "515684598172",
  appId: "1:515684598172:web:6378bc1677faa61293c859",
  measurementId: "G-LX7VKMDB7N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, analytics }