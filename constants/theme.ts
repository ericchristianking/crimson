import { Platform } from 'react-native';

const primaryCrimson = '#9B2226';
const tintColorLight = primaryCrimson;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#141318',
    background: '#FCFAF8',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F5F5F7',
    background: '#181716',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const CrimsonColors = {
  primary: primaryCrimson,
  period: primaryCrimson,
  periodSubtle: '#E6C0C1',
  pms: '#FAE0AD',
  pmsSubtle: '#FDF2DA',
  fertile: '#A7EBED',
  fertileSubtle: '#DDF7F8',
  ovulation: '#77C3C5',
  ovulationSubtle: '#B8E1E2',
  periodSubtleDark: '#4A1E20',
  pmsSubtleDark: '#3D3222',
  fertileSubtleDark: '#1A3A3B',
  ovulationSubtleDark: '#2E504E',
  dark: {
    surface: '#1F1E1D',
    surfaceElevated: '#272625',
    border: '#3A3937',
    textSecondary: '#9BA1A6',
    textTertiary: '#6b6f76',
  },
  light: {
    surface: '#f5f5f7',
    surfaceElevated: '#ffffff',
    border: '#e5e5e7',
    textSecondary: '#6b6f76',
    textTertiary: '#9BA1A6',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
