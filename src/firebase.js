// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Konfigurasi Firebase Anda
const firebaseConfig = {
  apiKey: "AIzaSyCNexDOdcoqYbUmwY0p-hC9A_AFUVYcjk8",
  authDomain: "masjid-keuangan-aa115.firebaseapp.com",
  projectId: "masjid-keuangan-aa115",
  storageBucket: "masjid-keuangan-aa115.appspot.com",
  messagingSenderId: "730621426554",
  appId: "1:730621426554:web:01918985ba2cc43be834c3"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Ekspor siap pakai
export { auth, db, storage };
