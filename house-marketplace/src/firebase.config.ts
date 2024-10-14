// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1PSH_H9wecsXXdbz59bjUu72G8Epsxtw",
  authDomain: "house-marketplace-app-41c3e.firebaseapp.com",
  projectId: "house-marketplace-app-41c3e",
  storageBucket: "house-marketplace-app-41c3e.appspot.com",
  messagingSenderId: "571235900380",
  appId: "1:571235900380:web:29cc66c533f8843b52cd19",
  measurementId: "G-75ZXMW2VJD"
};

// Initialize Firebase
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
export const db = getFirestore()