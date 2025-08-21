import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateColdRoomLoad } from '@/utils/coldRoomCalculations';
import { Header } from '@/components/Header';
import { SharePDFButton } from '@/components/SharePDFButton';

export default function ColdRoomResultsScreen() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateResults();
  }, []);

  const calculateResults = async () => {
    try {
      const roomData = await AsyncStorage.getItem('coldRoomData');
      const conditionsData = await AsyncStorage.getItem('coldRoomConditionsData');
      const constructionData = await AsyncStorage.getItem('coldRoomConstructionData');
      const productData = await AsyncStorage.getItem('coldRoomProductData');

      if (roomData && conditionsData && productData) {
        const room = JSON.parse(roomData);
        const conditions = JSON.parse(conditionsData);
        const construction = constructionData ? JSON.parse(constructionData) : {};
        const product = JSON.parse(productData);

        // Merge construction data with room data
        const mergedRoomData = { ...room, ...construction };

        const calculationResults = calculateColdRoomLoad(mergedRoomData, conditions, product);
        setResults(calculationResults);
      }
    } catch (error) {
      console.error('Error calculating cold room results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !results) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Calculating Results..." step={5} totalSteps={5} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Processing calculations...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Cold Room Results" step={5} totalSteps={5} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Final Cooling Load</Text>
          
          <View style={styles.resultsCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Load:</Text>
              <Text style={styles.resultValue}>{results.finalLoad.toFixed(2)} kW</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Refrigeration Tons:</Text>
              <Text style={styles.resultValue}>{results.totalTR.toFixed(2)} TR</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>BTU/hr:</Text>
              <Text style={styles.resultValue}>{results.totalBTU.toFixed(0)} BTU/hr</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Daily Energy:</Text>
              <Text style={styles.resultValue}>{results.dailyKJ.toFixed(0)} kJ/day</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>SHR:</Text>
              <Text style={styles.resultValue}>{(results.dailyLoads.shr * 100).toFixed(1)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Load Breakdown</Text>
          
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Transmission Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.transmission.total.toFixed(2)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Product Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.product.toFixed(2)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Respiration Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.respiration.toFixed(2)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Air Change Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.airChange.toFixed(2)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Door Opening Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.doorOpening.toFixed(2)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Miscellaneous Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.miscellaneous.total.toFixed(2)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Heater Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.heaters.total.toFixed(2)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.totalBreakdownRow]}>
              <Text style={styles.totalBreakdownLabel}>Total Before Safety</Text>
              <Text style={styles.totalBreakdownValue}>{results.totalBeforeSafety.toFixed(2)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Safety Factor (10%)</Text>
              <Text style={styles.breakdownValue}>{results.safetyFactorLoad.toFixed(2)} kW</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage Information</Text>
          
          <View style={styles.storageCard}>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Maximum Storage:</Text>
              <Text style={styles.storageValue}>{results.storageInfo.maxStorage.toFixed(0)} kg</Text>
            </View>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Current Load:</Text>
              <Text style={styles.storageValue}>{results.storageInfo.currentLoad.toFixed(0)} kg</Text>
            </View>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Utilization:</Text>
              <Text style={styles.storageValue}>{results.storageInfo.utilization.toFixed(1)}%</Text>
            </View>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Available Capacity:</Text>
              <Text style={styles.storageValue}>{results.storageInfo.availableCapacity.toFixed(0)} kg</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SharePDFButton 
            calculationData={results}
            calculationType="coldroom"
            title="Cold Room Load Calculation"
          />
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748B',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 16,
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  resultLabel: {
    fontSize: 16,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '700',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  totalBreakdownRow: {
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    marginTop: 8,
    paddingTop: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  totalBreakdownLabel: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '600',
  },
  totalBreakdownValue: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '700',
  },
  storageCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  storageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  storageLabel: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  storageValue: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
});