import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { ActionTile } from '../components/ActionTile';
import { BottomBar } from '../components/BottomBar';
import { LocationInputCard } from '../components/LocationInputCard';
import { PlaceRow } from '../components/PlaceRow';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenHeader } from '../components/ScreenHeader';
import { useTrip } from '../context/TripContext';
import { searchPlaces } from '../data/places';
import type { ScreenProps } from '../navigation/RootNavigator';
import { geocodeAddress, getCurrentPlace } from '../services/location';
import { LocationField, Place } from '../types';
import { colors, fonts, radius, shadow, spacing } from '../theme';

/** Free text the user is typing per field. `null` = show the selected place's name instead. */
type Drafts = Record<LocationField, string | null>;

/**
 * Step 1 – choose pickup and drop-off.
 * Covers two Figma frames: "Set locations" (empty) and "Trip ready" (both chosen → Next enabled).
 */
export function SetLocationsScreen({ navigation }: ScreenProps<'SetLocations'>) {
  const { pickup, dropoff, setLocation, swapLocations } = useTrip();
  const [activeField, setActiveField] = useState<LocationField>(pickup && !dropoff ? 'dropoff' : 'pickup');
  const [drafts, setDrafts] = useState<Drafts>({ pickup: null, dropoff: null });
  const [busy, setBusy] = useState<'current' | 'search' | null>(null);

  const inputRefs: Record<LocationField, React.RefObject<any>> = {
    pickup: useRef<any>(null),
    dropoff: useRef<any>(null),
  };
  const selected: Record<LocationField, Place | null> = { pickup, dropoff };

  // When a place is set from elsewhere (map picker / swap), drop any stale draft text.
  useEffect(() => setDrafts((d) => (pickup ? { ...d, pickup: null } : d)), [pickup]);
  useEffect(() => setDrafts((d) => (dropoff ? { ...d, dropoff: null } : d)), [dropoff]);

  const displayValue = (field: LocationField) => drafts[field] ?? selected[field]?.name ?? '';
  const query = drafts[activeField] ?? '';
  const otherField: LocationField = activeField === 'pickup' ? 'dropoff' : 'pickup';

  // Filter suggestions by the typed text, and hide the place already used by the other field.
  const suggestions = useMemo(
    () => searchPlaces(query).filter((p) => p.id !== selected[otherField]?.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, otherField, pickup, dropoff],
  );

  const choosePlace = (place: Place, field: LocationField = activeField) => {
    setLocation(field, place);
    setDrafts((d) => ({ ...d, [field]: null }));
    const other = field === 'pickup' ? dropoff : pickup;
    if (!other) {
      // Guide the user to the next empty field.
      const next = field === 'pickup' ? 'dropoff' : 'pickup';
      setActiveField(next);
      inputRefs[next].current?.focus();
    } else {
      Keyboard.dismiss();
    }
  };

  const handleChangeText = (field: LocationField, text: string) => {
    setDrafts((d) => ({ ...d, [field]: text }));
    if (selected[field]) setLocation(field, null); // editing invalidates the selection
  };

  const handleClear = (field: LocationField) => {
    setDrafts((d) => ({ ...d, [field]: null }));
    setLocation(field, null);
    setActiveField(field);
    inputRefs[field].current?.focus();
  };

  const handleSwap = () => {
    setDrafts((d) => ({ pickup: d.dropoff, dropoff: d.pickup }));
    swapLocations();
  };

  const handleUseCurrent = async () => {
    setBusy('current');
    try {
      choosePlace(await getCurrentPlace());
    } catch (e) {
      Alert.alert('Location unavailable', (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  /** Search key / "Search address" row: geocode free text into a custom place. */
  const handleCustomAddress = async (field: LocationField = activeField) => {
    const text = (drafts[field] ?? '').trim();
    if (text.length < 3) return;
    const match = searchPlaces(text)[0];
    if (match) return choosePlace(match, field);
    setBusy('search');
    try {
      choosePlace(await geocodeAddress(text), field);
    } catch (e) {
      Alert.alert('Address not found', (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const canContinue = !!pickup && !!dropoff;

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Where are you going?"
        subtitle="Step 1 of 2 · Set pickup and drop-off"
        onBack={navigation.goBack}
      />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <LocationInputCard
          pickup={{
            label: 'Pickup',
            placeholder: 'Choose a starting point',
            value: displayValue('pickup'),
            inputRef: inputRefs.pickup,
          }}
          dropoff={{
            label: 'Drop-off',
            placeholder: 'Choose a destination',
            value: displayValue('dropoff'),
            inputRef: inputRefs.dropoff,
          }}
          activeField={activeField}
          onFocusField={setActiveField}
          onChangeText={handleChangeText}
          onClear={handleClear}
          onSubmit={handleCustomAddress}
          onSwap={handleSwap}
        />

        <View style={styles.actions}>
          <ActionTile
            testID="use-current"
            icon="crosshair"
            label={busy === 'current' ? 'Locating…' : 'Use current'}
            onPress={handleUseCurrent}
          />
          <ActionTile
            testID="pick-on-map"
            icon="map"
            label="Pick on map"
            onPress={() => navigation.navigate('MapPicker', { field: activeField })}
          />
        </View>

        <Text style={styles.sectionLabel}>
          {activeField === 'pickup' ? 'Set as pickup' : 'Set as drop-off'}
        </Text>

        {suggestions.length > 0 ? (
          <View style={styles.list}>
            {suggestions.map((place, i) => (
              <PlaceRow
                key={place.id}
                place={place}
                onPress={choosePlace}
                showDivider={i < suggestions.length - 1}
              />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              No saved places match that. Keep typing to use it as a custom address.
            </Text>
            {query.trim().length >= 3 && (
              <Pressable
                onPress={() => handleCustomAddress()}
                style={({ pressed }) => [styles.searchRow, pressed && { opacity: 0.7 }]}
                accessibilityRole="button"
              >
                {busy === 'search' ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Feather name="search" size={16} color={colors.primary} />
                )}
                <Text style={styles.searchText} numberOfLines={1}>
                  Use “{query.trim()}”
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>

      <BottomBar>
        <PrimaryButton
          testID="next-button"
          title="Next"
          disabled={!canContinue}
          onPress={() => navigation.navigate('RouteView')}
        />
      </BottomBar>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  sectionLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.subtle,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadow.card,
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 21,
    color: colors.muted,
    textAlign: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.lg,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    maxWidth: '100%',
  },
  searchText: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary, flexShrink: 1 },
});
