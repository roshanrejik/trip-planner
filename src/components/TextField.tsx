import React, { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

type Props = TextInputProps & {
  label: string;
  error?: string;
  icon?: keyof typeof Feather.glyphMap;
  /** Renders an eye toggle to show/hide the value. */
  secureToggle?: boolean;
};

/** Labelled input used on the auth screens, with inline error and optional password toggle. */
export const TextField = forwardRef<any, Props>(function TextField(
  { label, error, icon, secureToggle, style, onFocus, onBlur, ...inputProps },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, focused && styles.fieldFocused, !!error && styles.fieldError]}>
        {icon && (
          <Feather
            name={icon}
            size={18}
            color={focused ? colors.primary : colors.placeholder}
            style={styles.leadingIcon}
          />
        )}
        <TextInput
          ref={ref}
          style={[styles.input, style]}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureToggle ? hidden : inputProps.secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...inputProps}
        />
        {secureToggle && (
          <Pressable
            onPress={() => setHidden((h) => !h)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Feather name={hidden ? 'eye' : 'eye-off'} size={20} color={colors.muted} />
          </Pressable>
        )}
      </View>
      {!!error && (
        <View style={styles.errorRow}>
          <Feather name="alert-circle" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  label: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink, marginBottom: 10 },
  field: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  fieldFocused: { borderColor: colors.primary },
  fieldError: { borderColor: colors.danger },
  leadingIcon: { marginRight: 12 },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.ink,
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 },
  errorText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.danger },
});
