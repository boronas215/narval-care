// src/firebase/ESP32Simulator.js
import { database } from './FirebaseConfig';
import { ref, set, push, serverTimestamp } from 'firebase/database';

/**
 * Simulador de dispositivo ESP32 con sensor MAX30102
 * 
 * Este archivo simula el comportamiento de un ESP32 que envía
 * datos de un sensor MAX30102 (ritmo cardíaco y oxigenación)
 * a Firebase Realtime Database.
 * 
 * Usado para pruebas mientras se desarrolla el hardware real.
 */
class ESP32Simulator {
  /**
   * Inicia una simulación de envío de datos
   * 
   * @param {string} measurementId - ID de la medición en Firebase
   * @param {number} duration - Duración en segundos
   * @param {Object} options - Opciones adicionales
   * @returns {Function} Función para detener la simulación
   */
  static startSendingData(measurementId, duration = 30, options = {}) {
    // Valores iniciales
    let heartRate = options.initialHeartRate || Math.floor(Math.random() * (80 - 65) + 65);
    let oxygen = options.initialOxygen || Math.floor(Math.random() * (99 - 96) + 96);
    
    // Patrones de cambio (para simular datos más realistas)
    let heartRatePattern = this.generatePattern(heartRate, 5, duration, 'bpm');
    let oxygenPattern = this.generatePattern(oxygen, 2, duration, 'spo2');
    
    console.log(`[ESP32] Iniciando envío de datos a measurement/${measurementId}`);
    console.log(`[ESP32] Patrón generado HR:`, heartRatePattern.slice(0, 5), '...');
    console.log(`[ESP32] Patrón generado SpO2:`, oxygenPattern.slice(0, 5), '...');
    
    let counter = 0;
    const interval = setInterval(() => {
      if (counter >= duration) {
        clearInterval(interval);
        console.log(`[ESP32] Finalizado envío de datos después de ${duration} segundos`);
        return;
      }
      
      // Obtener los valores del patrón o generar aleatorios como respaldo
      const bpm = 92;
      
      const spo2 = 90;
      
      // Enviar datos a Firebase
      this.sendDataPoint(measurementId, {
        bpm, 
        oxygen: spo2,
        rawIr: Math.floor(Math.random() * 10000) + 30000, // Datos crudos simulados
        rawRed: Math.floor(Math.random() * 8000) + 25000,
        temperature: 36.5 + (Math.random() * 0.7),
        batteryLevel: 100 - (counter / duration * 5), // Simular consumo de batería
      });
      
      counter++;
    }, 1000);
    
    // Devolver función para detener la simulación
    return () => {
      clearInterval(interval);
      console.log('[ESP32] Simulación detenida manualmente');
    };
  }
  
  /**
   * Envía un único punto de datos a Firebase
   */
  static sendDataPoint(measurementId, data) {
    const dataRef = ref(database, `measurements/${measurementId}/data`);
    const newDataRef = push(dataRef);
    
    set(newDataRef, {
      ...data,
      timestamp: serverTimestamp()
    });
    
    console.log(`[ESP32] Datos enviados: BPM=${data.bpm}, SpO2=${data.oxygen}%`);
  }
  
  /**
   * Genera un patrón de valores que cambian gradualmente
   * para simular datos más realistas
   */
  static generatePattern(initialValue, maxChange, length, type) {
    const pattern = new Array(length);
    let currentValue = initialValue;
    
    for (let i = 0; i < length; i++) {
      // Pequeña variación aleatoria
      const change = Math.random() * maxChange * 2 - maxChange;
      
      // Asegurarse de que los valores se mantengan en rangos realistas
      if (type === 'bpm') {
        // Para ritmo cardíaco: 50-120 BPM
        currentValue = Math.max(50, Math.min(120, currentValue + change));
      } else {
        // Para oxigenación: 90-100%
        currentValue = Math.max(90, Math.min(100, currentValue + change));
      }
      
      pattern[i] = Math.round(currentValue);
    }
    
    return pattern;
  }
}

export default ESP32Simulator;