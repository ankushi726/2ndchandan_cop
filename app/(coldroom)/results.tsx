import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { Share2 } from 'lucide-react-native';
import { Header } from '@/components/Header';
import { calculateColdRoomLoad } from '@/utils/coldRoomCalculations';

// Try to import expo-print and expo-sharing, but don't fail if they're not available
let Print: any = null;
let Sharing: any = null;

try {
  Print = require('expo-print');
  Sharing = require('expo-sharing');
  console.log('Cold Room - PDF packages loaded successfully');
} catch (error) {
  console.log('Cold Room - PDF packages not available, will use text sharing fallback', error);
}

export default function ColdRoomResultsScreen() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const generateHTMLReport = () => {
    if (!results) {
      console.log('Cold Room - No results available for PDF generation');
      return '';
    }
    
    console.log('Cold Room - Generating PDF with results:', Object.keys(results));
    console.log('Cold Room - Available properties:', {
      hasProduct: !!results.product,
      hasProductInfo: !!results.productInfo,
      hasConditions: !!results.conditions,
      hasUsage: !!results.usage,
      hasConstruction: !!results.construction
    });
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Cold Room Cooling Load Report</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                margin: 12px; 
                line-height: 1.3; 
                color: #333;
                font-size: 11px;
            }
            .header { 
                background: linear-gradient(135deg, #10B981, #059669); 
                color: white; 
                padding: 12px; 
                text-align: center;
                margin-bottom: 10px;
                border-radius: 8px;
            }
            .company-name {
                font-size: 28px;
                font-weight: bold;
                color: #1E3A8A;
                margin-bottom: 5px;
                letter-spacing: 2px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            .powered-by {
                font-size: 16px;
                color: #3B82F6;
                margin-bottom: 15px;
                font-weight: 600;
            }
            .title { 
                font-size: 24px; 
                font-weight: bold; 
                color: #1E3A8A; 
                margin: 10px 0;
            }
            .main-result { 
                background: linear-gradient(135deg, #1E3A8A, #3B82F6); 
                color: white; 
                padding: 20px; 
                border-radius: 10px; 
                text-align: center; 
                margin: 20px 0;
            }
            .main-value { 
                font-size: 32px; 
                font-weight: bold; 
                margin: 10px 0;
            }
            .section { 
                margin: 20px 0; 
                page-break-inside: avoid;
            }
            .section-title { 
                font-size: 18px; 
                font-weight: bold; 
                color: #1E3A8A; 
                border-bottom: 1px solid #E5E7EB; 
                padding-bottom: 5px; 
                margin-bottom: 15px;
            }
            .subsection {
                margin-bottom: 20px;
            }
            .subsection-title {
                font-size: 16px;
                font-weight: bold;
                color: #3B82F6;
                margin-bottom: 10px;
                padding-left: 10px;
                border-left: 3px solid #3B82F6;
            }
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 10px 0;
                background: white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            th, td { 
                border: 1px solid #E5E7EB; 
                padding: 4px; 
                text-align: center; 
                font-size: 9px;
            }
            th { 
                background: #EBF8FF; 
                font-weight: bold; 
                color: #1E3A8A;
            }
            .total-row { 
                background: #DBEAFE; 
                font-weight: bold;
            }
            .final-row { 
                background: #3B82F6; 
                color: white; 
                font-weight: bold;
            }
            .info-box { 
                background: #EBF8FF; 
                border-left: 4px solid #3B82F6; 
                padding: 15px; 
                margin: 10px 0;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #E5E7EB;
                color: #666;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-name">ENZO ENGINEERING SOLUTIONS</div>
            <div class="powered-by">⚡ Powered by Enzo CoolCalc</div>
            <div class="title">🌡️ COLD ROOM COOLING LOAD CALCULATION REPORT</div>
            <p style="margin: 5px 0; font-size: 10px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        </div>

        <div class="section">
            <div class="section-title">📋 INPUT PARAMETERS</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <div>
                    <div style="background: #EBF8FF; color: #1E40AF; padding: 4px 8px; font-weight: bold; font-size: 10px; margin-bottom: 4px; border-left: 3px solid #10B981;">🏗️ Room Construction</div>
                    <div style="background: #F8FAFC; border: 1px solid #E5E7EB; padding: 6px; border-radius: 4px; font-size: 9px;">
                        <div><strong>Dimensions:</strong> ${results.dimensions.length}m × ${results.dimensions.width}m × ${results.dimensions.height}m</div>
                        <div><strong>Volume:</strong> ${results.volume ? results.volume.toFixed(1) : 'N/A'} m³</div>
                        <div><strong>Door:</strong> ${results.dimensions.doorWidth || 'N/A'}m × ${results.dimensions.doorHeight || 'N/A'}m</div>
                        <div><strong>Wall Area:</strong> ${results.areas.wall ? results.areas.wall.toFixed(1) : 'N/A'} m²</div>
                        <div><strong>Ceiling Area:</strong> ${results.areas.ceiling ? results.areas.ceiling.toFixed(1) : 'N/A'} m²</div>
                    </div>
                </div>
                
                <div>
                    <div style="background: #EBF8FF; color: #1E40AF; padding: 4px 8px; font-weight: bold; font-size: 10px; margin-bottom: 4px; border-left: 3px solid #10B981;">🌡️ Operating Conditions</div>
                    <div style="background: #F8FAFC; border: 1px solid #E5E7EB; padding: 6px; border-radius: 4px; font-size: 9px;">
                        <div><strong>External Temp:</strong> ${results.conditions?.externalTemp || results.roomData?.externalTemp || 35}°C</div>
                        <div><strong>Internal Temp:</strong> ${results.conditions?.internalTemp || results.roomData?.internalTemp || 4}°C</div>
                        <div><strong>ΔT:</strong> ${results.temperatureDifference?.toFixed(0) || 31}°C</div>
                        <div><strong>Operating Hours:</strong> ${results.conditions?.operatingHours || results.roomData?.operatingHours || 24}h/day</div>
                        <div><strong>Humidity:</strong> ${results.conditions?.humidity || results.roomData?.humidity || 85}%</div>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <div>
                    <div style="background: #EBF8FF; color: #1E40AF; padding: 4px 8px; font-weight: bold; font-size: 10px; margin-bottom: 4px; border-left: 3px solid #10B981;">🔧 Insulation Details</div>
                    <div style="background: #F8FAFC; border: 1px solid #E5E7EB; padding: 6px; border-radius: 4px; font-size: 9px;">
                        <div><strong>Type:</strong> ${results.construction.insulationType || 'PUF'}</div>
                        <div><strong>Wall Thickness:</strong> ${results.construction.wallThickness || 100}mm</div>
                        <div><strong>Ceiling Thickness:</strong> ${results.construction.ceilingThickness || 100}mm</div>
                        <div><strong>Floor Thickness:</strong> ${results.construction.floorThickness || 100}mm</div>
                        <div><strong>U-Factor:</strong> ${results.construction.uFactor ? results.construction.uFactor.toFixed(3) : 'N/A'} W/m²K</div>
                    </div>
                </div>
                
                <div>
                    <div style="background: #EBF8FF; color: #1E40AF; padding: 4px 8px; font-weight: bold; font-size: 10px; margin-bottom: 4px; border-left: 3px solid #10B981;">🥩 Product Information</div>
                    <div style="background: #F8FAFC; border: 1px solid #E5E7EB; padding: 6px; border-radius: 4px; font-size: 9px;">
                        <div><strong>Type:</strong> ${results.productInfo?.type || results.product?.productType || 'General Food Items'}</div>
                        <div><strong>Daily Load:</strong> ${results.productInfo?.mass || results.product?.dailyLoad || 1000} kg/day</div>
                        <div><strong>Incoming Temp:</strong> ${results.productInfo?.incomingTemp || results.product?.incomingTemp || 25}°C</div>
                        <div><strong>Outgoing Temp:</strong> ${results.productInfo?.outgoingTemp || results.product?.outgoingTemp || 4}°C</div>
                        <div><strong>Storage Capacity:</strong> ${results.storageCapacity?.density || results.product?.storageCapacity || 8} kg/m³</div>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>
                    <div style="background: #EBF8FF; color: #1E40AF; padding: 4px 8px; font-weight: bold; font-size: 10px; margin-bottom: 4px; border-left: 3px solid #10B981;">👥 Personnel & Equipment</div>
                    <div style="background: #F8FAFC; border: 1px solid #E5E7EB; padding: 6px; border-radius: 4px; font-size: 9px;">
                        <div><strong>Number of People:</strong> ${results.roomData?.numberOfPeople || results.usage?.numberOfPeople || 2}</div>
                        <div><strong>Working Hours:</strong> ${results.roomData?.workingHours || results.usage?.workingHours || 8}h/day</div>
                        <div><strong>Light Load:</strong> ${(results.roomData?.lightingWattage || results.usage?.lightLoad || 300) / 1000}kW</div>
                        <div><strong>Fan Motor:</strong> ${results.roomData?.fanMotorRating || results.usage?.fanMotorRating || 0.37}kW</div>
                        <div><strong>Number of Fans:</strong> ${results.roomData?.numberOfFans || results.usage?.numberOfFans || 1}</div>
                    </div>
                </div>
                
                <div>
                    <div style="background: #EBF8FF; color: #1E40AF; padding: 4px 8px; font-weight: bold; font-size: 10px; margin-bottom: 4px; border-left: 3px solid #10B981;">📊 Load Distribution</div>
                    <div style="background: #F8FAFC; border: 1px solid #E5E7EB; padding: 6px; border-radius: 4px; font-size: 9px;">
                        <div><strong>Transmission:</strong> ${results.breakdown?.transmission?.total?.toFixed(2) || 'N/A'}kW</div>
                        <div><strong>Product Load:</strong> ${results.breakdown?.product?.toFixed(2) || 'N/A'}kW</div>
                        <div><strong>Air Infiltration:</strong> ${results.breakdown?.airChange?.toFixed(2) || 'N/A'}kW</div>
                        <div><strong>Internal Loads:</strong> ${results.breakdown?.miscellaneous?.total?.toFixed(2) || 'N/A'}kW</div>
                        <div><strong>Safety Factor:</strong> 10%</div>
                    </div>
                </div>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div class="main-result">
                <div class="main-value">${results.finalLoad ? results.finalLoad.toFixed(2) : 'N/A'} kW</div>
                <div style="font-size: 12px; margin-bottom: 8px;">Required Cooling Capacity</div>
                <div style="font-size: 10px;">
                    <div>Refrigeration: ${results.totalTR ? results.totalTR.toFixed(2) : 'N/A'} TR</div>
                    <div>Daily Energy: ${results.finalLoad ? (results.finalLoad * 24).toFixed(1) : 'N/A'} kWh</div>
                    <div>Heat Removal: ${results.totalBTU ? results.totalBTU.toFixed(0) : 'N/A'} BTU/hr</div>
                    <div>SHR: ${results.dailyLoads?.shr?.toFixed(3) || '1.000'}</div>
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #10B981, #059669); color: white; padding: 12px; border-radius: 8px; font-size: 10px;">
                <div style="font-weight: bold; margin-bottom: 8px; font-size: 12px;">Calculation Summary</div>
                <div>Base Load: ${(results.finalLoad / 1.1).toFixed(2)} kW</div>
                <div>Safety Factor: 10%</div>
                <div>Daily Energy: ${results.dailyKJ?.toFixed(0) || '0'} kJ/24Hr</div>
                <div>Heat Transfer Rate: ${results.totalBTU.toFixed(0)} BTU/hr</div>
                <div>Efficiency Rating: Standard</div>
                <div>Cooling Type: Chilled Storage</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">📋 INPUT PARAMETERS</div>
            
            <div class="subsection">
                <div class="subsection-title">🏗️ Room Construction</div>
                <div class="info-box">
                    <div><strong>Room Dimensions:</strong></div>
                    <div>• Length: ${results.dimensions?.length || 'N/A'} m</div>
                    <div>• Width: ${results.dimensions?.width || 'N/A'} m</div>
                    <div>• Height: ${results.dimensions?.height || 'N/A'} m</div>
                    <div>• Total Volume: ${results.volume?.toFixed(1) || 'N/A'} m³</div>
                </div>
                <div class="info-box">
                    <div><strong>Door Specifications:</strong></div>
                    <div>• Door Width: ${results.doorDimensions?.width || 'N/A'} m</div>
                    <div>• Door Height: ${results.doorDimensions?.height || 'N/A'} m</div>
                    <div>• Door Openings: ${results.roomData?.doorOpenings || 'N/A'} times/day</div>
                </div>
                <div class="info-box">
                    <div><strong>Insulation Details:</strong></div>
                    <div>• Insulation Type: ${results.construction?.type || 'PUF'}</div>
                    <div>• Thickness: ${results.construction?.thickness || 100} mm</div>
                    <div>• U-Factor: ${results.construction?.uFactor?.toFixed(3) || 'N/A'} W/m²K (Excel exact)</div>
                    <div>• Floor Thickness: ${results.construction?.floorThickness || 100} mm</div>
                    <div>• Number of Heaters: ${results.construction?.numberOfHeaters || 1}</div>
                    <div>• Number of Doors: ${results.construction?.numberOfDoors || 1}</div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">🏗️ Storage Information</div>
                <div class="info-box">
                    <div><strong>Storage Capacity:</strong></div>
                    <div>• Maximum Storage: ${results.storageInfo?.maxStorage?.toFixed(0) || '0'} kg</div>
                    <div>• Current Load: ${results.storageInfo?.currentLoad?.toFixed(0) || '0'} kg</div>
                    <div>• Utilization: ${results.storageInfo?.utilization?.toFixed(1) || '0.0'}%</div>
                    <div>• Available Capacity: ${results.storageInfo?.availableCapacity?.toFixed(0) || '0'} kg</div>
                    <div>• Storage Density: ${results.conditions?.storageDensity || 8} kg/m³</div>
                </div>
                <div class="info-box">
                    <div><strong>Air Flow Requirements:</strong></div>
                    <div>• Required CFM: ${results.airFlowInfo?.requiredCfm?.toFixed(0) || '0'} cfm</div>
                    <div>• Recommended CFM: ${results.airFlowInfo?.recommendedCfm?.toFixed(0) || '0'} cfm</div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">🌡️ Operating Conditions</div>
                <div class="info-box">
                    <div><strong>Temperature Settings:</strong></div>
                    <div>• External Temperature: ${results.conditions?.externalTemp || results.roomData?.externalTemp || 45}°C</div>
                    <div>• Internal Temperature: ${results.conditions?.internalTemp || results.roomData?.internalTemp || 2}°C</div>
                    <div>• Temperature Difference: ${results.temperatureDifference.toFixed(0)}°C</div>
                </div>
                <div class="info-box">
                    <div><strong>Operating Parameters:</strong></div>
                    <div>• Operating Hours: ${results.conditions?.operatingHours || results.roomData?.operatingHours || 20} hours/day</div>
                    <div>• Pull-down Time: ${results.pullDownTime} hours</div>
                    <div>• Door Openings: ${results.conditions?.doorOpenings || results.doorOpenings || 30} times/day</div>
                    <div>• Door Clear Opening: ${results.conditions?.doorClearOpening || 2000} mm</div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">🥬 Product Information</div>
                <div class="info-box">
                    <div><strong>Product Details:</strong></div>
                    <div>• Product Type: ${results.productInfo.type}</div>
                    <div>• Daily Load: ${results.productInfo.mass} kg</div>
                    <div>• Incoming Temperature: ${results.productInfo.incomingTemp}°C</div>
                    <div>• Outgoing Temperature: ${results.productInfo.outgoingTemp}°C</div>
                    <div>• Specific Heat: ${results.productInfo.specificHeat || 4.1} kJ/kg·K</div>
                    <div>• Respiration Rate: ${results.productInfo.respirationRate || 50} W/tonne</div>
                    <div>• Storage Type: ${results.storageCapacity.storageType}</div>
                </div>
            </div>

            <div class="subsection">
                <div class="subsection-title">👥 Personnel & Equipment</div>
                <div class="info-box">
                    <div><strong>Personnel:</strong></div>
                    <div>• Number of People: ${results.roomData?.numberOfPeople || 3}</div>
                    <div>• Working Hours: ${results.roomData?.workingHours || 8} hours/day</div>
                </div>
                <div class="info-box">
                    <div><strong>Electrical Equipment:</strong></div>
                    <div>• Lighting Load: ${results.roomData?.lightingWattage || 300} W</div>
                    <div>• Equipment Load: ${results.roomData?.equipmentLoad || 750} W</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">📈 FINAL SUMMARY</div>
            <table>
                <tr>
                    <th>Load Type</th>
                    <th>Load (kW)</th>
                    <th>Load (TR)</th>
                </tr>
                <tr>
                    <td>Transmission Load</td>
                    <td>${results.breakdown?.transmission?.total?.toFixed(3) || '0.000'}</td>
                    <td>${((results.breakdown?.transmission?.total || 0) / 3.517).toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Product Load</td>
                    <td>${results.breakdown?.product?.toFixed(3) || '0.000'}</td>
                    <td>${((results.breakdown?.product || 0) / 3.517).toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Respiration Load</td>
                    <td>${results.breakdown?.respiration?.toFixed(3) || '0.000'}</td>
                    <td>${((results.breakdown?.respiration || 0) / 3.517).toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Air Change Load</td>
                    <td>${results.breakdown?.airChange?.toFixed(3) || '0.000'}</td>
                    <td>${((results.breakdown?.airChange || 0) / 3.517).toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Door Opening Load</td>
                    <td>${results.breakdown?.doorOpening?.toFixed(3) || '0.000'}</td>
                    <td>${((results.breakdown?.doorOpening || 0) / 3.517).toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Internal Loads</td>
                    <td>${results.breakdown?.miscellaneous?.total?.toFixed(3) || '0.000'}</td>
                    <td>${((results.breakdown?.miscellaneous?.total || 0) / 3.517).toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Heater Loads</td>
                    <td>${results.breakdown.heaters?.total?.toFixed(3) || '0.000'}</td>
                    <td>${((results.breakdown.heaters?.total || 0) / 3.517).toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Total Calculated</td>
                    <td>${results.totalBeforeSafety?.toFixed(3) || '0.000'}</td>
                    <td>${((results.totalBeforeSafety || 0) / 3.517).toFixed(3)}</td>
                </tr>
                <tr>
                    <td>Safety Factor (10%)</td>
                    <td>${results.safetyFactorLoad?.toFixed(3) || '0.000'}</td>
                    <td>${((results.safetyFactorLoad || 0) / 3.517).toFixed(3)}</td>
                </tr>
                <tr class="final-row">
                    <td><strong>FINAL CAPACITY REQUIRED</strong></td>
                    <td><strong>${results.finalLoad?.toFixed(2) || 'N/A'}</strong></td>
                    <td><strong>${results.totalTR?.toFixed(2) || 'N/A'}</strong></td>
                </tr>
            </table>
            
            <div class="section">
                <div class="section-title">📊 CONVERSIONS & ADDITIONAL INFO</div>
                <table>
                    <tr>
                        <th>Parameter</th>
                        <th>Value</th>
                        <th>Unit</th>
                    </tr>
                    <tr>
                        <td>Refrigeration Capacity</td>
                        <td>${results.totalTR.toFixed(2)}</td>
                        <td>TR</td>
                    </tr>
                    <tr>
                        <td>Heat Removal</td>
                        <td>${results.totalBTU.toFixed(0)}</td>
                        <td>BTU/hr</td>
                    </tr>
                    <tr>
                        <td>Daily Load</td>
                        <td>${results.dailyKJ?.toFixed(0) || '0'}</td>
                        <td>kJ/24Hr</td>
                    </tr>
                    <tr>
                        <td>Sensible Heat Ratio</td>
                        <td>${results.dailyLoads?.shr?.toFixed(1) || '1.0'}</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>Air Qty Required</td>
                        <td>${results.airFlowInfo?.requiredCfm?.toFixed(0) || '0'}</td>
                        <td>cfm</td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="footer">
            <div style="font-size: 16px; font-weight: bold; color: #1E3A8A;">ENZO ENGINEERING SOLUTIONS</div>
            <div>Report generated by Enzo CoolCalc</div>
            <div>Professional Refrigeration Load Calculation System</div>
            <div>© ${new Date().getFullYear()} Enzo Engineering Solutions</div>
        </div>
    </body>
    </html>
    `;
  };

  const handleShare = async () => {
    console.log('Cold Room - handleShare called, Print available:', !!Print, 'Sharing available:', !!Sharing);
    try {
      // Try to generate PDF first if packages are available
      if (Print && Sharing) {
        console.log('Cold Room - Attempting PDF generation...');
        try {
          const htmlContent = generateHTMLReport();
          console.log('Cold Room - Generated HTML content length:', htmlContent.length);
          const { uri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false
          });
          console.log('Cold Room - PDF generated successfully:', uri);
          
          if (await Sharing.isAvailableAsync()) {
            console.log('Cold Room - Sharing PDF file:', uri);
            await Sharing.shareAsync(uri, {
              mimeType: 'application/pdf',
              dialogTitle: 'Share Cold Room Load Calculation Report',
              UTI: 'com.adobe.pdf'
            });
            console.log('Cold Room - PDF shared successfully');
            return;
          } else {
            console.log('Cold Room - Sharing not available, falling back to text');
          }
        } catch (pdfError) {
          console.log('Cold Room - PDF generation failed, falling back to text:', pdfError);
          console.error('Cold Room - PDF Error details:', (pdfError as Error).message || pdfError);
        }
      }
      
      // Fallback to text sharing
      console.log('Cold Room - Using text sharing fallback');
      const content = generateTextReport();
      await Share.share({
        message: content,
        title: 'Cold Room Load Calculation Report'
      });
      console.log('Cold Room - Text report shared successfully');
    } catch (error) {
      console.error('Cold Room - Share error:', error);
      Alert.alert('Error', 'Failed to share report');
    }
  };

  const generateTextReport = () => {
    if (!results) return '';
    
    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    ENZO ENGINEERING SOLUTIONS
⚡ POWERED BY ENZO COOLCALC ⚡
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌡️ COLD ROOM COOLING LOAD CALCULATION REPORT
===========================================

📅 Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

🎯 FINAL RESULTS:
Required Capacity: ${results.finalLoad.toFixed(2)} kW
Refrigeration: ${results.totalTR.toFixed(2)} TR
Daily Energy: ${results.dailyKJ?.toFixed(0) || '0'} kJ/24Hr
Daily Energy: ${(results.finalLoad * 24).toFixed(1)} kWh
Heat Removal: ${results.totalBTU.toFixed(0)} BTU/hr
Safety Factor: 10%
Sensible Heat Ratio: ${results.dailyLoads?.shr?.toFixed(1) || '1.0'}

📋 INPUT PARAMETERS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️ STORAGE INFORMATION:
Maximum Storage: ${results.storageInfo?.maxStorage?.toFixed(0) || '0'} kg
Current Load: ${results.storageInfo?.currentLoad?.toFixed(0) || '0'} kg
Utilization: ${results.storageInfo?.utilization?.toFixed(1) || '0.0'}%
Available Capacity: ${results.storageInfo?.availableCapacity?.toFixed(0) || '0'} kg
Storage Density: ${results.conditions?.storageDensity || 8} kg/m³

💨 AIR FLOW REQUIREMENTS:
Required CFM: ${results.airFlowInfo?.requiredCfm?.toFixed(0) || '0'} cfm
Recommended CFM: ${results.airFlowInfo?.recommendedCfm?.toFixed(0) || '0'} cfm

🏗️ ROOM CONSTRUCTION:
Dimensions: ${results.dimensions.length}m × ${results.dimensions.width}m × ${results.dimensions.height}m
Volume: ${results.volume.toFixed(1)} m³
Door Size: ${results.doorDimensions.width}m × ${results.doorDimensions.height}m
Door Openings: ${results.conditions?.doorOpenings || results.doorOpenings || 30} times/day
Door Clear Opening: ${results.conditions?.doorClearOpening || 2000} mm
Insulation: ${results.construction.type}
Thickness: ${results.construction.thickness}mm
U-Factor: ${results.construction.uFactor.toFixed(3)} W/m²K (Excel exact)
Floor Thickness: ${results.construction.floorThickness || 100}mm
Number of Heaters: ${results.construction.numberOfHeaters || 1}
Number of Doors: ${results.construction.numberOfDoors || 1}

🌡️ OPERATING CONDITIONS:
External Temperature: ${results.conditions?.externalTemp || results.roomData?.externalTemp || 45}°C
Internal Temperature: ${results.conditions?.internalTemp || results.roomData?.internalTemp || 2}°C
Temperature Difference: ${results.temperatureDifference.toFixed(0)}°C
Operating Hours: ${results.conditions?.operatingHours || results.roomData?.operatingHours || 20} hours/day
Pull-down Time: ${results.pullDownTime} hours

🥬 PRODUCT INFORMATION:
Product Type: ${results.productInfo.type}
Daily Load: ${results.productInfo.mass} kg
Temperature Range: ${results.productInfo.incomingTemp}°C → ${results.productInfo.outgoingTemp}°C
Specific Heat: ${results.productInfo.specificHeat || 4.1} kJ/kg·K
Respiration Rate: ${results.productInfo.respirationRate || 50} W/tonne
Storage Type: ${results.storageCapacity.storageType}

👥 PERSONNEL & EQUIPMENT:
Number of People: ${results.conditions?.numberOfPeople || results.roomData?.numberOfPeople || 1}
Working Hours: ${results.conditions?.workingHours || results.roomData?.workingHours || 20} hours/day
Lighting Load: ${results.conditions?.lightingWattage || results.roomData?.lightingWattage || 70} W
Equipment Load: ${results.conditions?.equipmentLoad || results.roomData?.equipmentLoad || 250} W

📊 LOAD BREAKDOWN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Transmission Load: ${results.breakdown.transmission.total.toFixed(3)} kW
Product Load: ${results.breakdown.product.toFixed(3)} kW
Respiration Load: ${results.breakdown.respiration.toFixed(3)} kW
Air Change Load: ${results.breakdown.airChange.toFixed(3)} kW
Door Opening Load: ${results.breakdown.doorOpening.toFixed(3)} kW
Internal Loads: ${results.breakdown.miscellaneous.total.toFixed(3)} kW
Heater Loads: ${results.breakdown.heaters?.total?.toFixed(3) || '0.000'} kW

📈 CALCULATION SUMMARY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Calculated: ${results.totalBeforeSafety.toFixed(3)} kW
Safety Factor (10%): ${results.safetyFactorLoad.toFixed(3)} kW
FINAL CAPACITY REQUIRED: ${results.finalLoad.toFixed(2)} kW

📊 CONVERSIONS & ADDITIONAL INFO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Refrigeration: ${results.totalTR.toFixed(2)} TR
Heat Removal: ${results.totalBTU.toFixed(0)} BTU/hr
Daily Load: ${results.dailyKJ?.toFixed(0) || '0'} kJ/24Hr
Sensible Heat Ratio: ${results.dailyLoads?.shr?.toFixed(1) || '1.0'}
Air Qty Required: ${results.airFlowInfo?.requiredCfm?.toFixed(0) || '0'} cfm
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated by Enzo CoolCalc
ENZO ENGINEERING SOLUTIONS
Professional Refrigeration Load Calculation System
© ${new Date().getFullYear()} Enzo Engineering Solutions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
  };

  // Recalculate whenever the screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      calculateResults();
    }, [])
  );

  // Also set up a listener for storage changes
  useEffect(() => {
    const interval = setInterval(() => {
      calculateResults();
    }, 1000); // Check for changes every second

    return () => clearInterval(interval);
  }, []);

  const calculateResults = async () => {
    try {
      const roomData = await AsyncStorage.getItem('coldRoomData');
      const conditionsData = await AsyncStorage.getItem('coldRoomConditionsData');
      const constructionData = await AsyncStorage.getItem('coldRoomConstructionData');
      const productData = await AsyncStorage.getItem('coldRoomProductData');

      const room = roomData ? JSON.parse(roomData) : { 
        length: '6.0', width: '4.0', height: '3.0', doorWidth: '1.2', doorHeight: '2.1',
        doorOpenings: '30', insulationType: 'PUF', insulationThickness: 100 
      };
      
      const conditions = conditionsData ? JSON.parse(conditionsData) : { 
        externalTemp: '35', internalTemp: '4', operatingHours: '24', pullDownTime: '8' 
      };
      
      const construction = constructionData ? JSON.parse(constructionData) : {
        insulationType: 'PUF', insulationThickness: 100
      };
      
      const product = productData ? JSON.parse(productData) : { 
        productType: 'General Food Items', dailyLoad: '3000', incomingTemp: '25', outgoingTemp: '4',
        storageType: 'Palletized', numberOfPeople: '3', workingHours: '8',
        lightingWattage: '300', equipmentLoad: '750' 
      };

      // Merge construction data with room data
      const roomWithConstruction = { ...room, ...construction };

      const calculatedResults = calculateColdRoomLoad(roomWithConstruction, conditions, product);
      
      // Add input data to results for PDF generation
      const enhancedResults = {
        ...calculatedResults,
        roomData: { ...roomWithConstruction, ...conditions },
        conditions: conditions,
        productData: product
      };
      
      setResults(enhancedResults);
      setLoading(false);
    } catch (error) {
      console.error('Error calculating cold room results:', error);
      setLoading(false);
    }
  };

  if (loading || !results) {
    return (
      <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
        <Header title="Cold Room Results" step={5} totalSteps={5} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Calculating cooling load...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#F8FAFC', '#EBF8FF']} style={styles.container}>
      <Header title="Cold Room Results" step={5} totalSteps={5} />
      
      {/* Powered by Enzo Banner */}
      <View style={styles.poweredByBanner}>
        <Text style={styles.poweredByText}>⚡ Powered by Enzo</Text>
      </View>
      
      <View style={styles.shareButtonsContainer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Share2 color="#3B82F6" size={20} strokeWidth={2} />
          <Text style={styles.shareButtonText}>Share PDF Report</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mainResultCard}>
          <Text style={styles.mainResultTitle}>🌡️ COLD ROOM LOAD CALCULATION</Text>
          <Text style={styles.mainResultValue}>{results.finalLoad.toFixed(2)} kW</Text>
          <Text style={styles.mainResultSubtitle}>Refrigeration: {results.totalTR.toFixed(2)} TR</Text>
          <Text style={styles.mainResultSubtitle}>Daily Energy: {results.dailyKJ?.toFixed(0) || '0'} kJ/24Hr</Text>
          <Text style={styles.mainResultSubtitle}>Daily Energy: {(results.finalLoad * 24).toFixed(1)} kWh</Text>
          <Text style={styles.mainResultSubtitle}>Heat Removal: {results.totalBTU.toFixed(0)} BTU/hr</Text>
          <Text style={styles.mainResultSubtitle}>Safety Factor: 10%</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 SUMMARY</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Cooling Capacity:</Text>
              <Text style={styles.summaryValue}>{results.finalLoad.toFixed(2)} kW</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Refrigeration Capacity:</Text>
              <Text style={styles.summaryValue}>{results.totalTR.toFixed(2)} TR</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Daily Energy:</Text>
              <Text style={styles.summaryValue}>{results.dailyKJ?.toFixed(0) || '0'} kJ/24Hr</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Daily Energy:</Text>
              <Text style={styles.summaryValue}>{(results.finalLoad * 24).toFixed(1)} kWh</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Sensible Heat Ratio:</Text>
              <Text style={styles.summaryValue}>{results.dailyLoads?.shr?.toFixed(1) || '1.0'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏗️ STORAGE INFORMATION</Text>
          
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>STORAGE CAPACITY</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Maximum Storage Capacity:</Text>
              <Text style={styles.breakdownValue}>{results.storageInfo?.maxStorage?.toFixed(0) || '0'} kg</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Current Daily Load:</Text>
              <Text style={styles.breakdownValue}>{results.storageInfo?.currentLoad?.toFixed(0) || '0'} kg</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Storage Utilization:</Text>
              <Text style={styles.breakdownValue}>{results.storageInfo?.utilization?.toFixed(1) || '0.0'}%</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>└─ Available Capacity:</Text>
              <Text style={styles.subtotalValue}>{results.storageInfo?.availableCapacity?.toFixed(0) || '0'} kg</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💨 AIR FLOW REQUIREMENTS</Text>
          
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>AIR CIRCULATION</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Required CFM:</Text>
              <Text style={styles.breakdownValue}>{results.airFlowInfo?.requiredCfm?.toFixed(0) || '0'} cfm</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>└─ Recommended CFM:</Text>
              <Text style={styles.subtotalValue}>{results.airFlowInfo?.recommendedCfm?.toFixed(0) || '0'} cfm</Text>
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 DETAILED BREAKDOWN</Text>
          
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>TRANSMISSION LOADS</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Walls:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.transmission.walls.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Ceiling:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.transmission.ceiling.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Floor:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.transmission.floor.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>└─ Subtotal:</Text>
              <Text style={styles.subtotalValue}>{results.breakdown.transmission.total.toFixed(3)} kW</Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>PRODUCT LOADS</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Sensible Heat:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.product.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>└─ Respiration:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.respiration.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>└─ Subtotal:</Text>
              <Text style={styles.subtotalValue}>{(results.breakdown.product + results.breakdown.respiration).toFixed(3)} kW</Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>AIR & INFILTRATION</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Air Change Load:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.airChange.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Door Opening:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.doorOpening.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>└─ Subtotal:</Text>
              <Text style={styles.subtotalValue}>{(results.breakdown.airChange + results.breakdown.doorOpening).toFixed(3)} kW</Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>INTERNAL LOADS</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Occupancy:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.miscellaneous.occupancy.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Lighting:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.miscellaneous.lighting.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Equipment:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.miscellaneous.equipment.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>└─ Subtotal:</Text>
              <Text style={styles.subtotalValue}>{results.breakdown.miscellaneous.total.toFixed(3)} kW</Text>
            </View>
          </View>

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>HEATER LOADS</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Peripheral Heaters:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.heaters?.peripheral?.toFixed(3) || '0.000'} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Door Heaters:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.heaters?.door?.toFixed(3) || '0.000'} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Steam Humidifiers:</Text>
              <Text style={styles.breakdownValue}>{results.breakdown.heaters?.steam?.toFixed(3) || '0.000'} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.subtotalRow]}>
              <Text style={styles.subtotalLabel}>└─ Subtotal:</Text>
              <Text style={styles.subtotalValue}>{results.breakdown.heaters?.total?.toFixed(3) || '0.000'} kW</Text>
            </View>
          </View>

          <View style={styles.finalCard}>
            <Text style={styles.finalTitle}>FINAL CALCULATION</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Total Calculated:</Text>
              <Text style={styles.breakdownValue}>{results.totalBeforeSafety.toFixed(3)} kW</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Safety Factor (10%):</Text>
              <Text style={styles.breakdownValue}>+{results.safetyFactorLoad.toFixed(3)} kW</Text>
            </View>
            <View style={[styles.breakdownRow, styles.finalRow]}>
              <Text style={styles.finalLabel}>└─ REQUIRED CAPACITY:</Text>
              <Text style={styles.finalValue}>{results.finalLoad.toFixed(2)} kW</Text>
            </View>
          </View>

          <View style={styles.conversionsCard}>
            <Text style={styles.conversionsTitle}>CONVERSIONS</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Refrigeration:</Text>
              <Text style={styles.breakdownValue}>{results.totalTR.toFixed(2)} TR</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Heat Removal:</Text>
              <Text style={styles.breakdownValue}>{results.totalBTU.toFixed(0)} BTU/hr</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Daily Load:</Text>
              <Text style={styles.breakdownValue}>{results.dailyKJ?.toFixed(0) || '0'} kJ/24Hr</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>├─ Sensible Heat Ratio:</Text>
              <Text style={styles.breakdownValue}>{results.dailyLoads?.shr?.toFixed(1) || '1.0'}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>└─ Air Qty Required:</Text>
              <Text style={styles.breakdownValue}>{results.airFlowInfo?.requiredCfm?.toFixed(0) || '0'} cfm</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Cold Room Specifications Summary</Text>
            <Text style={styles.infoText}>• Dimensions: {results.dimensions.length}m × {results.dimensions.width}m × {results.dimensions.height}m</Text>
            <Text style={styles.infoText}>• Door size: {results.doorDimensions.width}m × {results.doorDimensions.height}m</Text>
            <Text style={styles.infoText}>• Room volume: {results.volume.toFixed(1)} m³</Text>
            <Text style={styles.infoText}>• Temperature difference: {results.temperatureDifference.toFixed(1)}°C</Text>
            <Text style={styles.infoText}>• Storage density: {results.conditions?.storageDensity || 8} kg/m³</Text>
            <Text style={styles.infoText}>• Door clear opening: {results.conditions?.doorClearOpening || 2000} mm</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Construction Details</Text>
            <Text style={styles.infoText}>• Insulation: {results.construction.type}</Text>
            <Text style={styles.infoText}>• Thickness: {results.construction.thickness}mm</Text>
            <Text style={styles.infoText}>• U-Factor: {results.construction.uFactor.toFixed(3)} W/m²K (Excel exact)</Text>
            <Text style={styles.infoText}>• Floor thickness: {results.construction.floorThickness}mm</Text>
            <Text style={styles.infoText}>• Number of heaters: {results.construction.numberOfHeaters}</Text>
            <Text style={styles.infoText}>• Number of doors: {results.construction.numberOfDoors}</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Product Information</Text>
            <Text style={styles.infoText}>• Product: {results.productInfo.type}</Text>
            <Text style={styles.infoText}>• Daily load: {results.productInfo.mass} kg</Text>
            <Text style={styles.infoText}>• Temperature range: {results.productInfo.incomingTemp}°C → {results.productInfo.outgoingTemp}°C</Text>
            <Text style={styles.infoText}>• Specific heat: {results.productInfo.specificHeat} kJ/kg·K</Text>
            <Text style={styles.infoText}>• Respiration rate: {results.productInfo.respirationRate} W/tonne</Text>
            <Text style={styles.infoText}>• Storage type: {results.storageCapacity.storageType}</Text>
            <Text style={styles.infoText}>• Pull-down time: {results.pullDownTime} hours</Text>
          </View>
          
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Operating Conditions</Text>
            <Text style={styles.infoText}>• External temperature: {results.conditions?.externalTemp || 45}°C</Text>
            <Text style={styles.infoText}>• Internal temperature: {results.conditions?.internalTemp || 2}°C</Text>
            <Text style={styles.infoText}>• Operating hours: {results.conditions?.operatingHours || 20} hours/day</Text>
            <Text style={styles.infoText}>• Door openings: {results.conditions?.doorOpenings || 30} times/day</Text>
            <Text style={styles.infoText}>• Air flow per fan: {results.conditions?.airFlowPerFan || 4163} CFM</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  poweredByBanner: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3B82F6',
  },
  poweredByText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  shareButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  shareButtonText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
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
  mainResultCard: {
    backgroundColor: '#1E3A8A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mainResultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  mainResultValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#60A5FA',
    marginBottom: 8,
  },
  mainResultSubtitle: {
    fontSize: 14,
    color: '#CBD5E1',
    marginBottom: 4,
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
  summaryCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  breakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  subtotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    marginTop: 8,
    paddingTop: 12,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#64748B',
    flex: 1,
    fontFamily: 'monospace',
  },
  breakdownValue: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },
  subtotalLabel: {
    fontSize: 14,
    color: '#1E3A8A',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  subtotalValue: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '700',
  },
  finalCard: {
    backgroundColor: '#EBF8FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3B82F6',
    marginBottom: 12,
  },
  finalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 12,
  },
  finalRow: {
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    marginTop: 8,
    paddingTop: 12,
  },
  finalLabel: {
    fontSize: 15,
    color: '#1E3A8A',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  finalValue: {
    fontSize: 15,
    color: '#3B82F6',
    fontWeight: '700',
  },
  conversionsCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  conversionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065F46',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 4,
  },
});