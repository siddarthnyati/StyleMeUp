import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors, sizing } from '@/tokens';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    document.documentElement.style.backgroundColor = colors.ink;
    document.body.style.backgroundColor = colors.ink;
    document.body.style.margin = '0';
  }, []);

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <SafeAreaProvider style={styles.provider}>
        <View style={styles.root}>
          <View style={styles.preview}>
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </View>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
    height: '100%',
    backgroundColor: colors.ink,
  },
  provider: {
    flex: 1,
  },
  root: {
    flex: 1,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.ink,
  },
  preview: {
    width: '100%',
    maxWidth: process.env.EXPO_OS === 'web' ? sizing.appPreviewMaxWidth : undefined,
    flex: 1,
    height: '100%',
    backgroundColor: colors.paper,
  },
});
