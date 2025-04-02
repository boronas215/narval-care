import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Importar pantallas desde la estructura de carpetas src
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import PatientPrivilegedScreen from './src/screens/PatientPrivilegedScreen';
import DoctorCardioScreen from './src/screens/DoctorCardioScreen';
import DoctorNeumologyScreen from './src/screens/DoctorNeumologyScreen';
import ChatScreen from './src/screens/ChatScreen';

// Inicializar Firebase
import './src/firebase/FirebaseConfig';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="PatientPrivileged" component={PatientPrivilegedScreen} />
          <Stack.Screen name="DoctorCardio" component={DoctorCardioScreen} />
          <Stack.Screen name="DoctorNeumology" component={DoctorNeumologyScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};