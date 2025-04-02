// src/screens/patient/DevicesScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Dimensions,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebase';
import { ref, onValue, get } from 'firebase/database';
import { LineChart } from 'react-native-chart-kit';
import { FirebaseService, ESP32Simulator } from '../../firebase';
import { DeviceInfoModal, FirebaseDiagnostic } from '../../components';
const { width } = Dimensions.get('window');

const DevicesScreen = () => {
  const [user, setUser] = useState(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [heartRateData, setHeartRateData] = useState([]);
  const [oxygenData, setOxygenData] = useState([]);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [deviceInfoModalVisible, setDeviceInfoModalVisible] = useState(false);
  const [currentMeasurementData, setCurrentMeasurementData] = useState({
    bpm: 0,
    oxygen: 0,
    timestamp: null
  });

  // Cargar el usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
          
          // Verificar si el usuario tiene dispositivos conectados
          checkConnectedDevices(userData.id);
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      }
    };
    
    loadUser();
  }, []);

  // Verificar dispositivos conectados para el usuario
  const checkConnectedDevices = (userId) => {
    const devicesRef = ref(database, `users/${userId}/devices`);
    onValue(devicesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Aquí asumimos que podría haber múltiples dispositivos en el futuro
        // Por ahora solo nos enfocamos en el cardioxímetro
        const oximeter = data.oximeter || null;
        setConnectedDevice(oximeter);
      }
    });
  };

  // Iniciar medición
  const startMeasurement = () => {
    if (!user) {
      Alert.alert('Error', 'No se pudo identificar al usuario. Por favor, inicie sesión nuevamente.');
      return;
    }

    setIsMeasuring(true);
    setTimeLeft(30);
    setHeartRateData([]);
    setOxygenData([]);
    setModalVisible(true);
    
    // Iniciar nueva medición usando el servicio
    const measurementId = FirebaseService.startMeasurement(user.id);
    
    // Configurar el listener para datos en tiempo real
    listenForMeasurementData(user.id, measurementId);
    
    // Iniciar simulación del ESP32 enviando datos
    const stopESP32 = ESP32Simulator.startSendingData(measurementId, 30);
    
    // Guardar referencia para detener la simulación
    return () => {
      if (stopESP32) stopESP32();
    };
  };

  // Escuchar datos de medición en tiempo real
