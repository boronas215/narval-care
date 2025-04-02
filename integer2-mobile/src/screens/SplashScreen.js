import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';

// Asegura que el splash screen permanezca visible hasta que lo ocultemos manualmente
SplashScreen.preventAutoHideAsync();

const SplashScreenComponent = ({ navigation }) => {
  useEffect(() => {
    // Simulamos carga por 3 segundos y luego navegamos al login
    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
      navigation.replace('Login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <LinearGradient
      colors={['#00966C', '#00967C']}
      style={styles.container}
    >
      <Text style={styles.title}>Narval Care</Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
});

export default SplashScreenComponent;