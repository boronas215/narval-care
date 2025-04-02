import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://10.13.7.9:3001';

const ProfileSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

const ProfileField = ({ label, value }) => (
  <View style={styles.field}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || 'No disponible'}</Text>
  </View>
);

const ProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      // Obtener el usuario guardado en AsyncStorage
      const userString = await AsyncStorage.getItem('user');
      if (!userString) {
        Alert.alert('Error', 'No hay sesión activa');
        return;
      }

      const user = JSON.parse(userString);
      const userId = user.id;

      // Obtener el perfil completo del usuario
      const response = await axios.get(`${API_URL}/api/users/patients/${userId}`);
      
      setProfile(response.data.patient);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      Alert.alert(
        'Error', 
        'No se pudo cargar la información del perfil',
        [{ text: 'OK' }]
      );
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Formatear fecha de nacimiento
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Determinar tipo de usuario
  const getUserType = (tipo) => {
    switch (tipo) {
      case 10:
        return 'Usuario General';
      case 11:
        return 'Usuario Privilegiado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil del Paciente</Text>
      </View>

      {profile ? (
        <>
          <ProfileSection title="Información Personal">
            <ProfileField label="Nombre Completo" value={`${profile.prinombre || ''} ${profile.segnombre || ''} ${profile.apepat || ''} ${profile.apemat || ''}`} />
            <ProfileField label="Tipo de Usuario" value={getUserType(profile.tipo)} />
            <ProfileField label="CURP" value={profile.curp} />
            <ProfileField label="Fecha de Nacimiento" value={formatDate(profile.fechanac)} />
            <ProfileField label="Correo Electrónico" value={profile.correo} />
            <ProfileField label="Teléfono" value={profile.tel} />
          </ProfileSection>

          <ProfileSection title="Contacto de Emergencia">
            <ProfileField label="Nombre" value={profile.nomfamiliar} />
            <ProfileField label="Teléfono" value={profile.telfamiliar} />
          </ProfileSection>

          <ProfileSection title="Dirección">
            <ProfileField label="Calle" value={profile.calle} />
            <ProfileField label="Número Exterior" value={profile.numext?.toString()} />
            <ProfileField label="Número Interior" value={profile.numint?.toString()} />
            <ProfileField label="Colonia" value={profile.colonia} />
            <ProfileField label="Código Postal" value={profile.codpost} />
            <ProfileField label="Ciudad" value={profile.ciudad} />
            <ProfileField label="Estado" value={profile.estado} />
          </ProfileSection>

          <ProfileSection title="Información Fiscal">
            <ProfileField label="RFC" value={profile.rfc} />
            <ProfileField label="Régimen Fiscal" value={profile.regimenfiscal} />
          </ProfileSection>
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            No se pudo cargar la información del perfil
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    backgroundColor: 'white',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007bff',
  },
  sectionContent: {
    gap: 10,
  },
  field: {
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#d9534f',
    textAlign: 'center',
  },
});

export default ProfileScreen;