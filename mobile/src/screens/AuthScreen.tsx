import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthScreen() {
  const navigation = useNavigation<any>();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setShowOtpInput(true);
      Alert.alert('OTP Sent', 'Check your email for the verification code.');
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert('Invalid OTP', 'Please enter the verification code.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      login(
        {
          id: '1',
          email,
          displayName: email.split('@')[0],
          subscriptionTier: 'free',
          monthlyUsage: 0,
          createdAt: new Date(),
        },
        'mock-token'
      );

      navigation.goBack();
    }, 1000);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleClose}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Logo/Icon */}
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.logoGradient}
              >
                <Ionicons name="person" size={32} color={colors.textOnPrimary} />
              </LinearGradient>
            </View>

            {/* Title */}
            <Text style={styles.title}>
              {showOtpInput ? 'Verify Your Email' : 'Welcome Back'}
            </Text>
            <Text style={styles.subtitle}>
              {showOtpInput
                ? `Enter the code sent to ${email}`
                : 'Sign in or create an account to sync your notes'}
            </Text>

            {/* Form Card */}
            <View style={styles.formCard}>
              {!showOtpInput ? (
                <>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail-outline" size={20} color={colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="your@email.com"
                      placeholderTextColor={colors.textLight}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={!isLoading}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleSendOtp}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={isLoading ? [colors.textLight, colors.textLight] : [colors.primary, colors.primaryDark]}
                      style={styles.primaryButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      {isLoading ? (
                        <Text style={styles.primaryButtonText}>Sending...</Text>
                      ) : (
                        <>
                          <Text style={styles.primaryButtonText}>Continue</Text>
                          <Ionicons name="arrow-forward" size={20} color={colors.textOnPrimary} />
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.otpContainer}>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <View
                        key={index}
                        style={[
                          styles.otpBox,
                          otp.length > index && styles.otpBoxFilled,
                        ]}
                      >
                        <Text style={styles.otpDigit}>
                          {otp[index] || ''}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TextInput
                    style={styles.hiddenInput}
                    value={otp}
                    onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    autoFocus
                    maxLength={6}
                  />

                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={handleVerifyOtp}
                    disabled={isLoading || otp.length < 6}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isLoading || otp.length < 6
                          ? [colors.textLight, colors.textLight]
                          : [colors.primary, colors.primaryDark]
                      }
                      style={styles.primaryButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.primaryButtonText}>
                        {isLoading ? 'Verifying...' : 'Verify'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => {
                      setShowOtpInput(false);
                      setOtp('');
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>Use different email</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Terms */}
            <Text style={styles.terms}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text> and{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    paddingBottom: spacing.xxl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundLight,
  },
  inputIcon: {
    paddingLeft: spacing.md,
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: spacing.md,
    fontSize: typography.body,
    color: colors.textPrimary,
  },
  primaryButton: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  primaryButtonText: {
    color: colors.textOnPrimary,
    fontSize: typography.body,
    fontWeight: typography.semibold,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  otpBox: {
    width: 44,
    height: 52,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
  },
  otpDigit: {
    fontSize: typography.h4,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
  },
  secondaryButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
  },
  terms: {
    fontSize: typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: 18,
  },
  termsLink: {
    color: colors.primary,
  },
});
