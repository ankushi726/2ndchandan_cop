import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserData {
  uid: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

// Sign up with phone OTP
export const signUpWithPhoneOTP = async (
  phone: string, 
  name: string, 
  email: string, 
  password: string
): Promise<string> => {
  try {
    // Format phone number for Firebase
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    
    // Send OTP
    const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
    
    // Store user data temporarily for after verification
    await AsyncStorage.setItem('pendingUserData', JSON.stringify({
      name,
      email,
      phone: formattedPhone,
      password
    }));
    
    return confirmation.verificationId;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send OTP');
  }
};

// Verify OTP and create account
export const verifyOTP = async (verificationId: string, otp: string): Promise<void> => {
  try {
    // Get pending user data
    const pendingData = await AsyncStorage.getItem('pendingUserData');
    if (!pendingData) {
      throw new Error('User data not found');
    }
    
    const userData = JSON.parse(pendingData);
    
    // Verify OTP
    const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
    const userCredential = await auth().signInWithCredential(credential);
    
    // Create user document in Firestore
    await firestore().collection('users').doc(userCredential.user.uid).set({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password, // In production, hash this
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
    
    // Clean up temporary data
    await AsyncStorage.removeItem('pendingUserData');
    
    // Store auth state
    await AsyncStorage.setItem('isAuthenticated', 'true');
    await AsyncStorage.setItem('userId', userCredential.user.uid);
    
  } catch (error: any) {
    throw new Error(error.message || 'Failed to verify OTP');
  }
};

// Sign in with phone and password
export const signInWithPhoneAndPassword = async (
  phone: string, 
  password: string
): Promise<void> => {
  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    
    // Query user by phone number
    const userQuery = await firestore()
      .collection('users')
      .where('phone', '==', formattedPhone)
      .get();
    
    if (userQuery.empty) {
      throw new Error('No account found with this phone number');
    }
    
    const userDoc = userQuery.docs[0];
    const userData = userDoc.data();
    
    // Check password (in production, use proper password hashing)
    if (userData.password !== password) {
      throw new Error('Invalid password');
    }
    
    // Store auth state
    await AsyncStorage.setItem('isAuthenticated', 'true');
    await AsyncStorage.setItem('userId', userDoc.id);
    
  } catch (error: any) {
    throw new Error(error.message || 'Failed to sign in');
  }
};

// Reset password with OTP
export const resetPasswordWithOTP = async (phone: string): Promise<string> => {
  try {
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone}`;
    
    // Check if user exists
    const userQuery = await firestore()
      .collection('users')
      .where('phone', '==', formattedPhone)
      .get();
    
    if (userQuery.empty) {
      throw new Error('No account found with this phone number');
    }
    
    // Send OTP
    const confirmation = await auth().signInWithPhoneNumber(formattedPhone);
    
    // Store phone for password reset
    await AsyncStorage.setItem('resetPhone', formattedPhone);
    
    return confirmation.verificationId;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to send reset OTP');
  }
};

// Verify reset OTP
export const verifyResetOTP = async (verificationId: string, otp: string): Promise<void> => {
  try {
    const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
    await auth().signInWithCredential(credential);
  } catch (error: any) {
    throw new Error(error.message || 'Failed to verify OTP');
  }
};

// Check authentication status
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    const isAuthenticated = await AsyncStorage.getItem('isAuthenticated');
    return isAuthenticated === 'true';
  } catch (error) {
    return false;
  }
};

// Get current user ID
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('userId');
  } catch (error) {
    return null;
  }
};

// Get current user data
export const getCurrentUserData = async (): Promise<UserData | null> => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return null;
    
    const userDoc = await firestore().collection('users').doc(userId).get();
    if (!userDoc.exists) return null;
    
    const data = userDoc.data();
    return {
      uid: userId,
      name: data?.name || '',
      email: data?.email || '',
      phone: data?.phone || '',
      createdAt: data?.createdAt?.toDate() || new Date(),
    };
  } catch (error) {
    return null;
  }
};