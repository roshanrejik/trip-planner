import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { LocationField } from '../types';
import { LoginScreen } from '../screens/LoginScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { SetLocationsScreen } from '../screens/SetLocationsScreen';
import { MapPickerScreen } from '../screens/MapPickerScreen';
import { RouteViewScreen } from '../screens/RouteViewScreen';
import { colors } from '../theme';

/** Typed route params – gives autocomplete + compile-time checks for navigate() calls. */
export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  SetLocations: undefined;
  MapPicker: { field: LocationField };
  RouteView: undefined;
};

export type ScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Flow: Login (→ SignUp) → SetLocations (→ MapPicker modal) → RouteView.
 * "Trip ready" from the Figma is the SetLocations state once both points are chosen.
 */
export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="SetLocations" component={SetLocationsScreen} />
        <Stack.Screen
          name="MapPicker"
          component={MapPickerScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'fullScreenModal' }}
        />
        <Stack.Screen name="RouteView" component={RouteViewScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
