import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import WebView, { WebViewMessageEvent } from 'react-native-webview';
import { LatLng } from '../../types';
import { colors } from '../../theme';
import { MAP_HTML } from './mapHtml';

export type MapStyle = 'standard' | 'satellite';

type Props = {
  style?: StyleProp<ViewStyle>;
  mapStyle?: MapStyle;
  /** Route polyline + endpoints. */
  route?: LatLng[];
  start?: LatLng | null;
  end?: LatLng | null;
  /** Live position marker used while navigating. */
  car?: LatLng | null;
  followCar?: boolean;
  /** Initial centre when no route is shown (map picker). */
  initialCenter?: LatLng;
  /** Extra padding (px) so the route isn't hidden behind overlays. */
  padding?: { top: number; right: number; bottom: number; left: number };
  onCenterChange?: (center: LatLng) => void;
};

const toPair = (p: LatLng) => [p.latitude, p.longitude];

/**
 * Declarative React wrapper around the Leaflet WebView: props changes are
 * translated into `window.app.*` calls once the page reports it's ready.
 */
export function RouteMap({
  style,
  mapStyle = 'standard',
  route,
  start,
  end,
  car,
  followCar,
  initialCenter,
  padding,
  onCenterChange,
}: Props) {
  const webRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  const run = useCallback((js: string) => {
    webRef.current?.injectJavaScript(`try { ${js} } catch (e) {} true;`);
  }, []);

  const onMessage = useCallback(
    (e: WebViewMessageEvent) => {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'ready') setReady(true);
      if (msg.type === 'center') onCenterChange?.({ latitude: msg.latitude, longitude: msg.longitude });
    },
    [onCenterChange],
  );

  useEffect(() => {
    if (ready && initialCenter)
      run(`window.app.setCenter(${initialCenter.latitude}, ${initialCenter.longitude}, 15);`);
  }, [ready]);

  useEffect(() => {
    if (ready && padding) run(`window.app.setPadding(${JSON.stringify(padding)});`);
  }, [ready, padding, run]);

  useEffect(() => {
    if (ready) run(`window.app.setStyle(${JSON.stringify(mapStyle)});`);
  }, [ready, mapStyle, run]);

  useEffect(() => {
    if (!ready || (!route && !start && !end)) return;
    const payload = [
      JSON.stringify((route ?? []).map(toPair)),
      JSON.stringify(start ? toPair(start) : null),
      JSON.stringify(end ? toPair(end) : null),
    ].join(',');
    run(`window.app.setRoute(${payload});`);
  }, [ready, route, start, end, run]);

  useEffect(() => {
    if (!ready) return;
    if (car) run(`window.app.setCar(${car.latitude}, ${car.longitude}, ${!!followCar});`);
    else {
      run('window.app.setCar(null);');
      if (route) run('window.app.fit();');
    }
  }, [ready, car, followCar, route, run]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webRef}
        source={{ html: MAP_HTML, baseUrl: 'https://wayfare.local/' }}
        originWhitelist={['*']}
        onMessage={onMessage}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        overScrollMode="never"
        setBuiltInZoomControls={false}
        style={styles.webview}
      />
      {!ready && (
        <View style={styles.loader} pointerEvents="none">
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: '#EFE9DC' },
  webview: { flex: 1, backgroundColor: 'transparent' },
  loader: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

