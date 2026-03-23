import React, { useState, useCallback } from 'react';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import * as SplashScreen from 'expo-splash-screen';

import { AppProvider, useApp } from '@/src/context/AppContext';
import { ThemeSchemeProvider } from '@/src/context/ThemeContext';
import { PinLockScreen } from '@/src/components/PinLockScreen';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppGate() {
  const { pinEnabled, pinCode, pinEmail, setPin, setPinEmail } = useApp();
  const [unlocked, setUnlocked] = useState(false);

  const handleUnlock = useCallback(() => setUnlocked(true), []);

  if (pinEnabled && pinCode && !unlocked) {
    return (
      <PinLockScreen
        correctPin={pinCode}
        pinEmail={pinEmail}
        onUnlock={handleUnlock}
        onResetPin={(newPin, email) => {
          setPin(newPin);
          setPinEmail(email);
          setUnlocked(true);
        }}
      />
    );
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="partner-form"
        options={{ presentation: 'modal', headerShown: false }}
      />
      <Stack.Screen
        name="article"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) await SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
