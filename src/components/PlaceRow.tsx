import React, { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Place, PlaceKind } from '../types';
import { colors, fonts, spacing } from '../theme';
import { IconCircle } from './IconCircle';

const ICONS: Record<PlaceKind, keyof typeof Feather.glyphMap> = {
  saved: 'home',
  recent: 'clock',
  current: 'crosshair',
  map: 'map-pin',
  custom: 'map-pin',
};

type Props = { place: Place; onPress: (place: Place) => void; showDivider?: boolean };

/** A saved/recent place in the suggestions list. */
export const PlaceRow = memo(function PlaceRow({ place, onPress, showDivider }: Props) {
  return (
    <Pressable
      testID={`place-${place.id}`}
      onPress={() => onPress(place)}
      accessibilityRole="button"
      accessibilityLabel={`${place.name}, ${place.address}`}
      style={({ pressed }) => [styles.row, showDivider && styles.divider, pressed && styles.pressed]}
    >
      <IconCircle icon={ICONS[place.kind]} />
      <View style={styles.texts}>
        <Text style={styles.name} numberOfLines={1}>
          {place.name}
        </Text>
        <Text style={styles.address} numberOfLines={1}>
          {place.address}
        </Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    gap: spacing.md + 2,
  },
  pressed: { backgroundColor: colors.background },
  texts: { flex: 1 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  name: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  address: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted, marginTop: 3 },
});
