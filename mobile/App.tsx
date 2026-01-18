import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { AppNavigator } from './src/navigation';
import { useAuthStore } from './src/store/useAuthStore';

export default function App() {
  const { setLoading } = useAuthStore();

  useEffect(() => {
    // Check for existing auth session on app start
    const initAuth = async () => {
      try {
        // In production, check for stored token and validate
        // For now, just mark loading as complete
        setTimeout(() => {
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Auth init error:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="dark" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
