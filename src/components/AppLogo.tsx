import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, radius } from '../theme';

/** Wayfare logo: route glyph on an orange rounded square (as in the Figma login screen). */
export function AppLogo({ size = 56 }: { size?: number }) {
  const glyph = size * 0.5;
  return (
    <View style={[styles.box, { width: size, height: size }]}>
      <Svg width={glyph} height={glyph} viewBox="0 0 24 24" fill="none">
        <Circle cx={6} cy={19} r={3} stroke={colors.surface} strokeWidth={2} />
        <Path
          d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"
          stroke={colors.surface}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx={18} cy={5} r={3} stroke={colors.surface} strokeWidth={2} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
