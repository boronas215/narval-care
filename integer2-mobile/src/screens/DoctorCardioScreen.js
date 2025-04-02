import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Pantallas del doctor
import PatientsScreen from './doctor/PatientsScreen';
import ProfileScreen from './doctor/DoctorProfileScreen';
import MedicalChatScreen from './doctor/DoctorChatScreen';

const Tab = createBottomTabNavigator();

const DoctorCardioScreen = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
        },
      }}
    >
      <Tab.Screen
        name="Pacientes"
        component={PatientsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat Médico"
        component={MedicalChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chat-processing" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default DoctorCardioScreen;