// Escuchar datos de medición en tiempo real
const listenForMeasurementData = (userId, measurementId) => {
  console.log(`Iniciando escucha de datos para medición ${measurementId}`);
  
  const dataRef = ref(database, `measurements/${measurementId}/data`);
  const unsubscribe = onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    console.log("Datos recibidos:", data);
    
    if (data) {
      // Convertir los datos a un array si vienen como objeto
      const dataArray = Array.isArray(data) 
        ? data 
        : Object.values(data);
      
      console.log("Array de datos:", dataArray);
      
      if (dataArray.length > 0) {
        // Ordenar por timestamp (si existe)
        dataArray.sort((a, b) => {
          return (a.timestamp || 0) - (b.timestamp || 0);
        });
        
        // Obtener el último punto de datos
        const latestData = dataArray[dataArray.length - 1];
        console.log("Último dato:", latestData);
        
        // Actualizar los datos para la visualización
        setCurrentMeasurementData({
          bpm: typeof latestData.bpm === 'number' ? latestData.bpm : 0,
          oxygen: typeof latestData.oxygen === 'number' ? latestData.oxygen : 0,
          timestamp: latestData.timestamp
        });
        
        // Extraer datos de ritmo cardíaco y oxigenación
        const bpmValues = dataArray
          .filter(item => typeof item.bpm === 'number' && item.bpm > 0)
          .map(item => item.bpm);
          
        const oxygenValues = dataArray
          .filter(item => typeof item.oxygen === 'number' && item.oxygen > 0)
          .map(item => item.oxygen);
        
        console.log("Valores BPM extraídos:", bpmValues);
        console.log("Valores SpO2 extraídos:", oxygenValues);
        
        // Actualizar los datos para los gráficos
        setHeartRateData(bpmValues);
        setOxygenData(oxygenValues);
      }
    }
  });
  
  // Configurar temporizador para finalizar la medición
  const timer = setInterval(() => {
    setTimeLeft(prevTime => {
      if (prevTime <= 1) {
        clearInterval(timer);
        finishMeasurement(userId, measurementId, unsubscribe);
        return 0;
      }
      return prevTime - 1;
    });
  }, 1000);
};

  // Finalizar la medición
  const finishMeasurement = (userId, measurementId, unsubscribe) => {
    // Desuscribirse del listener de datos en tiempo real
    if (unsubscribe) unsubscribe();
    
    // Calcular resumen de la medición
    const summary = {
      avgBpm: calculateAverage(heartRateData),
      avgOxygen: calculateAverage(oxygenData),
      maxBpm: heartRateData.length > 0 ? Math.max(...heartRateData) : 0,
      minBpm: heartRateData.length > 0 ? Math.min(...heartRateData) : 0,
      maxOxygen: oxygenData.length > 0 ? Math.max(...oxygenData) : 0,
      minOxygen: oxygenData.length > 0 ? Math.min(...oxygenData) : 0
    };
    
    // Utilizar el servicio para finalizar la medición
    FirebaseService.finishMeasurement(userId, measurementId, summary);
    
    setIsMeasuring(false);
    
    // Mostrar resumen de la medición por 5 segundos antes de cerrar
    setTimeout(() => {
      setModalVisible(false);
    }, 5000);
  };

  // Calcular promedio de un array de números
  const calculateAverage = (arr) => {
    console.log("Calculando promedio para array:", arr);
    
    if (!arr || arr.length === 0) {
      console.log("Array vacío, devolviendo 0");
      return 0;
    }
    
    // Filtrar valores no numéricos o cero
    const validValues = arr.filter(val => typeof val === 'number' && val > 0);
    console.log("Valores válidos:", validValues);
    
    if (validValues.length === 0) {
      console.log("No hay valores válidos, devolviendo 0");
      return 0;
    }
    
    const sum = validValues.reduce((a, b) => a + b, 0);
    console.log("Suma:", sum, "Cantidad:", validValues.length);
    
    const average = Math.round(sum / validValues.length);
    console.log("Promedio calculado:", average);
    
    return average;
  };

  // Conexión del dispositivo IoT
  const connectDevice = async () => {
    if (!user) {
      Alert.alert('Error', 'No se pudo identificar al usuario');
      return;
    }
    
    try {
      // Simulación de conexión con el dispositivo IoT
      Alert.alert(
        'Conectando dispositivo',
        'Buscando dispositivos cercanos...'
      );
      
      // Simular proceso de conexión
      setTimeout(() => {
        const deviceInfo = {
          name: 'CardioXímetro NarvalCare',
          deviceId: 'CX-' + Math.floor(Math.random() * 10000),
          firmwareVersion: '1.0.0',
          batteryLevel: 98,
          lastSyncTime: new Date().toISOString()
        };
        
        // Registrar el dispositivo en Firebase
        FirebaseService.registerDevice(user.id, 'oximeter', deviceInfo);
        
        // Actualizar el estado local
        setConnectedDevice(deviceInfo);
        
        Alert.alert(
          'Dispositivo conectado',
          `${deviceInfo.name} (ID: ${deviceInfo.deviceId}) ha sido conectado exitosamente.`
        );
      }, 2000);
    } catch (error) {
      console.error('Error al conectar dispositivo:', error);
      Alert.alert('Error', 'No se pudo conectar el dispositivo');
    }
  };

  // Renderizar el modal de medición
  const renderMeasurementModal = () => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          if (!isMeasuring) setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {isMeasuring ? 'Medición en progreso' : 'Resumen de medición'}
            </Text>
            
            {isMeasuring ? (
              <View style={styles.measurementProgress}>
                <View style={styles.timerContainer}>
                  <Text style={styles.timerText}>{timeLeft}</Text>
                  <Text style={styles.timerLabel}>segundos restantes</Text>
                </View>
                
                <View style={styles.currentReadings}>
                  <View style={styles.readingItem}>
                    <MaterialCommunityIcons name="heart-pulse" size={30} color="#e74c3c" />
                    <Text style={styles.readingValue}>{currentMeasurementData.bpm}</Text>
                    <Text style={styles.readingLabel}>BPM</Text>
                  </View>
                  
                  <View style={styles.readingItem}>
                    <MaterialCommunityIcons name="percent" size={30} color="#3498db" />
                    <Text style={styles.readingValue}>{currentMeasurementData.oxygen}</Text>
                    <Text style={styles.readingLabel}>SpO₂</Text>
                  </View>
                </View>
                
                {(heartRateData.length > 0 && oxygenData.length > 0) && (
                  <View style={styles.chartsContainer}>
                    <Text style={styles.chartTitle}>Ritmo Cardíaco</Text>
                    <LineChart
                      data={{
                        labels: [],
                        datasets: [{ data: heartRateData.slice(-10) }]
                      }}
                      width={width - 80}
                      height={100}
                      chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
                        style: {
                          borderRadius: 16
                        }
                      }}
                      bezier
                      style={styles.chart}
                    />
                    
                    <Text style={styles.chartTitle}>Oxigenación</Text>
                    <LineChart
                      data={{
                        labels: [],
                        datasets: [{ data: oxygenData.slice(-10) }]
                      }}
                      width={width - 80}
                      height={100}
                      chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                        style: {
                          borderRadius: 16
                        }
                      }}
                      bezier
                      style={styles.chart}
                    />
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.measurementSummary}>
                <Text style={styles.summaryTitle}>Medición completada</Text>
                
                <View style={styles.summaryStats}>
                  <View style={styles.summaryStatRow}>
                    <View style={[styles.summaryStat, styles.heartStat]}>
                      <MaterialCommunityIcons name="heart-pulse" size={24} color="#fff" />
                      <View>
                        <Text style={styles.summaryStatValue}>{calculateAverage(heartRateData)}</Text>
                        <Text style={styles.summaryStatLabel}>BPM Prom.</Text>
                      </View>
                    </View>
                    <View style={[styles.summaryStat, styles.oxygenStat]}>
                      <MaterialCommunityIcons name="percent" size={24} color="#fff" />
                      <View>
                        <Text style={styles.summaryStatValue}>{calculateAverage(oxygenData)}</Text>
                        <Text style={styles.summaryStatLabel}>SpO₂ Prom.</Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Dispositivos</Text>
      </View>
      
      <View style={styles.deviceSection}>
        <Text style={styles.sectionTitle}>Dispositivos Disponibles</Text>
        
        <View style={styles.deviceCard}>
          <View style={styles.deviceIconContainer}>
            <MaterialCommunityIcons name="heart-pulse" size={36} color="#e74c3c" />
          </View>
          
          <View style={styles.deviceInfo}>
            <View style={styles.deviceHeader}>
              <Text style={styles.deviceName}>Cardioxímetro</Text>
              <View style={[
                styles.statusIndicator, 
                connectedDevice ? styles.connectedIndicator : styles.disconnectedIndicator
              ]} />
              {connectedDevice && (
                <TouchableOpacity 
                  style={styles.infoButton}
                  onPress={() => setDeviceInfoModalVisible(true)}
                >
                  <MaterialCommunityIcons name="information-outline" size={18} color="#007bff" />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.deviceDescription}>
              Mide tu ritmo cardíaco y niveles de oxígeno en sangre en tiempo real.
            </Text>
            <View style={styles.deviceButtons}>
              {isMeasuring ? (
                <View style={styles.measuringIndicator}>
                  <ActivityIndicator size="small" color="#e74c3c" />
                  <Text style={styles.measuringText}>Midiendo... {timeLeft}s</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.startButton}
                  onPress={startMeasurement}
                >
                  <Text style={styles.startButtonText}>Comenzar Medición</Text>
                </TouchableOpacity>
              )}
              
              {!connectedDevice && (
                <TouchableOpacity
                  style={styles.connectButton}
                  onPress={connectDevice}
                >
                  <Text style={styles.connectButtonText}>Conectar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.healthTips}>
        <Text style={styles.tipsTitle}>Consejos de Salud</Text>
        <View style={styles.tipCard}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#3498db" />
          <Text style={styles.tipText}>
            Una frecuencia cardíaca en reposo normal para adultos oscila entre 60 y 100 latidos por minuto.
          </Text>
        </View>
        <View style={styles.tipCard}>
          <MaterialCommunityIcons name="information-outline" size={24} color="#3498db" />
          <Text style={styles.tipText}>
            Los niveles normales de oxígeno en sangre suelen estar entre 95% y 100%. Niveles por debajo del 92% podrían requerir atención médica.
          </Text>
        </View>
      </View>
      
      {/* Información adicional sobre la aplicación */}
      <View style={styles.appInfoContainer}>
        <Text style={styles.appInfoTitle}>Acerca de esta aplicación</Text>
        <Text style={styles.appInfoText}>
          Esta aplicación está diseñada para trabajar con el CardioXímetro NarvalCare, un dispositivo de monitoreo de salud que mide la frecuencia cardíaca y los niveles de oxígeno en sangre.
        </Text>
        <Text style={styles.appInfoText}>
          Los datos recopilados se almacenan de forma segura y pueden ser compartidos con su médico para un mejor seguimiento de su salud cardiovascular y respiratoria.
        </Text>
      </View>

      {/* Herramienta de diagnóstico para depuración - Quitar en producción */}
      {user && (
      <FirebaseDiagnostic userId={user.id} />
      )}
      
      {/* Renderizar el modal de medición */}
      {renderMeasurementModal()}
      
      {/* Renderizar el modal de información del dispositivo */}
      <DeviceInfoModal 
        visible={deviceInfoModalVisible}
        onClose={() => setDeviceInfoModalVisible(false)}
        deviceInfo={connectedDevice}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  deviceSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  deviceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  deviceIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  connectedIndicator: {
    backgroundColor: '#2ecc71',
  },
  disconnectedIndicator: {
    backgroundColor: '#e74c3c',
  },
  infoButton: {
    marginLeft: 8,
    padding: 2,
  },
  deviceDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  deviceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  startButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  startButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  connectButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 14,
  },
  measuringIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  measuringText: {
    marginLeft: 10,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  healthTips: {
    padding: 20,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  tipCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: width - 40,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  measurementProgress: {
    width: '100%',
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  timerLabel: {
    fontSize: 14,
    color: '#999',
  },
  currentReadings: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  readingItem: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    width: '45%',
  },
  readingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  readingLabel: {
    fontSize: 14,
    color: '#666',
  },
  chartsContainer: {
    width: '100%',
    marginTop: 10,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginVertical: 10,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
    marginBottom: 15,
  },
  measurementSummary: {
    width: '100%',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 20,
  },
  summaryStats: {
    width: '100%',
  },
  summaryStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryStat: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    width: '48%',
  },
  heartStat: {
    backgroundColor: '#e74c3c',
  },
  oxygenStat: {
    backgroundColor: '#3498db',
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  summaryStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 10,
  },
  closeButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  appInfoContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  appInfoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
});

export default DevicesScreen;