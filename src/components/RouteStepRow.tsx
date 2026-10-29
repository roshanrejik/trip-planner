import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { RouteStep } from '../types';
import { colors, fonts, spacing } from '../theme';
import { formatDistance } from '../utils/format';
import { IconCircle } from './IconCircle';

export const MANEUVER_ICONS: Record<RouteStep['maneuver'], keyof typeof Feather.glyphMap> = {
  straight: 'arrow-up',
  left: 'corner-up-left',
  right: 'corner-up-right',
  'slight-left': 'arrow-up-left',
  'slight-right': 'arrow-up-right',
  uturn: 'rotate-ccw',
  arrive: 'flag',
};

/** One row of the turn-by-turn list. */
export const RouteStepRow = memo(function RouteStepRow({
  step,
  showDivider,
}: {
  step: RouteStep;
  showDivider?: boolean;
}) {
  return (
    <View style={[styles.row, showDivider && styles.divider]}>
      <IconCircle icon={MANEUVER_ICONS[step.maneuver]} size={34} />
      <View style={styles.texts}>
        <Text style={styles.instruction}>{step.instruction}</Text>
        {!!step.detail && (
          <Text style={styles.detail} numberOfLines={1}>
            {step.detail}
          </Text>
        )}
      </View>
      {step.distanceMeters > 0 && <Text style={styles.distance}>{formatDistance(step.distanceMeters)}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.md + 2, gap: spacing.md },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  texts: { flex: 1 },
  instruction: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  detail: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted, marginTop: 3 },
  distance: { fontFamily: fonts.bold, fontSize: 13, color: colors.muted, marginTop: 2 },
});
