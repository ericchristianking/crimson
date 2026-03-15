import React, { useState, useCallback } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AppProvider, useApp } from '@/src/context/AppContext';
import { ThemeSchemeProvider } from '@/src/context/ThemeContext';
import { PinLockScreen } from '@/src/components/PinLockScreen';

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppGate() {
  const { pinEnabled, pinCode } = useApp();
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = useCallback(() => setUnlocked(true), []);

  if (pinEnabled && pinCode && !unlocked) {
    return <PinLockScreen correctPin={pinCode} onUnlock={handleUnlock} />;
  }

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="partner-form"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
    </>
  );
}

function ThemeGate() {
  const { themeMode } = useApp();
  const systemScheme = useSystemColorScheme();

  const resolvedScheme =
    themeMode === 'system' ? (systemScheme ?? 'light') : themeMode;
  const isDark = resolvedScheme === 'dark';

  return (
    <ThemeSchemeProvider value={resolvedScheme}>
      <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
        <AppGate />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </ThemeProvider>
    </ThemeSchemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <ThemeGate />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
