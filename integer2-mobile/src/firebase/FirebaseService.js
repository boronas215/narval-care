// src/firebase/FirebaseService.js
import { database } from './FirebaseConfig';
import { ref, set, push, serverTimestamp } from 'firebase/database';

// Clase para manejar todas las operaciones con Firebase
class FirebaseService {
  // Inicia una nueva medición
  static startMeasurement(userId) {
    // Crear una nueva referencia para la medición
    const measurementRef = ref(database, `users/${userId}/measurements`);
    const newMeasurementRef = push(measurementRef);
    const measurementId = newMeasurementRef.key;
    
    // Guardar datos iniciales
    set(newMeasurementRef, {
      startTime: serverTimestamp(),
      deviceType: 'cardioximeter',
      status: 'in-progress'
    });
    
    return measurementId;
  }
  
  // Finaliza una medición
  static finishMeasurement(userId, measurementId, summary) {
    const measurementRef = ref(database, `users/${userId}/measurements/${measurementId}`);
    
    return set(measurementRef, {
      endTime: serverTimestamp(),
      status: 'completed',
      summary
    }, { merge: true });
  }
  
  // Envía datos de medición en tiempo real
  static sendMeasurementData(measurementId, data) {
    const dataRef = ref(database, `measurements/${measurementId}/data`);
    const newDataRef = push(dataRef);
    
    return set(newDataRef, {
      ...data,
      timestamp: serverTimestamp()
    });
  }
  
  // Registra un dispositivo para un usuario
  static registerDevice(userId, deviceType, deviceInfo) {
    const deviceRef = ref(database, `users/${userId}/devices/${deviceType}`);
    
    return set(deviceRef, {
      ...deviceInfo,
      registeredAt: serverTimestamp(),
      status: 'active'
    });
  }
  
  // Actualiza el estado de un dispositivo
  static updateDeviceStatus(userId, deviceType, status) {
    const statusRef = ref(database, `users/${userId}/devices/${deviceType}/status`);
    
    return set(statusRef, status);
  }
  
  // Simula datos de dispositivo IoT para pruebas
  // Simula datos de dispositivo IoT para pruebas
  static simulateIoTDevice(measurementId, durationSeconds = 30) {
    console.log(`Iniciando simulación de datos para medición ${measurementId}`);
    
    let secondsElapsed = 0;
    const interval = setInterval(() => {
      // Generar datos aleatorios simulados
      const bpm = 92;
      const oxygen = 90;
      
      // Enviar datos a Firebase
      this.sendMeasurementData(measurementId, { bpm, oxygen });
      
      secondsElapsed++;
      console.log(`Datos simulados enviados (${secondsElapsed}/${durationSeconds}): BPM=${bpm}, SpO2=${oxygen}`);
      
      if (secondsElapsed >= durationSeconds) {
        clearInterval(interval);
        console.log(`Simulación completada después de ${durationSeconds} segundos`);
      }
    }, 1000); // Enviar cada segundo
    
    return interval;
  }
  
  // Calcula el resumen de los datos de medición
  static calculateMeasurementSummary(dataArray) {
    if (!dataArray || dataArray.length === 0) {
      return {
        avgBpm: 0,
        avgOxygen: 0,
        maxBpm: 0,
        minBpm: 0,
        maxOxygen: 0,
        minOxygen: 0
      };
    }
    
    // Extrae valores BPM y SpO2
    const bpmValues = dataArray.map(item => item.bpm || 0).filter(value => value > 0);
    const oxygenValues = dataArray.map(item => item.oxygen || 0).filter(value => value > 0);
    
    // Calcula promedios
    const avgBpm = bpmValues.length > 0 
      ? Math.round(bpmValues.reduce((sum, value) => sum + value, 0) / bpmValues.length) 
      : 0;
      
    const avgOxygen = oxygenValues.length > 0 
      ? Math.round(oxygenValues.reduce((sum, value) => sum + value, 0) / oxygenValues.length) 
      : 0;
    
    return {
      avgBpm,
      avgOxygen,
      maxBpm: bpmValues.length > 0 ? Math.max(...bpmValues) : 0,
      minBpm: bpmValues.length > 0 ? Math.min(...bpmValues) : 0,
      maxOxygen: oxygenValues.length > 0 ? Math.max(...oxygenValues) : 0,
      minOxygen: oxygenValues.length > 0 ? Math.min(...oxygenValues) : 0
    };
  }
}

export default FirebaseService;