

import { Platform } from 'react-native';

const apricotOrange = '#F08300'; 
const lemonYellow = '#DFD000';   
const cotingaPurple = '#572252';
const slateColor = '#3B4449';   

export const Palette = {
  apricotOrange,
  lemonYellow,
  cotingaPurple,
  slateColor,
} as const;

export const Colors = {
  light: {
    text: slateColor,
    background: '#FFF9F2',
    tint: apricotOrange,
    icon: '#8A7D72',
    tabIconDefault: '#8A7D72',
    tabIconSelected: apricotOrange,
    card: '#FFFFFF',
    accent: cotingaPurple,
    secondary: lemonYellow,
  },
  dark: {
    text: '#F0E8DF',
    background: '#1A1215',
    tint: lemonYellow,
    icon: '#9B8E83',
    tabIconDefault: '#9B8E83',
    tabIconSelected: lemonYellow,
    card: '#2A1E22',
    accent: apricotOrange,
    secondary: cotingaPurple,
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
