// src/components/HistoricalChart.js
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const HistoricalChart = ({ 
  title, 
  data = [], 
  labels = [], 
  color = '#007bff',
  formatYLabel = (value) => value,
  yAxisSuffix = '',
  minValue = null,
  maxValue = null
}) => {
  
  // Si no hay datos, mostrar mensaje
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay datos disponibles</Text>
        </View>
      </View>
    );
  }
  
  // Configurar las opciones del gráfico
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(${hexToRgb(color)}, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '5',
      strokeWidth: '2',
      stroke: color
    },
    formatYLabel,
    yAxisSuffix
  };
  
  // Si se especificaron valores mínimos/máximos
  if (minValue !== null) {
    chartConfig.yAxisMinValue = minValue;
  }
  
  if (maxValue !== null) {
    chartConfig.yAxisMaxValue = maxValue;
  }
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <LineChart
        data={{
          labels: labels,
          datasets: [{ data }]
        }}
        width={width - 40}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
        fromZero={minValue === null}
        yAxisInterval={5}
      />
    </View>
  );
};

// Función auxiliar para convertir color hex a RGB
const hexToRgb = (hex) => {
  // Eliminar el # si existe
  hex = hex.replace('#', '');
  
  // Convertir a RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginLeft: 10,
  },
  chart: {
    borderRadius: 16,
    paddingRight: 20,
    paddingLeft: 0,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
  }
});

export default HistoricalChart;