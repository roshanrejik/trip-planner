import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, shadow } from '../theme';

type Props = {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  testID?: string;
};

/** White pill-like tile used for "Use current" and "Pick on map". */
export function ActionTile({ label, icon, onPress, testID }: Props) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <Feather name={icon} size={17} color={colors.ink} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadow.card,
  },
  pressed: { backgroundColor: colors.background },
  label: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
});
