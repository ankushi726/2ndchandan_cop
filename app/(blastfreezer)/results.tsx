import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateBlastFreezerLoad } from '@/utils/blastFreezerCalculations';
import { Header } from '@/components/Header';
import { SharePDFButton } from '@/components/SharePDFButton';

export default function BlastFreezerResultsScreen() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateResults();
  }, []);

  const calculateResults = async () => {
    try {
      const roomData = await AsyncStorage.getItem('blastFreezerRoomData');
      const conditionsData = await AsyncStorage.getItem('blastFreezerConditionsData');
      const constructionData = await AsyncStorage.getItem('blastFreezerConstructionData');
      const productData = await AsyncStorage.getItem('blastFreezerProductData');
      const usageData = await AsyncStorage.getItem('blastFreezerUsageData');

      if (roomData && conditionsData && productData) {
        const room = JSON.parse(roomData);
        const conditions = JSON.parse(conditionsData);
        const construction = constructionData ? JSON.parse(constructionData) : {};
        const product = JSON.parse(productData);
        const usage = usageData ? JSON.parse(usageData) : {};

        // Merge all data
        const mergedRoomData = { ...room, ...construction };
        const mergedProductData = { ...product, ...usage };

        const calculationResults = calculateBlastFreezerLoad(mergedRoomData, conditions, mergedProductData);
        setResults(calculationResults);
      }
    } catch (error) {
      console.error('Error calculating blast freezer results:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !results) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Calculating Results..." step={6} totalSteps={6} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Processing calculations...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Blast Freezer Results" step={6} totalSteps={6} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Final Cooling Load</Text>
          
          <View style={styles.resultsCard}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Total Load:</Text>
              <Text style={styles.resultValue}>{results.loadSummary.finalLoadKW.toFixed(2)} kW</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Refrigeration Tons:</Text>
              <Text style={styles.resultValue}>{results.loadSummary.finalLoadTR.toFixed(2)} TR</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>BTU/hr:</Text>
              <Text style={styles.resultValue}>{results.totalBTU.toFixed(0)} BTU/hr</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Daily Energy:</Text>
              <Text style={styles.resultValue}>{results.dailyEnergyConsumption.toFixed(1)} kWh/day</Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>SHR:</Text>
              <Text style={styles.resultValue}>{(results.engineeringOutputs.SHR * 100).toFixed(1)}%</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Load Breakdown</Text>
          
          <View style={styles.breakdownCard}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Transmission Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.transmission.totalTR.toFixed(2)} TR</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Product Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.product.total.toFixed(2)} TR</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Air Change Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.airChange.loadTR.toFixed(2)} TR</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Internal Load</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.internal.total.toFixed(2)} TR</Text>
            </View>
            <View style={[styles.breakdownRow, styles.totalBreakdownRow]}>
              <Text style={styles.totalBreakdownLabel}>Total Before Safety</Text>
              <Text style={styles.totalBreakdownValue}>{results.loadSummary.totalCalculatedTR.toFixed(2)} TR</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Safety Factor ({results.loadSummary.safetyPercentage.toFixed(0)}%)</Text>
              <Text style={styles.breakdownValue}>{results.loadSummary.safetyFactorTR.toFixed(2)} TR</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment Summary</Text>
          
          <View style={styles.equipmentCard}>
            <View style={styles.equipmentRow}>
              <Text style={styles.equipmentLabel}>Air Flow Required:</Text>
              <Text style={styles.equipmentValue}>{results.engineeringOutputs.airQtyRequiredCfm.toFixed(0)} CFM</Text>
            </View>
            <View style={styles.equipmentRow}>
              <Text style={styles.equipmentLabel}>Fan Motor Load:</Text>
              <Text style={styles.equipmentValue}>{results.equipmentSummary.totalFanLoad.toFixed(2)} kW</Text>
            </View>
            <View style={styles.equipmentRow}>
              <Text style={styles.equipmentLabel}>Total Heater Load:</Text>
              <Text style={styles.equipmentValue}>{results.equipmentSummary.totalHeaterLoad.toFixed(2)} kW</Text>
            </View>
            <View style={styles.equipmentRow}>
              <Text style={styles.equipmentLabel}>Batch Processing Time:</Text>
              <Text style={styles.equipmentValue}>{results.batchHours} hours</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage Information</Text>
          
          <View style={styles.storageCard}>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Maximum Storage:</Text>
              <Text style={styles.storageValue}>{results.storageCapacity.maximum.toFixed(0)} kg</Text>
            </View>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Required Capacity:</Text>
              <Text style={styles.storageValue}>{results.productInfo.mass.toFixed(0)} kg</Text>
            </View>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Utilization:</Text>
              <Text style={styles.storageValue}>{results.storageCapacity.utilization.toFixed(1)}%</Text>
            </View>
            <View style={styles.storageRow}>
              <Text style={styles.storageLabel}>Storage Density:</Text>
              <Text style={styles.storageValue}>{results.storageCapacity.density.toFixed(1)} kg/m³</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SharePDFButton 
            calculationData={results}
            calculationType="blastfreezer"
            title="Blast Freezer Load Calculation"
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
  equipmentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  equipmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  equipmentLabel: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  equipmentValue: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  storageCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
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
    color: '#10B981',
    fontWeight: '600',
  },
});