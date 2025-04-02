import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PatientsScreen = () => {
  // Datos estáticos de ejemplo
  const mockPatients = [
    {
      id: '1',
      prinombre: 'Juan',
      apepat: 'Pérez',
      tipoNombre: 'Gral',
      correo: 'juan.perez@ejemplo.com',
    },
    {
      id: '2',
      prinombre: 'María',
      apepat: 'López',
      tipoNombre: 'Priv',
      correo: 'maria.lopez@ejemplo.com',
    },
    {
      id: '3',
      prinombre: 'Roberto',
      apepat: 'Gómez',
      tipoNombre: 'Gral',
      correo: 'roberto.gomez@ejemplo.com',
    },
  ];

  const renderPatientItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.patientCard} 
      onPress={() => Alert.alert('Información', 'Funcionalidad en desarrollo: Ver historial de mediciones del paciente')}
    >
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.prinombre} {item.apepat}</Text>
        <Text style={styles.patientDetails}>
          {item.tipoNombre === 'Gral' ? 'General' : 'Privilegiado'} • {item.correo}
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#007bff" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Pacientes</Text>
      </View>

      <View style={styles.developmentNotice}>
        <MaterialCommunityIcons name="information-outline" size={20} color="#007bff" />
        <Text style={styles.developmentText}>
          Esta es una vista de demostración con datos de ejemplo
        </Text>
      </View>

      <FlatList
        data={mockPatients}
        renderItem={renderPatientItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
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
  developmentNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f2ff',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  developmentText: {
    marginLeft: 10,
    color: '#007bff',
    fontSize: 14,
  },
  listContainer: {
    padding: 10,
  },
  patientCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  patientDetails: {
    fontSize: 14,
    color: '#666',
  },
});

export default PatientsScreen;