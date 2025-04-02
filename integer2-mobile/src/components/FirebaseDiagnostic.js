// src/components/FirebaseDiagnostic.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { database } from '../firebase';
import { ref, set, push, get, child, serverTimestamp } from 'firebase/database';

/**
 * Componente diagnóstico para probar la conexión con Firebase
 * Solo para depuración, no usar en producción
 */
const FirebaseDiagnostic = ({ userId }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Añadir un mensaje al log de resultados
  const addResult = (message, isError = false) => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 8);
    setResults(prev => [{
      id: Date.now().toString(),
      message,
      timestamp,
      isError
    }, ...prev]);
  };

  // Test de lectura de datos
  const testRead = async () => {
    if (!userId) {
      addResult('Error: userId no proporcionado', true);
      return;
    }

    setLoading(true);
    addResult('Iniciando prueba de lectura...');

    try {
      const userRef = ref(database, `users/${userId}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        addResult(`Lectura exitosa: Se encontraron datos para el usuario ${userId}`);
        console.log('Datos del usuario:', snapshot.val());
      } else {
        addResult(`No se encontraron datos para el usuario ${userId}`, true);
      }
    } catch (error) {
      addResult(`Error al leer datos: ${error.message}`, true);
      console.error('Error completo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test de escritura de datos
  const testWrite = async () => {
    if (!userId) {
      addResult('Error: userId no proporcionado', true);
      return;
    }

    setLoading(true);
    addResult('Iniciando prueba de escritura...');

    try {
      const testRef = ref(database, `users/${userId}/diagnostics/tests`);
      const newTestRef = push(testRef);
      
      await set(newTestRef, {
        timestamp: serverTimestamp(),
        testType: 'write',
        status: 'success',
        device: 'mobile',
        randomValue: Math.random().toString(36).substring(2, 8)
      });
      
      addResult('Escritura exitosa: Datos guardados correctamente');
    } catch (error) {
      addResult(`Error al escribir datos: ${error.message}`, true);
      console.error('Error completo:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test de creación de medición
  const testCreateMeasurement = async () => {
    if (!userId) {
      addResult('Error: userId no proporcionado', true);
      return;
    }

    setLoading(true);
    addResult('Creando medición de prueba...');

    try {
      // 1. Crear entrada en measurements del usuario
      const measurementRef = ref(database, `users/${userId}/measurements`);
      const newMeasurementRef = push(measurementRef);
      const measurementId = newMeasurementRef.key;
      
      await set(newMeasurementRef, {
        startTime: serverTimestamp(),
        deviceType: 'cardioximeter_test',
        status: 'completed',
        endTime: serverTimestamp(),
        summary: {
          avgBpm: 72,
          avgOxygen: 98,
          maxBpm: 80,
          minBpm: 65,
          maxOxygen: 99,
          minOxygen: 97
        }
      });
      
      // 2. Crear datos de ejemplo
      const dataRef = ref(database, `measurements/${measurementId}/data`);
      
      // Crear 10 datos de ejemplo
      for (let i = 0; i < 10; i++) {
        const newDataRef = push(dataRef);
        await set(newDataRef, {
          bpm: 65 + Math.floor(Math.random() * 15),
          oxygen: 96 + Math.floor(Math.random() * 4),
          timestamp: serverTimestamp()
        });
      }
      
      addResult(`Medición creada con éxito. ID: ${measurementId}`);
    } catch (error) {
      addResult(`Error al crear medición: ${error.message}`, true);
      console.error('Error completo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Diagnóstico de Firebase</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={testRead}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Probar Lectura</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={testWrite}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Probar Escritura</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.wideButton, loading && styles.disabledButton]}
          onPress={testCreateMeasurement}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Crear Medición de Prueba</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.resultsTitle}>Resultados:</Text>
      <ScrollView style={styles.resultsContainer}>
        {results.map(result => (
          <View
            key={result.id}
            style={[
              styles.resultItem,
              result.isError && styles.errorResult
            ]}
          >
            <Text style={styles.resultTimestamp}>{result.timestamp}</Text>
            <Text style={styles.resultMessage}>{result.message}</Text>
          </View>
        ))}
        
        {results.length === 0 && (
          <Text style={styles.noResults}>No hay resultados para mostrar</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 10,
    marginBottom: 10,
  },
  wideButton: {
    flex: 1,
    marginRight: 0,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#a0c8ff',
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultsContainer: {
    maxHeight: 300,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
  },
  resultItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  errorResult: {
    backgroundColor: '#ffebee',
  },
  resultTimestamp: {
    fontSize: 12,
    color: '#888',
    marginBottom: 3,
  },
  resultMessage: {
    fontSize: 14,
    color: '#333',
  },
  noResults: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
});

export default FirebaseDiagnostic;