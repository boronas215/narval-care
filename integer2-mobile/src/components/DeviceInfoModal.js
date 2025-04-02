// src/components/DeviceInfoModal.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DeviceInfoModal = ({ visible, onClose, deviceInfo }) => {
  if (!deviceInfo) return null;
  
  // Formatear fecha de última sincronización
  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Mostrar nivel de batería con color adecuado
  const getBatteryIcon = (level) => {
    if (level >= 90) return 'battery';
    if (level >= 70) return 'battery-70';
    if (level >= 50) return 'battery-50';
    if (level >= 30) return 'battery-30';
    if (level >= 20) return 'battery-20';
    return 'battery-alert';
  };
  
  const getBatteryColor = (level) => {
    if (level >= 50) return '#2ecc71';
    if (level >= 20) return '#f39c12';
    return '#e74c3c';
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Información del Dispositivo</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialCommunityIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.deviceInfoContainer}>
            <View style={styles.deviceIconContainer}>
              <MaterialCommunityIcons name="heart-pulse" size={48} color="#e74c3c" />
              <Text style={styles.deviceName}>{deviceInfo.name}</Text>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Detalles del Dispositivo</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>ID del Dispositivo</Text>
                <Text style={styles.infoValue}>{deviceInfo.deviceId}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Versión de Firmware</Text>
                <Text style={styles.infoValue}>{deviceInfo.firmwareVersion}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nivel de Batería</Text>
                <View style={styles.batteryContainer}>
                  <MaterialCommunityIcons 
                    name={getBatteryIcon(deviceInfo.batteryLevel)} 
                    size={20} 
                    color={getBatteryColor(deviceInfo.batteryLevel)} 
                  />
                  <Text style={[
                    styles.batteryText,
                    { color: getBatteryColor(deviceInfo.batteryLevel) }
                  ]}>
                    {deviceInfo.batteryLevel}%
                  </Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Última Sincronización</Text>
                <Text style={styles.infoValue}>{formatDate(deviceInfo.lastSyncTime)}</Text>
              </View>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Estado</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusIndicator}>
                  <View style={[styles.statusDot, { backgroundColor: '#2ecc71' }]} />
                  <Text style={styles.statusText}>Conectado</Text>
                </View>
                <Text style={styles.statusDescription}>
                  El dispositivo está conectado y funcionando correctamente.
                </Text>
              </View>
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Especificaciones Técnicas</Text>
              <Text style={styles.specText}>
                - Sensor: MAX30102 para medición de pulso y oxígeno
              </Text>
              <Text style={styles.specText}>
                - Microcontrolador: ESP32 con conectividad WiFi y Bluetooth
              </Text>
              <Text style={styles.specText}>
                - Frecuencia de muestreo: 100Hz
              </Text>
              <Text style={styles.specText}>
                - Precisión de medición de ritmo cardíaco: ±3 BPM
              </Text>
              <Text style={styles.specText}>
                - Precisión de medición de SpO₂: ±2%
              </Text>
              <Text style={styles.specText}>
                - Batería: Litio recargable 500mAh
              </Text>
            </View>
            
            <View style={styles.actionsContainer}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => alert('Función de actualización no disponible en esta versión')}
              >
                <MaterialCommunityIcons name="update" size={20} color="white" />
                <Text style={styles.actionButtonText}>Actualizar Firmware</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.dangerButton]}
                onPress={() => alert('Dispositivo desconectado con éxito')}
              >
                <MaterialCommunityIcons name="bluetooth-off" size={20} color="white" />
                <Text style={styles.actionButtonText}>Desconectar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: width - 30,
    maxHeight: '80%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  deviceInfoContainer: {
    padding: 15,
  },
  deviceIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#333',
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 15,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
  },
  specText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  dangerButton: {
    backgroundColor: '#e74c3c',
  },
});

export default DeviceInfoModal;