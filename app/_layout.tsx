import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
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
import * as LocalAuthentication from 'expo-local-authentication';

import { AppProvider, useApp } from '@/src/context/AppContext';
import { ThemeSchemeProvider } from '@/src/context/ThemeContext';
import { CRIMSON_LOGO } from '@/src/constants/backgrounds';
import { Fonts } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppGate() {
  const { appLockEnabled } = useApp();
  const [unlocked, setUnlocked] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);

  const authenticate = useCallback(async () => {
    setAuthFailed(false);
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Crimson',
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    if (result.success) {
      setUnlocked(true);
    } else {
      setAuthFailed(true);
    }
  }, []);

  useEffect(() => {
    if (appLockEnabled && !unlocked) {
      authenticate();
    }
  }, [appLockEnabled, unlocked, authenticate]);

  if (appLockEnabled && !unlocked) {
    return (
      <View style={lockStyles.container}>
        <Image source={CRIMSON_LOGO} style={lockStyles.logo} resizeMode="contain" />
        {authFailed && (
          <TouchableOpacity style={lockStyles.retryBtn} onPress={authenticate}>
            <Text style={lockStyles.retryText}>Tap to unlock</Text>
          </TouchableOpacity>
        )}
      </View>
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

const lockStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 160,
    height: 44,
    marginBottom: 40,
  },
  retryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  retryText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: Fonts.regular,
  },
});
