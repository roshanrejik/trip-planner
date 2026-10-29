/**
 * Design tokens extracted from the Figma file (colours sampled from the exported frames).
 * Every component reads from here so the look stays consistent and is easy to tweak.
 */
export const colors = {
  primary: '#F1521F',
  primarySoft: '#FDEBE3',
  ink: '#111F2C', // headings, primary text
  inkSoft: '#25313B', // dark chips / overlays
  text: '#3B4753',
  muted: '#8A96A3', // subtitles, secondary text
  subtle: '#A3AEB8', // section labels, disabled text
  placeholder: '#9AA5B1',
  background: '#F3F5F7',
  surface: '#FFFFFF',
  border: '#E6EBEF',
  disabled: '#E6EBEF',
  danger: '#E5484D',
  overlay: 'rgba(17, 31, 44, 0.45)',
};

export const fonts = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: '#111F2C',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  floating: {
    shadowColor: '#111F2C',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
};
