import firestore from '@react-native-firebase/firestore';
import { getCurrentUserId } from './authService';

export interface ColdRoomData {
  userId: string;
  type: 'coldroom' | 'freezer' | 'blastfreezer';
  timestamp: Date;
  
  // Room dimensions
  dimensions: {
    length: number;
    width: number;
    height: number;
    volume: number;
  };
  
  // Door specifications
  door: {
    width: number;
    height: number;
    area: number;
    openings: number;
  };
  
  // Operating conditions
  conditions: {
    externalTemp: number;
    internalTemp: number;
    temperatureDifference: number;
    operatingHours: number;
    pullDownTime?: number;
    batchHours?: number;
  };
  
  // Construction details
  construction: {
    insulationType: string;
    insulationThickness: number;
    uFactor: number;
    floorThickness?: number;
  };
  
  // Product information
  product: {
    type: string;
    dailyLoad: number;
    incomingTemp: number;
    outgoingTemp: number;
    storageCapacity: number;
    storageUtilization: number;
  };
  
  // Load calculations
  loads: {
    transmission: number;
    product: number;
    airChange: number;
    internal: number;
    door: number;
    heaters?: number;
    total: number;
    totalWithSafety: number;
  };
  
  // Final results
  results: {
    totalKW: number;
    totalTR: number;
    totalBTU: number;
    dailyEnergyConsumption?: number;
    SHR?: number;
  };
  
  // Equipment summary
  equipment?: {
    fanLoad: number;
    heaterLoad: number;
    lightingLoad: number;
    totalAirFlow: number;
  };
}

// Save calculation data to Firebase
export const saveCalculationData = async (
  calculationData: any,
  calculationType: 'coldroom' | 'freezer' | 'blastfreezer'
): Promise<string> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Transform calculation data to match our interface
    const coldRoomData: ColdRoomData = {
      userId,
      type: calculationType,
      timestamp: new Date(),
      
      dimensions: {
        length: calculationData.dimensions.length,
        width: calculationData.dimensions.width || calculationData.dimensions.breadth,
        height: calculationData.dimensions.height,
        volume: calculationData.volume,
      },
      
      door: {
        width: calculationData.doorDimensions.width,
        height: calculationData.doorDimensions.height,
        area: calculationData.areas.door,
        openings: calculationData.doorOpenings || 0,
      },
      
      conditions: {
        externalTemp: calculationData.conditions?.externalTemp || calculationData.breakdown?.transmission?.externalTemp || 0,
        internalTemp: calculationData.conditions?.internalTemp || calculationData.breakdown?.transmission?.internalTemp || 0,
        temperatureDifference: calculationData.temperatureDifference,
        operatingHours: calculationData.conditions?.operatingHours || 24,
        pullDownTime: calculationData.pullDownTime,
        batchHours: calculationData.batchHours,
      },
      
      construction: {
        insulationType: calculationData.construction.type,
        insulationThickness: calculationData.construction.thickness || calculationData.construction.wallThickness,
        uFactor: calculationData.construction.uFactor || calculationData.construction.uFactors?.walls,
        floorThickness: calculationData.construction.floorThickness,
      },
      
      product: {
        type: calculationData.productInfo.type,
        dailyLoad: calculationData.productInfo.mass,
        incomingTemp: calculationData.productInfo.incomingTemp,
        outgoingTemp: calculationData.productInfo.outgoingTemp,
        storageCapacity: calculationData.storageCapacity.maximum,
        storageUtilization: calculationData.storageCapacity.utilization,
      },
      
      loads: {
        transmission: calculationData.breakdown?.transmission?.total || calculationData.transmissionLoad?.total || 0,
        product: calculationData.breakdown?.product?.total || calculationData.productLoad?.total || 0,
        airChange: calculationData.breakdown?.airChange?.load || calculationData.airInfiltrationLoad || 0,
        internal: calculationData.breakdown?.internal?.total || calculationData.internalLoads?.total || 0,
        door: calculationData.breakdown?.doorOpening || calculationData.doorLoad || 0,
        heaters: calculationData.breakdown?.heaters?.total || 0,
        total: calculationData.totalLoad || calculationData.totalBeforeSafety,
        totalWithSafety: calculationData.totalLoadWithSafety || calculationData.finalLoad,
      },
      
      results: {
        totalKW: calculationData.totalKW || calculationData.finalLoad,
        totalTR: calculationData.totalTR || calculationData.refrigerationTons,
        totalBTU: calculationData.totalBTU || 0,
        dailyEnergyConsumption: calculationData.dailyEnergyConsumption,
        SHR: calculationData.loadSummary?.SHR || calculationData.dailyLoads?.shr,
      },
      
      equipment: calculationData.equipmentSummary ? {
        fanLoad: calculationData.equipmentSummary.totalFanLoad,
        heaterLoad: calculationData.equipmentSummary.totalHeaterLoad,
        lightingLoad: calculationData.equipmentSummary.totalLightingLoad,
        totalAirFlow: calculationData.conditions?.airFlowPerFan || 0,
      } : undefined,
    };

    // Save to Firestore
    const docRef = await firestore()
      .collection('calculations')
      .add(coldRoomData);

    return docRef.id;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to save calculation data');
  }
};

// Get user's calculation history
export const getUserCalculations = async (): Promise<ColdRoomData[]> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const snapshot = await firestore()
      .collection('calculations')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp.toDate(),
    })) as ColdRoomData[];
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch calculations');
  }
};

// Delete a calculation
export const deleteCalculation = async (calculationId: string): Promise<void> => {
  try {
    await firestore().collection('calculations').doc(calculationId).delete();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete calculation');
  }
};