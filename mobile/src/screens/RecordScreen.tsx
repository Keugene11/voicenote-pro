import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { useRecordingStore } from '../store/useRecordingStore';

export default function RecordScreen() {
  const navigation = useNavigation<any>();
  const recordingRef = useRef<Audio.Recording | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const {
    isRecording,
    isPaused,
    duration,
    metering,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
    updateDuration,
    addMeteringValue,
  } = useRecordingStore();

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    requestPermissions();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      startPulseAnimation();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, isPaused]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setHasPermission(false);
    }
  };

  const cleanup = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  };

  const handleStartRecording = async () => {
    if (!hasPermission) {
      Alert.alert('Permission Required', 'Please grant microphone permission to record audio.');
      return;
    }

    try {
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      recordingRef.current = recording;
      startRecording();

      intervalRef.current = setInterval(async () => {
        if (recordingRef.current) {
          const status = await recordingRef.current.getStatusAsync();
          if (status.isRecording) {
            updateDuration(Math.floor(status.durationMillis / 1000));
            addMeteringValue(Math.random() * 0.8 + 0.2);
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
    }
  };

  const handlePauseRecording = async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.pauseAsync();
        pauseRecording();
      } catch (error) {
        console.error('Error pausing recording:', error);
      }
    }
  };

  const handleResumeRecording = async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.startAsync();
        resumeRecording();
      } catch (error) {
        console.error('Error resuming recording:', error);
      }
    }
  };

  const handleStopRecording = async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        stopRecording(uri || '');

        if (uri) {
          navigation.replace('Result', { audioUri: uri });
        } else {
          Alert.alert('Error', 'No audio recorded');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        Alert.alert('Error', 'Failed to save recording. Please try again.');
      }
    }
  };

  const handleCancelRecording = async () => {
    await cleanup();
    resetRecording();
    navigation.goBack();
  };

  const handleResetRecording = async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (error) {
        // Ignore
      }
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    recordingRef.current = null;
    resetRecording();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCancelRecording}
          >
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>

          {isRecording && (
            <View style={styles.recordingBadge}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>
                {isPaused ? 'PAUSED' : 'RECORDING'}
              </Text>
            </View>
          )}

          <View style={{ width: 44 }} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {isRecording ? (
            <>
              {/* Timer */}
              <Text style={styles.timer}>{formatDuration(duration)}</Text>

              {/* Waveform Visualizer */}
              <View style={styles.waveformContainer}>
                {metering.slice(-30).map((value, index) => (
                  <View
                    key={index}
                    style={[
                      styles.waveformBar,
                      {
                        height: 4 + value * 60,
                        backgroundColor: isPaused ? colors.textLight : colors.primary,
                      },
                    ]}
                  />
                ))}
                {Array.from({ length: Math.max(0, 30 - metering.length) }).map((_, index) => (
                  <View
                    key={`empty-${index}`}
                    style={[styles.waveformBar, { height: 4 }]}
                  />
                ))}
              </View>

              {/* Controls */}
              <View style={styles.recordingControls}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleResetRecording}
                >
                  <Ionicons name="refresh" size={24} color={colors.textSecondary} />
                  <Text style={styles.secondaryButtonText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.pauseResumeButton}
                  onPress={isPaused ? handleResumeRecording : handlePauseRecording}
                >
                  <Ionicons
                    name={isPaused ? 'play' : 'pause'}
                    size={32}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleStopRecording}
                >
                  <Ionicons name="checkmark-circle" size={24} color={colors.success} />
                  <Text style={[styles.secondaryButtonText, { color: colors.success }]}>Done</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Idle State */}
              <View style={styles.idleContent}>
                <Ionicons name="mic-outline" size={48} color={colors.textLight} />
                <Text style={styles.idleTitle}>Tap to Record</Text>
                <Text style={styles.idleSubtitle}>
                  Your voice will be transformed into professional text
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {!isRecording && (
            <TouchableOpacity
              style={styles.startRecordButton}
              onPress={handleStartRecording}
              activeOpacity={0.8}
            >
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.startRecordButtonGradient}
                >
                  <Ionicons name="mic" size={36} color={colors.textOnPrimary} />
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          )}

          {isRecording && (
            <TouchableOpacity
              style={styles.stopRecordButton}
              onPress={handleStopRecording}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.error, '#DC2626']}
                style={styles.stopRecordButtonGradient}
              >
                <View style={styles.stopIcon} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  recordingText: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  timer: {
    fontSize: 64,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    fontVariant: ['tabular-nums'],
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginBottom: spacing.xl,
    gap: 3,
  },
  waveformBar: {
    width: 4,
    backgroundColor: colors.textLight,
    borderRadius: 2,
  },
  recordingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.lg,
  },
  secondaryButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  secondaryButtonText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  pauseResumeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  idleContent: {
    alignItems: 'center',
    gap: spacing.md,
  },
  idleTitle: {
    fontSize: typography.h3,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  idleSubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  bottomSection: {
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  startRecordButton: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  startRecordButtonGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopRecordButton: {
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  stopRecordButtonGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopIcon: {
    width: 28,
    height: 28,
    backgroundColor: colors.textOnPrimary,
    borderRadius: 4,
  },
});
