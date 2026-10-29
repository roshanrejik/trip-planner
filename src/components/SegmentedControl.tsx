import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius } from '../theme';

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Row of selectable pills (Drive / Ride / Walk). Generic so it can be reused for any options. */
export function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.row} accessibilityRole="tablist">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            testID={`mode-${opt.value}`}
            onPress={() => onChange(opt.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.pill, selected && styles.pillSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  pill: {
    flex: 1,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillSelected: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  label: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  labelSelected: { color: colors.primary },
});
