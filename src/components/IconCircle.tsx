import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme';

type Props = { icon: keyof typeof Feather.glyphMap; size?: number; color?: string; bg?: string };

/** Round grey icon badge used in place rows and turn-by-turn steps. */
export function IconCircle({ icon, size = 40, color = colors.ink, bg = colors.background }: Props) {
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Feather name={icon} size={size * 0.45} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
});
