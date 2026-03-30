import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, AppState } from 'react-native';
import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
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
import { PurchasesProvider } from '@/src/context/PurchasesContext';
import { initializePurchases } from '@/src/services/purchases';

// Initialize RevenueCat once, before any component mounts
initializePurchases();
import { ThemeSchemeProvider } from '@/src/context/ThemeContext';
import { CRIMSON_LOGO } from '@/src/constants/backgrounds';
import { Fonts } from '@/constants/theme';
import OnboardingScreen from '@/app/onboarding';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppGate() {
  const { appLockEnabled, onboardingComplete } = useApp();
  const [unlocked, setUnlocked] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const authenticatingRef = useRef(false);
  const needsUnlockRef = useRef(false);
  const appStateRef = useRef(AppState.currentState);
  const overlayOpacity = useSharedValue(0);

  const authenticate = useCallback(async () => {
    authenticatingRef.current = true;
    setAuthFailed(false);
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Crimson',
      fallbackLabel: 'Use passcode',
      disableDeviceFallback: false,
    });
    authenticatingRef.current = false;
    if (result.success) {
      needsUnlockRef.current = false;
      setUnlocked(true);
      overlayOpacity.value = 0;
    } else {
      setAuthFailed(true);
    }
  }, [overlayOpacity]);

  useEffect(() => {
    if (appLockEnabled && !unlocked) {
      authenticate();
    }
  }, [appLockEnabled, unlocked, authenticate]);

  useEffect(() => {
    if (appLockEnabled) return;

    needsUnlockRef.current = false;
    authenticatingRef.current = false;
    setAuthFailed(false);
    setUnlocked(true);
    overlayOpacity.value = 0;
  }, [appLockEnabled, overlayOpacity]);

  useEffect(() => {
    if (!appLockEnabled) return;

    const sub = AppState.addEventListener('change', (nextState) => {
      const prev = appStateRef.current;
      appStateRef.current = nextState;

      if (prev === 'active' && nextState !== 'active' && !authenticatingRef.current) {
        needsUnlockRef.current = true;
        overlayOpacity.value = 1;
      } else if (nextState === 'active' && !authenticatingRef.current) {
        if (needsUnlockRef.current) {
          setUnlocked(false);
        }
      }
    });

    return () => sub.remove();
  }, [appLockEnabled, overlayOpacity]);

  const privacyStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (!onboardingComplete) {
    return <OnboardingScreen />;
  }

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
    <>
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
      {appLockEnabled && (
        <Animated.View
          style={[StyleSheet.absoluteFill, lockStyles.container, privacyStyle]}
          pointerEvents="none"
        >
          <Image source={CRIMSON_LOGO} style={lockStyles.logo} resizeMode="contain" />
        </Animated.View>
      )}
    </>
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
        <PurchasesProvider>
          <ThemeSchemeProvider value="dark">
            <ThemeProvider value={DarkTheme}>
              <AppGate />
              <StatusBar style="light" />
            </ThemeProvider>
          </ThemeSchemeProvider>
        </PurchasesProvider>
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
