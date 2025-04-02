// src/firebase/FirebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCuDA0Q3IufOrk8oHu3NM5c6wIHG8UgVnI",
    authDomain: "mi-boro-app.firebaseapp.com",
    projectId: "mi-boro-app",
    storageBucket: "mi-boro-app.firebasestorage.app",
    messagingSenderId: "204984440396",
    appId: "1:204984440396:web:9d2bfae964c1edc9ea06e9",
    measurementId: "G-LCHN4MXT95",
    databaseURL: "https://mi-boro-app-default-rtdb.firebaseio.com/", // Asegúrate de añadir la URL de tu base de datos en tiempo real
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const analytics = getAnalytics(app);

export { app, database, analytics };