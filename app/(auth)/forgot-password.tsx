import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Phone, Lock, Eye, EyeOff } from 'lucide-react-native';
import OTPInputView from 'react-native-otp-inputs';
import { resetPasswordWithOTP, verifyResetOTP } from '@/services/authService';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationId, setVerificationId] = useState('');

  const handleSendOTP = async () => {
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const verificationId = await resetPasswordWithOTP(phone);
      setVerificationId(verificationId);
      setStep(2);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter the complete OTP');
      return;
    }

    setLoading(true);
    try {
      await verifyResetOTP(verificationId, otp);
      setStep(3);
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter both password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    Alert.alert('Success', 'Password reset successfully!', [
      { text: 'OK', onPress: () => router.replace('/(auth)/signin') }
    ]);
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <View style={styles.inputContainer}>
              <Phone color="#64748B" size={20} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[styles.actionButton, loading && styles.disabledButton]} 
              onPress={handleSendOTP}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </Text>
            </TouchableOpacity>
          </>
        );

      case 2:
        return (
          <>
            <Text style={styles.otpInstructions}>
              Enter the 6-digit code sent to {phone}
            </Text>
            
            <OTPInputView
              style={styles.otpContainer}
              pinCount={6}
              code={otp}
              onCodeChanged={setOtp}
              autoFocusOnLoad
              codeInputFieldStyle={styles.otpInput}
              codeInputHighlightStyle={styles.otpInputHighlight}
            />

            <TouchableOpacity 
              style={[styles.actionButton, loading && styles.disabledButton]} 
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Text>
            </TouchableOpacity>
          </>
        );

      case 3:
        return (
          <>
            <View style={styles.inputContainer}>
              <Lock color="#64748B" size={20} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff color="#64748B" size={20} strokeWidth={2} />
                ) : (
                  <Eye color="#64748B" size={20} strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Lock color="#64748B" size={20} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity 
              style={[styles.actionButton, loading && styles.disabledButton]} 
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.actionButtonText}>Reset Password</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <LinearGradient colors={['#EBF8FF', '#DBEAFE', '#BFDBFE']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>We'll help you reset your password</Text>
        </View>

        <View style={styles.form}>
          {renderStepContent()}

          <View style={styles.signInContainer}>
            <Text style={styles.signInText}>Remember your password? </Text>
            <TouchableOpacity onPress={handleSignIn}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1E293B',
    marginLeft: 12,
  },
  actionButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInText: {
    fontSize: 14,
    color: '#64748B',
  },
  signInLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  otpInstructions: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  otpContainer: {
    width: '100%',
    height: 60,
    marginBottom: 32,
  },
  otpInput: {
    width: 45,
    height: 45,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    color: '#1E293B',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  otpInputHighlight: {
    borderColor: '#3B82F6',
    backgroundColor: '#EBF8FF',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
});