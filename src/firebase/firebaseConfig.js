import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyDVqKs5iWsDnZT7Jaso1usrR-GyAoUkuWM",
  authDomain: "submit-exercies.firebaseapp.com",
  projectId: "submit-exercies",
  storageBucket: "submit-exercies.firebasestorage.app",
  messagingSenderId: "1054665070224",
  appId: "1:1054665070224:web:31ca71c0fe2cee9f26ea15",
  measurementId: "G-9TR9RR0Z68"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };