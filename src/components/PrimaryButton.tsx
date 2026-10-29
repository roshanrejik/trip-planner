import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Full-width orange call-to-action button (Log in / Next / Start navigation). */
export function PrimaryButton({ title, onPress, disabled, loading, icon, style, testID }: Props) {
  const inactive = disabled || loading;
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        disabled ? styles.disabled : styles.enabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <>
          {icon && (
            <Feather
              name={icon}
              size={20}
              color={disabled ? colors.subtle : colors.surface}
              style={styles.icon}
            />
          )}
          <Text style={[styles.label, disabled && styles.labelDisabled]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  enabled: { backgroundColor: colors.primary },
  disabled: { backgroundColor: colors.disabled },
  pressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  icon: { marginRight: 10 },
  label: { fontFamily: fonts.bold, fontSize: 17, color: colors.surface },
  labelDisabled: { color: colors.subtle },
});
