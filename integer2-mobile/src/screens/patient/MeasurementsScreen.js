// src/screens/patient/MeasurementsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Modal
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '../../firebase';
import { ref, onValue, query, orderByChild, limitToLast, get } from 'firebase/database';
import { LineChart } from 'react-native-chart-kit';
import { FirebaseService } from '../../firebase';
import { HistoricalChart } from '../../components';

const { width } = Dimensions.get('window');

const MeasurementsScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [measurements, setMeasurements] = useState([]);
  const [filteredMeasurements, setFilteredMeasurements] = useState([]);
  const [activeFilter, setActiveFilter] = useState('today');
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    avgBpm: 0,
    avgOxygen: 0,
    minBpm: 0,
    maxBpm: 0,
    minOxygen: 0,
    maxOxygen: 0,
    measurementsCount: 0
  });
  const [historicalData, setHistoricalData] = useState({
    bpm: [],
    oxygen: [],
    labels: []
  });

  // Cargar el usuario al iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userString = await AsyncStorage.getItem('user');
        if (userString) {
          const userData = JSON.parse(userString);
          setUser(userData);
          
          // Cargar mediciones para este usuario
          fetchMeasurements(userData.id);
        }
      } catch (error) {
        console.error('Error al cargar usuario:', error);
      }
    };
    
    loadUser();
  }, []);

  // Calcular estadísticas y datos históricos
  useEffect(() => {
    if (filteredMeasurements.length > 0) {
      // Calcular estadísticas resumen
      const bpmValues = filteredMeasurements.map(m => m.summary?.avgBpm || 0).filter(v => v > 0);
      const oxygenValues = filteredMeasurements.map(m => m.summary?.avgOxygen || 0).filter(v => v > 0);
      
      // Calcular promedios
      const avgBpm = bpmValues.length > 0 
        ? Math.round(bpmValues.reduce((sum, val) => sum + val, 0) / bpmValues.length) 
        : 0;
        
      const avgOxygen = oxygenValues.length > 0 
        ? Math.round(oxygenValues.reduce((sum, val) => sum + val, 0) / oxygenValues.length) 
        : 0;
      
      setSummaryStats({
        avgBpm,
        avgOxygen,
        minBpm: bpmValues.length > 0 ? Math.min(...bpmValues) : 0,
        maxBpm: bpmValues.length > 0 ? Math.max(...bpmValues) : 0,
        minOxygen: oxygenValues.length > 0 ? Math.min(...oxygenValues) : 0,
        maxOxygen: oxygenValues.length > 0 ? Math.max(...oxygenValues) : 0,
        measurementsCount: filteredMeasurements.length
      });
      
      // Preparar datos para gráficos históricos
      // Usamos solo las últimas 7 mediciones para no saturar el gráfico
      const recentMeasurements = filteredMeasurements.slice(0, 7).reverse();
      
      const bpmData = recentMeasurements.map(m => m.summary?.avgBpm || 0);
      const oxygenData = recentMeasurements.map(m => m.summary?.avgOxygen || 0);
      
      // Crear etiquetas de fechas para el eje X
      const dateLabels = recentMeasurements.map(m => {
        const date = new Date(m.endTime);
        return `${date.getDate()}/${date.getMonth() + 1}`;
      });
      
      setHistoricalData({
        bpm: bpmData,
        oxygen: oxygenData,
        labels: dateLabels
      });
    }
  }, [filteredMeasurements]);

  // Cargar mediciones del usuario
  const fetchMeasurements = (userId) => {
    const measurementsRef = query(
      ref(database, `users/${userId}/measurements`),
      orderByChild('endTime'),
      limitToLast(100) // Obtener las últimas 100 mediciones como máximo
    );
    
    onValue(measurementsRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Datos obtenidos de Firebase:", data);
      const measurementsArray = [];
      
      if (data) {
        Object.keys(data).forEach((key) => {
          const measurement = data[key];
          
          // Solo incluir mediciones completadas
          if (measurement.status === 'completed') {
            measurementsArray.push({
              id: key,
              ...measurement,
              // Convertir timestamps de Firebase a objetos Date
              endTime: measurement.endTime ? new Date(measurement.endTime) : new Date(),
              startTime: measurement.startTime ? new Date(measurement.startTime) : new Date()
            });
          }
        });
      }
      
      // Ordenar por fecha (más reciente primero)
      measurementsArray.sort((a, b) => b.endTime - a.endTime);
      setMeasurements(measurementsArray);
      
      // Aplicar filtro actual
      applyFilter(measurementsArray, activeFilter);
      setLoading(false);
    });
  };

  // Aplicar filtro a las mediciones
  const applyFilter = (data, filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    let filtered;
    
    switch (filter) {
      case 'today':
        filtered = data.filter(item => item.endTime >= today);
        break;
      case 'week':
        filtered = data.filter(item => item.endTime >= oneWeekAgo);
        break;
      case 'month':
        filtered = data.filter(item => item.endTime >= oneMonthAgo);
        break;
      default:
        filtered = data;
    }
    
    setFilteredMeasurements(filtered);
    setActiveFilter(filter);
  };

  // Cambiar el filtro actual
  const changeFilter = (filter) => {
    applyFilter(measurements, filter);
  };

  // Ver detalles de una medición
  const viewMeasurementDetails = async (measurementId) => {
    try {
      if (!user) return;
      
      // Buscar en las mediciones ya cargadas
      const measurement = measurements.find(m => m.id === measurementId);
      
      if (measurement) {
        // Obtener datos detallados de la medición
        const dataRef = ref(database, `measurements/${measurementId}/data`);
        const dataSnapshot = await get(dataRef);
        
        const measurementData = dataSnapshot.val() || [];
        
        // Preparar datos para mostrar en detalle
        const detailedMeasurement = {
          ...measurement,
          data: Array.isArray(measurementData) ? measurementData : Object.values(measurementData),
        };
        
        setSelectedMeasurement(detailedMeasurement);
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error al obtener detalles de medición:', error);
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (date) => {
    if (!date) return 'Fecha desconocida';
    
    const options = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    };
    
    return date.toLocaleDateString('es-ES', options);
  };

  // Renderizar elementos de filtro
  const renderFilterButtons = () => {
    console.log("Renderizando filtros. Mediciones filtradas:", filteredMeasurements.length);
    return (
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'today' && styles.activeFilterButton
          ]}
          onPress={() => changeFilter('today')}
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === 'today' && styles.activeFilterButtonText
          ]}>Hoy</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'week' && styles.activeFilterButton
          ]}
          onPress={() => changeFilter('week')}
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === 'week' && styles.activeFilterButtonText
          ]}>Última Semana</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'month' && styles.activeFilterButton
          ]}
          onPress={() => changeFilter('month')}
        >
          <Text style={[
            styles.filterButtonText,
            activeFilter === 'month' && styles.activeFilterButtonText
          ]}>Último Mes</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Renderizar un elemento de la lista de mediciones
  const renderMeasurementItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.measurementCard}
        onPress={() => viewMeasurementDetails(item.id)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <MaterialCommunityIcons 
              name="heart-pulse" 
              size={24} 
              color="#e74c3c" 
            />
            <Text style={styles.cardTitle}>Medición de Cardioxímetro</Text>
          </View>
          <Text style={styles.cardDate}>{formatDate(item.endTime)}</Text>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Ritmo Cardíaco</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{item.summary?.avgBpm || '--'}</Text>
              <Text style={styles.statUnit}>BPM</Text>
            </View>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Oxígeno en Sangre</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{item.summary?.avgOxygen || '--'}</Text>
              <Text style={styles.statUnit}>%</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.viewDetailsText}>Tocar para ver detalles</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
        </View>
      </TouchableOpacity>
    );
  };

  // Renderizar el modal de detalles de medición
  const renderDetailsModal = () => {
    if (!selectedMeasurement) return null;
    
    // Extraer datos para gráficos
    const heartRateData = selectedMeasurement.data.map(item => item.bpm || 0);
    const oxygenData = selectedMeasurement.data.map(item => item.oxygen || 0);
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles de la Medición</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Información General</Text>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Fecha</Text>
                  <Text style={styles.detailsValue}>{formatDate(selectedMeasurement.endTime)}</Text>
                </View>
                <View style={styles.detailsRow}>
                  <Text style={styles.detailsLabel}>Duración</Text>
                  <Text style={styles.detailsValue}>
                    {Math.round((selectedMeasurement.endTime - selectedMeasurement.startTime) / 1000)} segundos
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Resumen</Text>
                <View style={styles.statsGrid}>
                  <View style={styles.statBlock}>
                    <Text style={styles.statBlockLabel}>BPM Promedio</Text>
                    <Text style={[styles.statBlockValue, styles.heartRateColor]}>
                      {selectedMeasurement.summary?.avgBpm || '--'}
                    </Text>
                  </View>
                  <View style={styles.statBlock}>
                    <Text style={styles.statBlockLabel}>BPM Máximo</Text>
                    <Text style={[styles.statBlockValue, styles.heartRateColor]}>
                      {selectedMeasurement.summary?.maxBpm || '--'}
                    </Text>
                  </View>
                  <View style={styles.statBlock}>
                    <Text style={styles.statBlockLabel}>BPM Mínimo</Text>
                    <Text style={[styles.statBlockValue, styles.heartRateColor]}>
                      {selectedMeasurement.summary?.minBpm || '--'}
                    </Text>
                  </View>
                  <View style={styles.statBlock}>
                    <Text style={styles.statBlockLabel}>SpO₂ Promedio</Text>
                    <Text style={[styles.statBlockValue, styles.oxygenColor]}>
                      {selectedMeasurement.summary?.avgOxygen || '--'}%
                    </Text>
                  </View>
                  <View style={styles.statBlock}>
                    <Text style={styles.statBlockLabel}>SpO₂ Máximo</Text>
                    <Text style={[styles.statBlockValue, styles.oxygenColor]}>
                      {selectedMeasurement.summary?.maxOxygen || '--'}%
                    </Text>
                  </View>
                  <View style={styles.statBlock}>
                    <Text style={styles.statBlockLabel}>SpO₂ Mínimo</Text>
                    <Text style={[styles.statBlockValue, styles.oxygenColor]}>
                      {selectedMeasurement.summary?.minOxygen || '--'}%
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionTitle}>Gráficos</Text>
                
                <Text style={styles.chartTitle}>Ritmo Cardíaco (BPM)</Text>
                <LineChart
                  data={{
                    labels: [],
                    datasets: [{ data: heartRateData.length ? heartRateData : [0] }]
                  }}
                  width={width - 60}
                  height={180}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(231, 76, 60, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: '#e74c3c'
                    }
                  }}
                  bezier
                  style={styles.chart}
                />
                
                <Text style={styles.chartTitle}>Oxígeno en Sangre (SpO₂)</Text>
                <LineChart
                  data={{
                    labels: [],
                    datasets: [{ 
                      data: oxygenData.length ? oxygenData : [0],
                      // Establecer un rango fijo para la oxigenación (90% - 100%)
                      withDots: true,
                    }]
                  }}
                  width={width - 60}
                  height={180}
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: {
                      borderRadius: 16
                    },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: '#3498db'
                    },
                    // Configurar un rango fijo para la oxigenación
                    yAxisSuffix: '%',
                    yAxisMinValue: 90,
                    yAxisMaxValue: 100
                  }}
                  bezier
                  style={styles.chart}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
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
        <Text style={styles.headerTitle}>Historial de Mediciones</Text>
      </View>
      
      {renderFilterButtons()}
      
      {filteredMeasurements.length > 0 ? (
        <>
          {/* Resumen estadístico */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Resumen del Período</Text>
            <View style={styles.summaryStats}>
              <View style={styles.summaryRow}>
                <View style={[styles.summaryStat, { backgroundColor: '#e74c3c' }]}>
                  <MaterialCommunityIcons name="heart-pulse" size={20} color="#fff" />
                  <View style={styles.summaryStatContent}>
                    <Text style={styles.summaryStatValue}>{summaryStats.avgBpm}</Text>
                    <Text style={styles.summaryStatLabel}>BPM Prom.</Text>
                  </View>
                </View>
                <View style={[styles.summaryStat, { backgroundColor: '#3498db' }]}>
                  <MaterialCommunityIcons name="percent" size={20} color="#fff" />
                  <View style={styles.summaryStatContent}>
                    <Text style={styles.summaryStatValue}>{summaryStats.avgOxygen}</Text>
                    <Text style={styles.summaryStatLabel}>SpO₂ Prom.</Text>
                  </View>
                </View>
              </View>
              <View style={styles.statInfoRow}>
                <Text style={styles.statInfoText}>
                  {summaryStats.measurementsCount} mediciones en este período
                </Text>
                <Text style={styles.statInfoText}>
                  Rango BPM: {summaryStats.minBpm}-{summaryStats.maxBpm}
                </Text>
                <Text style={styles.statInfoText}>
                  Rango SpO₂: {summaryStats.minOxygen}-{summaryStats.maxOxygen}
                </Text>
              </View>
            </View>
          </View>
          
          {/* Gráficos históricos */}
          <ScrollView horizontal={false} style={styles.chartsContainer}>
            <HistoricalChart
              title="Historial de Ritmo Cardíaco"
              data={historicalData.bpm}
              labels={historicalData.labels}
              color="#e74c3c"
              yAxisSuffix=" bpm"
            />
            
            <HistoricalChart
              title="Historial de Oxigenación"
              data={historicalData.oxygen}
              labels={historicalData.labels}
              color="#3498db"
              yAxisSuffix="%"
              minValue={90}
              maxValue={100}
            />
          </ScrollView>
          
          <Text style={styles.sectionTitle}>Mediciones Individuales</Text>
          <FlatList
            data={filteredMeasurements}
            renderItem={renderMeasurementItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="chart-line" size={60} color="#ccc" />
          <Text style={styles.emptyText}>
            No hay mediciones para el período seleccionado
          </Text>
          <Text style={styles.emptySubtext}>
            Realiza una medición desde la sección de dispositivos
          </Text>
        </View>
      )}
      
      {renderDetailsModal()}
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: 'white',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  activeFilterButton: {
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summaryContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  summaryStats: {
    width: '100%',
  },
  summaryRow: {
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
  summaryStatContent: {
    marginLeft: 10,
  },
  summaryStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  summaryStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  statInfoRow: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
  },
  statInfoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
  },
  chartsContainer: {
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
    marginLeft: 15,
    color: '#333',
  },
  listContainer: {
    padding: 15,
  },
  measurementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 15,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#f9f9f9',
  },
  viewDetailsText: {
    fontSize: 12,
    color: '#999',
    marginRight: 5,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    backgroundColor: 'white',
    width: width - 30,
    maxHeight: '90%',
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
  modalScrollView: {
    maxHeight: '90%',
  },
  detailsSection: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailsSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  detailsLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailsValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBlock: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  statBlockLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statBlockValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  heartRateColor: {
    color: '#e74c3c',
  },
  oxygenColor: {
    color: '#3498db',
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginVertical: 10,
  },
  chart: {
    borderRadius: 16,
    marginBottom: 20,
  },
});

export default MeasurementsScreen;