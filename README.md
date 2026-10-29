# Wayfare – Trip & Route Planning App

A mobile trip planning application built with **React Native** and **Expo**, engineered to match the provided Figma design pixel-for-pixel with high attention to typography, spacing, navigation and user flow.

---

## 📱 Features & Screen Flow

1. **Login Screen (`LoginScreen`)**
   - Brand logo glyph with orange badge matching Figma.
   - Form fields for **Email** and **Password** with real-time validation (proper email syntax and minimum password length).
   - Show/hide password visibility toggle.
   - "Forgot password?" interaction.
   - Quick link to **Create Account** flow.

2. **Sign Up Screen (`SignUpScreen`)**
   - Complementary account creation flow matching the design system.
   - Full validation (name, email, password strength, password confirmation).

3. **Set Locations Screen (`SetLocationsScreen`)**
   - Interactive origin & destination card with custom timeline graphics (orange start node, vertical route connector line, dark destination node).
   - One-tap swap button to invert pickup and drop-off points.
   - Clear (`✕`) buttons on each input.
   - **Use Current Location**: Detects GPS position using `expo-location` and reverse-geocodes to a friendly address.
   - **Pick on Map**: Dedicated map pin placement screen (`MapPickerScreen`) where panning dynamically reverse-geocodes the pinned location.
   - **Suggested & Recent Places**: Interactive list populated with realistic data (Home, Marina Office Tower, Corniche, Msheireb Metro, Hamad Airport).
   - In-app address filtering and fallback to custom address lookup.
   - **Trip Ready Transition**: Primary "Next" action automatically enables once both points are specified.

4. **Route View Screen (`RouteViewScreen`)**
   - Map rendering via Leaflet inside `react-native-webview` with CARTO Voyager tiles (works immediately on all devices and APK builds without requiring a Google Maps API billing key).
   - Toggleable layer button (Standard vs. Satellite view).
   - Traffic indicator chip (*"Heavy traffic near the marina"*).
   - Route statistics (fastest route estimated duration, total distance, calculated ETA).
   - Multi-modal transport segmented selector (**Drive**, **Ride**, **Walk**) recalculating travel times dynamically.
   - Turn-by-turn navigation instruction cards with directional maneuver icons and segment distances.
   - **Live Navigation Simulation**: Tapping *"Start navigation"* animates a live navigation beacon along the actual road geometry.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: React Native 0.88 with Expo SDK 58 (TypeScript).
- **Navigation**: `@react-navigation/native-stack` with native screen transitions and typed navigation parameters.
- **State Management**: React Context (`TripContext`) providing a lightweight, maintainable global store for authentication, location choices, and travel mode preferences.
- **Routing Engine**: Real-time road routing using Open Source Routing Machine (OSRM) with an automatic offline fallback estimator to ensure seamless functionality offline.
- **Typography & Theme**: Google Fonts Nunito (`@expo-google-fonts/nunito`) paired with centralized design tokens (`src/theme/index.ts`).
- **Icons**: `@expo/vector-icons` (Feather & Material Community Icons).

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js (v18 or newer)
- npm or yarn
- Expo Go on an iOS or Android device, or an active Android Emulator / iOS Simulator

### Setup Instructions

1. **Install dependencies**:
   ```bash
   cd trip-planner
   npm install
   ```

2. **Start the Expo development server**:
   ```bash
   npm start
   ```

3. **Open on your device**:
   - Scan the terminal QR code with the **Expo Go** app (Android) or the **Camera** app (iOS).
   - Or press `a` in the terminal for the Android emulator, or `i` for the iOS simulator.

4. **Verify TypeScript compilation**:
   ```bash
   npx tsc --noEmit
   ```

---

## 📦 Building the Android APK

The project is pre-configured with `eas.json` for creating standalone APKs.

1. **Install EAS CLI**:
   ```bash
   npm install -g eas-cli
   ```

2. **Log in to Expo**:
   ```bash
   eas login
   ```

3. **Build the Standalone APK**:
   ```bash
   eas build --platform android --profile preview
   ```
   *EAS will generate a direct download link for the `.apk` file.*
