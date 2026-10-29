import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, fonts, spacing } from '../theme';

type Props = { title: string; subtitle?: string; onBack?: () => void };

/** White header with back chevron, large title and step subtitle (Set Locations screen). */
export function ScreenHeader({ title, subtitle, onBack }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
      {onBack && (
        <Pressable
          onPress={onBack}
          hitSlop={12}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={26} color={colors.ink} />
        </Pressable>
      )}
      <View style={styles.texts}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  back: { marginTop: 4, marginRight: spacing.md, marginLeft: -4 },
  texts: { flex: 1 },
  title: { fontFamily: fonts.extrabold, fontSize: 26, color: colors.ink, lineHeight: 34 },
  subtitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted, marginTop: 4 },
});
