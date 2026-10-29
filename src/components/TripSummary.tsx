import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, radius, spacing } from '../theme';

/** Grey card showing pickup → drop-off with the same dot/square timeline as the input card. */
export function TripSummary({ from, to }: { from: string; to: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.dot} />
        <Text style={styles.text} numberOfLines={1}>
          {from}
        </Text>
      </View>
      <View style={styles.line} />
      <View style={styles.row}>
        <View style={styles.square} />
        <Text style={styles.text} numberOfLines={1}>
          {to}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary },
  square: { width: 9, height: 9, borderRadius: 2, backgroundColor: colors.ink },
  line: { width: 1.5, height: 16, backgroundColor: colors.subtle, marginLeft: 3.75, marginVertical: 3 },
  text: { flex: 1, marginLeft: spacing.md, fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
});
