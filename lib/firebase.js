import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBGiim3UDIQp7ACL_DFG82k1CnSNZuvoDg",
  authDomain: "medilink-8b42a.firebaseapp.com",
  projectId: "medilink-8b42a",
  storageBucket: "medilink-8b42a.firebasestorage.app",
  messagingSenderId: "696567663861",
  appId: "1:696567663861:web:5d0716e6cd33ce8ead89bc",
};

const app = initializeApp(firebaseConfig);

export default app;