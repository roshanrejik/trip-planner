import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { MapButton } from '../components/MapOverlays';
import { PrimaryButton } from '../components/PrimaryButton';
import { RouteMap } from '../components/map/RouteMap';
import { useTrip } from '../context/TripContext';
import { DEFAULT_REGION } from '../data/places';
import type { ScreenProps } from '../navigation/RootNavigator';
import { describeCoords } from '../services/location';
import { LatLng } from '../types';
import { colors, fonts, radius, shadow, spacing } from '../theme';

/** "Pick on map": pan the map under a fixed centre pin, then confirm. */
export function MapPickerScreen({ navigation, route }: ScreenProps<'MapPicker'>) {
  const { field } = route.params;
  const insets = useSafeAreaInsets();
  const trip = useTrip();
  const existing = trip[field];
  const initial = useRef<LatLng>(existing?.coords ?? DEFAULT_REGION).current;

  const [center, setCenter] = useState<LatLng>(initial);
  const [address, setAddress] = useState<string | null>(null);

  // Reverse-geocode the centre once the user stops panning (debounced to avoid spamming the geocoder).
  useEffect(() => {
    setAddress(null);
    let cancelled = false;
    const timer = setTimeout(async () => {
      const text = await describeCoords(center);
      if (!cancelled) setAddress(text);
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [center]);

  const onCenterChange = useCallback((c: LatLng) => setCenter(c), []);

  const confirm = () => {
    trip.setLocation(field, {
      id: `map-${Date.now()}`,
      name: address?.split(' · ')[0] ?? 'Dropped pin',
      address: address ?? `${center.latitude.toFixed(4)}, ${center.longitude.toFixed(4)}`,
      kind: 'map',
      coords: center,
    });
    navigation.goBack();
  };

  const isPickup = field === 'pickup';

  return (
    <View style={styles.screen}>
      <RouteMap style={StyleSheet.absoluteFill} initialCenter={initial} onCenterChange={onCenterChange} />

      {/* Fixed centre pin – the map moves underneath it. */}
      <View style={styles.pinWrap} pointerEvents="none">
        <View style={[styles.pin, { backgroundColor: isPickup ? colors.primary : colors.ink }]}>
          <Feather name="map-pin" size={18} color={colors.surface} />
        </View>
        <View style={styles.pinStem} />
        <View style={styles.pinShadow} />
      </View>

      <View style={[styles.top, { top: insets.top + spacing.md }]}>
        <MapButton icon="x" label="Close" onPress={navigation.goBack} />
        <View style={styles.titleChip}>
          <Text style={styles.titleText}>{isPickup ? 'Set pickup' : 'Set drop-off'}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) + 4 }]}>
        <Text style={styles.sheetLabel}>{isPickup ? 'Pickup location' : 'Drop-off location'}</Text>
        <View style={styles.addressRow}>
          {address ? (
            <Text style={styles.address} numberOfLines={2}>
              {address}
            </Text>
          ) : (
            <ActivityIndicator color={colors.primary} />
          )}
        </View>
        <Text style={styles.hint}>Move the map to place the pin exactly where you want.</Text>
        <PrimaryButton title="Confirm location" onPress={confirm} disabled={!address} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  pinWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 52, // lift so the stem tip sits on the exact map centre
  },
  pin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
    ...shadow.floating,
  },
  pinStem: { width: 3, height: 12, backgroundColor: colors.ink },
  pinShadow: { width: 10, height: 4, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.25)' },
  top: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleChip: {
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingHorizontal: spacing.lg,
    ...shadow.floating,
  },
  titleText: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    ...shadow.floating,
  },
  sheetLabel: { fontFamily: fonts.bold, fontSize: 13, color: colors.subtle },
  addressRow: { minHeight: 48, justifyContent: 'center', alignItems: 'flex-start' },
  address: { fontFamily: fonts.extrabold, fontSize: 18, color: colors.ink },
  hint: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted, marginBottom: spacing.lg },
});
