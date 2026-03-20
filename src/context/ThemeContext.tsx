import React, { createContext, useContext } from 'react';
import type { ColorSchemeName } from 'react-native';

const ThemeContext = createContext<ColorSchemeName>('dark');

export const ThemeSchemeProvider = ThemeContext.Provider;

export function useResolvedColorScheme(): NonNullable<ColorSchemeName> {
  return useContext(ThemeContext) ?? 'dark';
}
