import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors, sizing } from '@/tokens';

const WEB_INSETS = Platform.OS === 'web'
  ? { frame: { x: 0, y: 0, width: 0, height: 0 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }
  : undefined;

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  }));

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    document.documentElement.style.backgroundColor = colors.ink;
    document.documentElement.style.height = '100%';
    document.body.style.backgroundColor = colors.ink;
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.overflow = 'hidden';

    const root = document.getElementById('root');
    if (root) {
      root.style.height = '100%';
      root.style.backgroundColor = colors.ink;
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={styles.gestureRoot}>
        <SafeAreaProvider initialMetrics={WEB_INSETS} style={styles.provider}>
          <View style={styles.root}>
            <View style={styles.preview}>
              <Stack screenOptions={{ headerShown: false }} />
            </View>
          </View>
          <StatusBar style="auto" />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
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
    backgroundColor: colors.ink,
  },
});
