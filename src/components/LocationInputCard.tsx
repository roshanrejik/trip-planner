import React, { RefObject } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LocationField } from '../types';
import { colors, fonts, radius, shadow, spacing } from '../theme';

type FieldConfig = {
  label: string;
  placeholder: string;
  value: string;
  inputRef: RefObject<any>;
};

type Props = {
  pickup: FieldConfig;
  dropoff: FieldConfig;
  activeField: LocationField;
  onFocusField: (field: LocationField) => void;
  onChangeText: (field: LocationField, text: string) => void;
  onClear: (field: LocationField) => void;
  onSubmit: (field: LocationField) => void;
  onSwap: () => void;
};

/**
 * Pickup / drop-off card from the Figma "Where are you going?" screen:
 * a vertical timeline (orange dot → dark square), two inputs, clear buttons and a swap button.
 */
export function LocationInputCard({
  pickup,
  dropoff,
  activeField,
  onFocusField,
  onChangeText,
  onClear,
  onSubmit,
  onSwap,
}: Props) {
  const renderField = (field: LocationField, cfg: FieldConfig) => {
    const active = activeField === field;
    return (
      <View style={styles.fieldRow}>
        <View style={styles.fieldTexts}>
          <Text style={[styles.label, active && styles.labelActive]}>{cfg.label}</Text>
          <TextInput
            testID={`${field}-input`}
            ref={cfg.inputRef}
            value={cfg.value}
            placeholder={cfg.placeholder}
            placeholderTextColor={colors.placeholder}
            onFocus={() => onFocusField(field)}
            onChangeText={(t) => onChangeText(field, t)}
            onSubmitEditing={() => onSubmit(field)}
            returnKeyType="search"
            autoCorrect={false}
            style={styles.input}
            numberOfLines={1}
          />
        </View>
        {!!cfg.value && (
          <Pressable
            onPress={() => onClear(field)}
            hitSlop={8}
            style={styles.clear}
            accessibilityRole="button"
            accessibilityLabel={`Clear ${cfg.label.toLowerCase()}`}
          >
            <Feather name="x" size={14} color={colors.muted} />
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.timeline}>
        <View style={styles.dot} />
        <View style={styles.line} />
        <View style={styles.square} />
      </View>

      <View style={styles.fields}>
        {renderField('pickup', pickup)}
        <View style={styles.divider} />
        {renderField('dropoff', dropoff)}
      </View>

      <Pressable
        onPress={onSwap}
        style={({ pressed }) => [styles.swap, pressed && { opacity: 0.7 }]}
        accessibilityRole="button"
        accessibilityLabel="Swap pickup and drop-off"
        testID="swap-button"
      >
        <MaterialCommunityIcons name="swap-vertical" size={20} color={colors.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg + 2,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    ...shadow.card,
  },
  timeline: { width: 12, alignItems: 'center', paddingTop: 22, paddingBottom: 14 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  line: { flex: 1, width: 2, backgroundColor: colors.border, marginVertical: 4 },
  square: { width: 10, height: 10, borderRadius: 2, backgroundColor: colors.ink },
  fields: { flex: 1, marginLeft: spacing.md },
  fieldRow: { flexDirection: 'row', alignItems: 'center', minHeight: 58 },
  fieldTexts: { flex: 1 },
  label: { fontFamily: fonts.bold, fontSize: 12, color: colors.subtle },
  labelActive: { color: colors.primary },
  input: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 4,
    paddingHorizontal: 0,
  },
  clear: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  swap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
    marginTop: 18,
  },
});
