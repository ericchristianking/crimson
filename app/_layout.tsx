import React, { useState, useCallback } from 'react';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
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
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="partner-form"
        options={{ presentation: 'modal', headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <ThemeSchemeProvider value="dark">
          <ThemeProvider value={DarkTheme}>
            <AppGate />
            <StatusBar style="light" />
          </ThemeProvider>
        </ThemeSchemeProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
