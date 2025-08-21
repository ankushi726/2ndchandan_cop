import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Share } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { saveCalculationData } from '@/services/databaseService';

interface SharePDFButtonProps {
  calculationData: any;
  calculationType: 'coldroom' | 'freezer' | 'blastfreezer';
  title: string;
}

export function SharePDFButton({ calculationData, calculationType, title }: SharePDFButtonProps) {
  const [loading, setLoading] = useState(false);

  const generatePDFContent = () => {
    const data = calculationData;
    
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section-title { font-size: 18px; font-weight: bold; color: #1E3A8A; margin-bottom: 10px; }
            .data-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #E5E7EB; }
            .data-label { font-weight: 500; }
            .data-value { font-weight: 600; color: #3B82F6; }
            .total-row { background-color: #EBF8FF; padding: 10px; border-radius: 8px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CoolCalc - ${title} Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="section">
            <h2 class="section-title">Room Specifications</h2>
            <div class="data-row">
              <span class="data-label">Length:</span>
              <span class="data-value">${data.dimensions.length.toFixed(2)} m</span>
            </div>
            <div class="data-row">
              <span class="data-label">Width/Breadth:</span>
              <span class="data-value">${(data.dimensions.width || data.dimensions.breadth).toFixed(2)} m</span>
            </div>
            <div class="data-row">
              <span class="data-label">Height:</span>
              <span class="data-value">${data.dimensions.height.toFixed(2)} m</span>
            </div>
            <div class="data-row">
              <span class="data-label">Volume:</span>
              <span class="data-value">${data.volume.toFixed(2)} m³</span>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Operating Conditions</h2>
            <div class="data-row">
              <span class="data-label">External Temperature:</span>
              <span class="data-value">${data.conditions?.externalTemp || 'N/A'}°C</span>
            </div>
            <div class="data-row">
              <span class="data-label">Internal Temperature:</span>
              <span class="data-value">${data.conditions?.internalTemp || 'N/A'}°C</span>
            </div>
            <div class="data-row">
              <span class="data-label">Temperature Difference:</span>
              <span class="data-value">${data.temperatureDifference.toFixed(1)}°C</span>
            </div>
            <div class="data-row">
              <span class="data-label">Operating Hours:</span>
              <span class="data-value">${data.conditions?.operatingHours || 24} hrs/day</span>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Construction Details</h2>
            <div class="data-row">
              <span class="data-label">Insulation Type:</span>
              <span class="data-value">${data.construction.type}</span>
            </div>
            <div class="data-row">
              <span class="data-label">Insulation Thickness:</span>
              <span class="data-value">${data.construction.thickness || data.construction.wallThickness} mm</span>
            </div>
            <div class="data-row">
              <span class="data-label">U-Factor:</span>
              <span class="data-value">${(data.construction.uFactor || data.construction.uFactors?.walls || 0).toFixed(3)} W/m²K</span>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Product Information</h2>
            <div class="data-row">
              <span class="data-label">Product Type:</span>
              <span class="data-value">${data.productInfo.type}</span>
            </div>
            <div class="data-row">
              <span class="data-label">Daily/Batch Load:</span>
              <span class="data-value">${data.productInfo.mass.toFixed(0)} kg</span>
            </div>
            <div class="data-row">
              <span class="data-label">Incoming Temperature:</span>
              <span class="data-value">${data.productInfo.incomingTemp}°C</span>
            </div>
            <div class="data-row">
              <span class="data-label">Outgoing Temperature:</span>
              <span class="data-value">${data.productInfo.outgoingTemp}°C</span>
            </div>
            <div class="data-row">
              <span class="data-label">Storage Utilization:</span>
              <span class="data-value">${data.storageCapacity.utilization.toFixed(1)}%</span>
            </div>
          </div>
          
          <div class="section">
            <h2 class="section-title">Load Breakdown</h2>
            <div class="data-row">
              <span class="data-label">Transmission Load:</span>
              <span class="data-value">${(data.breakdown?.transmission?.total || data.transmissionLoad?.total || 0).toFixed(2)} kW</span>
            </div>
            <div class="data-row">
              <span class="data-label">Product Load:</span>
              <span class="data-value">${(data.breakdown?.product?.total || data.productLoad?.total || 0).toFixed(2)} kW</span>
            </div>
            <div class="data-row">
              <span class="data-label">Air Change Load:</span>
              <span class="data-value">${(data.breakdown?.airChange?.load || data.airInfiltrationLoad || 0).toFixed(2)} kW</span>
            </div>
            <div class="data-row">
              <span class="data-label">Internal Load:</span>
              <span class="data-value">${(data.breakdown?.internal?.total || data.internalLoads?.total || 0).toFixed(2)} kW</span>
            </div>
            <div class="data-row">
              <span class="data-label">Door Load:</span>
              <span class="data-value">${(data.breakdown?.doorOpening || data.doorLoad || 0).toFixed(2)} kW</span>
            </div>
            ${data.breakdown?.heaters?.total ? `
            <div class="data-row">
              <span class="data-label">Heater Load:</span>
              <span class="data-value">${data.breakdown.heaters.total.toFixed(2)} kW</span>
            </div>
            ` : ''}
          </div>
          
          <div class="section">
            <div class="total-row">
              <h2 class="section-title">Final Results</h2>
              <div class="data-row">
                <span class="data-label">Total Load:</span>
                <span class="data-value">${(data.totalKW || data.finalLoad || data.totalLoadWithSafety).toFixed(2)} kW</span>
              </div>
              <div class="data-row">
                <span class="data-label">Refrigeration Tons:</span>
                <span class="data-value">${(data.totalTR || data.refrigerationTons || 0).toFixed(2)} TR</span>
              </div>
              <div class="data-row">
                <span class="data-label">BTU/hr:</span>
                <span class="data-value">${(data.totalBTU || 0).toFixed(0)} BTU/hr</span>
              </div>
              ${data.dailyEnergyConsumption ? `
              <div class="data-row">
                <span class="data-label">Daily Energy:</span>
                <span class="data-value">${data.dailyEnergyConsumption.toFixed(1)} kWh/day</span>
              </div>
              ` : ''}
              ${data.loadSummary?.SHR || data.dailyLoads?.shr ? `
              <div class="data-row">
                <span class="data-label">SHR:</span>
                <span class="data-value">${((data.loadSummary?.SHR || data.dailyLoads?.shr) * 100).toFixed(1)}%</span>
              </div>
              ` : ''}
            </div>
          </div>
          
          <div class="section">
            <p style="text-align: center; color: #64748B; font-size: 12px; margin-top: 30px;">
              Generated by CoolCalc - Professional Refrigeration Load Calculator
            </p>
          </div>
        </body>
      </html>
    `;
  };

  const handleSharePDF = async () => {
    setLoading(true);
    try {
      // First, save calculation data to Firebase
      await saveCalculationData(calculationData, calculationType);
      
      // Generate PDF
      const htmlContent = generatePDFContent();
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // Share PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: `Share ${title} Report`,
        });
      } else {
        Alert.alert('Success', 'PDF generated and calculation saved to your account!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.shareButton, loading && styles.disabledButton]} 
      onPress={handleSharePDF}
      disabled={loading}
    >
      <Share color="#FFFFFF" size={20} strokeWidth={2} />
      <Text style={styles.shareButtonText}>
        {loading ? 'Generating...' : 'Share as PDF'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shareButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});