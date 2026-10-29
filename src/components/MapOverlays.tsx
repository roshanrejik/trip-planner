import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius, shadow } from '../theme';

/** White square floating button over the map (back / layers). */
export function MapButton({
  icon,
  onPress,
  label,
  active,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  label: string;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.button, active && styles.active, pressed && { opacity: 0.8 }]}
    >
      <Feather name={icon} size={22} color={active ? colors.surface : colors.ink} />
    </Pressable>
  );
}

/** Dark pill with a warning icon ("Heavy traffic near the marina"). */
export function TrafficChip({ text }: { text: string }) {
  return (
    <View style={styles.chip}>
      <Feather name="alert-triangle" size={15} color={colors.surface} />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.floating,
  },
  active: { backgroundColor: colors.ink },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: colors.inkSoft,
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 14,
    ...shadow.floating,
  },
  chipText: { fontFamily: fonts.bold, fontSize: 13, color: colors.surface },
});
