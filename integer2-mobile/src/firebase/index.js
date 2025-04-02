// src/firebase/index.js
// Este archivo centraliza las exportaciones de todos los servicios Firebase
// para facilitar su importación en otros archivos

export { app, database, analytics } from './FirebaseConfig';
export { default as FirebaseService } from './FirebaseService';
export { default as ESP32Simulator } from './ESP32Simulator';