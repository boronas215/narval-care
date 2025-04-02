// screens/patient/MedicalChatScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL de tu API
const API_URL = 'http://10.13.7.9:3001';

const MedicalChatScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Cargar el usuario actual
  useEffect(() => {
    const loadUser = async () => {
      const userString = await AsyncStorage.getItem('user');
      if (userString) {
        setUser(JSON.parse(userString));
      }
    };
    loadUser();
  }, []);

  // Cargar contactos
  const fetchContacts = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_URL}/api/messages/contacts/${user.id}`);
      if (!response.ok) {
        throw new Error('Error al cargar contactos');
      }
      
      const data = await response.json();
      setContacts(data.contacts);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  // Configurar intervalo de actualización
  useEffect(() => {
    if (user) {
      fetchContacts();
      
      // Configurar intervalo para actualizar contactos cada 10 segundos
      const interval = setInterval(fetchContacts, 10000);
      setRefreshInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [user]);

  // Limpiar intervalo al desmontar
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  const navigateToChat = (contactId, contactName, asignacionId) => {
    navigation.navigate('Chat', {
      contactId,
      contactName,
      asignacionId
    });
  };

  const renderContactItem = ({ item }) => {
    const lastMessageText = item.lastMessage?.mensaje || 'No hay mensajes aún';
    const lastMessageTime = item.lastMessage 
      ? formatTime(item.lastMessage.fecha_envio) 
      : '';
    
    // Determinar el tipo de doctor (Cardiólogo o Neumólogo)
    const doctorType = item.tipo === 20 ? 'Cardiólogo' : 'Neumólogo';
    
    return (
      <TouchableOpacity 
        style={styles.contactItem}
        onPress={() => navigateToChat(
          item.id, 
          `Dr. ${item.prinombre} ${item.apepat}`,
          item.asignacion_id
        )}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.prinombre.charAt(0)}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
        <View style={styles.contactInfo}>
          <View style={styles.contactHeader}>
            <Text style={styles.contactName}>Dr. {item.prinombre} {item.apepat}</Text>
            <Text style={styles.timeText}>{lastMessageTime}</Text>
          </View>
          <Text style={styles.doctorType}>{doctorType}</Text>
          <Text 
            style={[styles.messagePreview, item.unreadCount > 0 && styles.unreadMessage]}
            numberOfLines={1}
          >
            {lastMessageText}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Función para formatear la hora
  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    // Si es hoy, mostrar hora
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // Si es esta semana, mostrar día
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
      return days[date.getDay()];
    }
    
    // Si es más antiguo, mostrar fecha
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat Médico</Text>
      </View>

      {contacts.length > 0 ? (
        <FlatList
          data={contacts}
          renderItem={renderContactItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.contactsList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="chat-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No tienes doctores asignados</Text>
          <Text style={styles.emptySubtext}>
            Los doctores que te sean asignados aparecerán aquí para que puedas consultarlos
          </Text>
        </View>
      )}
    </View>
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
  contactsList: {
    padding: 10,
  },
  contactItem: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  contactName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  doctorType: {
    fontSize: 12,
    color: '#007bff',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#999',
  },
  messagePreview: {
    fontSize: 14,
    color: '#666',
  },
  unreadMessage: {
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default MedicalChatScreen;