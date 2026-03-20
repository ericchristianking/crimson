import { Platform } from 'react-native';

const primaryCrimson = '#9B2226';

export const Colors = {
  dark: {
    text: '#F5F5F7',
    background: '#000000',
    tint: '#FFFFFF',
    icon: '#9BA1A6',
    tabIconDefault: '#6b6f76',
    tabIconSelected: '#FFFFFF',
  },
};

export const CrimsonColors = {
  primary: primaryCrimson,

  period: '#E85A5F',
  periodGlow: 'rgba(232,90,95,0.45)',
  periodGlowCenter: 'rgba(232,90,95,0.7)',
  periodSolid: 'rgba(232,90,95,0.75)',

  pms: '#702887',
  pmsGlow: 'rgba(112,40,135,0.35)',
  pmsGlowCenter: 'rgba(112,40,135,0.6)',
  pmsSolid: 'rgba(112,40,135,0.7)',

  fertile: '#2DEDF1',
  fertileGlow: 'rgba(45,237,241,0.35)',
  fertileGlowCenter: 'rgba(45,237,241,0.65)',
  fertileSolid: 'rgba(45,237,241,0.6)',

  ovulation: '#005AFF',
  ovulationGlow: 'rgba(0,90,255,0.4)',
  ovulationGlowCenter: 'rgba(0,90,255,0.7)',
  ovulationSolid: 'rgba(0,90,255,0.7)',

  glass: {
    surface: 'rgba(0,0,0,0.35)',
    surfaceElevated: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.08)',
    textSecondary: 'rgba(255,255,255,0.6)',
    textTertiary: 'rgba(255,255,255,0.4)',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
