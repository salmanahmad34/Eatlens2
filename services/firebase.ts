import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCkP7G_0VqUo9sfJyb81MGiZPu8Zw3ICSE",
    authDomain: "mrpop-2d730.firebaseapp.com",
    projectId: "mrpop-2d730",
    storageBucket: "mrpop-2d730.appspot.com",
    messagingSenderId: "227721444975",
    appId: "1:227721444975:web:0b02a238951fc27eea179a",
    measurementId: "G-9GVXR8G5J0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
