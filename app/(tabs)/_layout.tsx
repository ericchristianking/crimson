import { Tabs } from 'expo-router';
import React from 'react';
import { House, CalendarDots, GearSix } from 'phosphor-react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Fonts } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#6b6f76',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontFamily: Fonts.regular,
          fontSize: 11,
        },
        tabBarStyle: {
          backgroundColor: '#0A0A0A',
          borderTopWidth: 0,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <House size={26} color={color} weight="regular" />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color }) => <CalendarDots size={26} color={color} weight="regular" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <GearSix size={26} color={color} weight="regular" />,
        }}
      />
    </Tabs>
  );
}
