import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomBar } from '../components/BottomBar';
import { MapButton, TrafficChip } from '../components/MapOverlays';
import { PrimaryButton } from '../components/PrimaryButton';
import { RouteStepRow } from '../components/RouteStepRow';
import { SegmentedControl } from '../components/SegmentedControl';
import { TripSummary } from '../components/TripSummary';
import { MapStyle, RouteMap } from '../components/map/RouteMap';
import { useTrip } from '../context/TripContext';
import { shortLabel } from '../data/places';
import { useRoute } from '../hooks/useRoute';
import type { ScreenProps } from '../navigation/RootNavigator';
import { LatLng, TravelMode } from '../types';
import { colors, fonts, radius, shadow, spacing } from '../theme';
import { arrivalTime, durationForMode, formatDistance, formatDuration } from '../utils/format';
import { cumulativeDistances, pointAlong } from '../utils/geo';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = Math.round(SCREEN_HEIGHT * 0.44);

const MODE_OPTIONS = [
  { value: 'drive' as const, label: 'Drive' },
  { value: 'ride' as const, label: 'Ride' },
  { value: 'walk' as const, label: 'Walk' },
];

export function RouteViewScreen({ navigation }: ScreenProps<'RouteView'>) {
  const insets = useSafeAreaInsets();
  const { pickup, dropoff, mode, setMode } = useTrip();
  const { route, loading, retry } = useRoute(pickup, dropoff);

  const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
  const [navigating, setNavigating] = useState(false);
  const [carPos, setCarPos] = useState<LatLng | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Cumulative distances along route geometry for car animation
  const cumulative = useMemo(
    () => (route ? cumulativeDistances(route.geometry) : []),
    [route],
  );

  // Simulated navigation playback along the route
  useEffect(() => {
    if (!navigating || !route || route.geometry.length < 2) return;
    const totalDist = cumulative[cumulative.length - 1];
    let travelled = 0;
    // Step forward every 250ms
    const stepMeters = Math.max(30, totalDist / 80);
    const interval = setInterval(() => {
      travelled += stepMeters;
      if (travelled >= totalDist) {
        setCarPos(route.geometry[route.geometry.length - 1]);
        clearInterval(interval);
        setNavigating(false);
        return;
      }
      setCarPos(pointAlong(route.geometry, cumulative, travelled));
    }, 250);

    return () => clearInterval(interval);
  }, [navigating, route, cumulative]);

  const toggleMapStyle = () => {
    setMapStyle((s) => (s === 'standard' ? 'satellite' : 'standard'));
  };

  const handleStartNavigation = () => {
    if (navigating) {
      setNavigating(false);
      setCarPos(null);
    } else {
      setNavigating(true);
      if (route?.geometry[0]) setCarPos(route.geometry[0]);
    }
  };

  const driveSec = route?.durationSeconds ?? 1440;
  const distM = route?.distanceMeters ?? 9600;
  const activeDurationSec = durationForMode(mode, driveSec, distM);

  return (
    <View style={styles.screen}>
      {/* Upper Half: Map Interface */}
      <View style={[styles.mapContainer, { height: MAP_HEIGHT }]}>
        <RouteMap
          style={StyleSheet.absoluteFill}
          mapStyle={mapStyle}
          route={route?.geometry}
          start={pickup?.coords}
          end={dropoff?.coords}
          car={carPos}
          followCar={navigating}
          padding={{ top: 70, right: 40, bottom: 40, left: 40 }}
        />

        {/* Floating Top Nav (Back & Layer Toggle) */}
        <View style={[styles.topControls, { top: insets.top + spacing.sm }]}>
          <MapButton icon="chevron-left" label="Go back" onPress={navigation.goBack} />
          <MapButton
            icon="layers"
            label="Toggle satellite view"
            active={mapStyle === 'satellite'}
            onPress={toggleMapStyle}
          />
        </View>

        {/* Traffic Alert Badge / Chip */}
        {!!route?.trafficNote && (
          <View style={styles.trafficWrap}>
            <TrafficChip text={route.trafficNote} />
          </View>
        )}
      </View>

      {/* Lower Half: Route Sheet & Turn-by-Turn Card */}
      <View style={styles.sheet}>
        <View style={styles.handle} />

        <ScrollView
          style={styles.sheetScroll}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Calculating best route…</Text>
            </View>
          ) : (
            <>
              {/* Route Summary Header */}
              <View style={styles.summaryHeader}>
                <View>
                  <Text style={styles.routeTypeLabel}>Fastest route</Text>
                  <Text style={styles.durationBig}>{formatDuration(activeDurationSec)}</Text>
                </View>
                <View style={styles.metaRight}>
                  <Text style={styles.metaText}>
                    {formatDistance(distM)} · arrive {arrivalTime(activeDurationSec)}
                  </Text>
                </View>
              </View>

              {/* Mode Segmented Control (Drive / Ride / Walk) */}
              <View style={styles.modeSection}>
                <SegmentedControl
                  options={MODE_OPTIONS}
                  value={mode}
                  onChange={(m) => setMode(m as TravelMode)}
                />
              </View>

              {/* Start & Destination Pill Card */}
              {pickup && dropoff && (
                <View style={styles.summaryCardWrap}>
                  <TripSummary from={shortLabel(pickup)} to={shortLabel(dropoff)} />
                </View>
              )}

              {/* Turn by Turn Directions */}
              {route?.steps && route.steps.length > 0 && (
                <View style={styles.stepsSection}>
                  <Text style={styles.stepsLabel}>Turn by turn</Text>
                  <View style={styles.stepsList}>
                    {route.steps.slice(0, 4).map((step, idx) => (
                      <RouteStepRow
                        key={idx}
                        step={step}
                        showDivider={idx < Math.min(route.steps.length, 4) - 1}
                      />
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </ScrollView>

        {/* Primary Action Button */}
        <BottomBar>
          <PrimaryButton
            testID="start-navigation-button"
            icon={navigating ? 'square' : 'navigation'}
            title={navigating ? 'Stop navigation' : 'Start navigation'}
            onPress={handleStartNavigation}
            disabled={loading}
          />
        </BottomBar>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  mapContainer: { width: '100%', position: 'relative' },
  topControls: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  trafficWrap: {
    position: 'absolute',
    bottom: spacing.lg + 10,
    left: spacing.lg,
    zIndex: 10,
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -20,
    overflow: 'hidden',
    ...shadow.floating,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetScroll: { flex: 1 },
  sheetContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  loadingBox: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.muted,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.lg,
  },
  routeTypeLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.muted,
    marginBottom: 2,
  },
  durationBig: {
    fontFamily: fonts.extrabold,
    fontSize: 34,
    color: colors.ink,
    lineHeight: 40,
  },
  metaRight: {
    paddingBottom: 4,
  },
  metaText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.muted,
  },
  modeSection: {
    marginBottom: spacing.lg,
  },
  summaryCardWrap: {
    marginBottom: spacing.xl,
  },
  stepsSection: {
    marginBottom: spacing.lg,
  },
  stepsLabel: {
    fontFamily: fonts.bold,
    fontSize: 13,
    color: colors.subtle,
    marginBottom: spacing.sm,
  },
  stepsList: {
    paddingTop: spacing.xs,
  },
});
