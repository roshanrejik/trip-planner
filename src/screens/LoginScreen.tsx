import React, { useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppLogo } from '../components/AppLogo';
import { BottomBar } from '../components/BottomBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useTrip } from '../context/TripContext';
import type { ScreenProps } from '../navigation/RootNavigator';
import { colors, fonts, spacing } from '../theme';
import { validateEmail, validatePassword } from '../utils/validation';

type Errors = { email?: string; password?: string };

export function LoginScreen({ navigation }: ScreenProps<'Login'>) {
  const insets = useSafeAreaInsets();
  const { signIn } = useTrip();
  const passwordRef = useRef<any>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  // Only show errors live after the first submit attempt, so users aren't nagged while typing.
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = (e = email, p = password): Errors => ({
    email: validateEmail(e),
    password: validatePassword(p),
  });

  const handleLogin = () => {
    setSubmitted(true);
    const result = validate();
    setErrors(result);
    if (result.email || result.password) return;

    // Mock authentication – no backend required for this assignment.
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      signIn(email.trim());
      setPassword('');
      setSubmitted(false);
      navigation.navigate('SetLocations');
    }, 700);
  };

  const handleForgot = () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setErrors((prev) => ({ ...prev, email: 'Enter your email above to reset your password' }));
      return;
    }
    Alert.alert('Check your inbox', `We've sent a password reset link to ${email.trim()}.`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <AppLogo />
        <Text style={styles.title} accessibilityRole="header">
          Welcome back
        </Text>
        <Text style={styles.subtitle}>Log in to plan a trip and follow your route turn by turn.</Text>

        <View style={styles.form}>
          <TextField
            testID="email-input"
            label="Email"
            icon="mail"
            placeholder="you@example.com"
            value={email}
            onChangeText={(t) => {
              setEmail(t);
              if (submitted) setErrors(validate(t, password));
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            submitBehavior="submit"
          />
          <TextField
            testID="password-input"
            ref={passwordRef}
            label="Password"
            icon="lock"
            placeholder="Enter your password"
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (submitted) setErrors(validate(email, t));
            }}
            error={errors.password}
            secureToggle
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <Pressable onPress={handleForgot} hitSlop={8} style={styles.forgot} accessibilityRole="link">
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomBar>
        <PrimaryButton testID="login-button" title="Log in" onPress={handleLogin} loading={loading} />
        <View style={styles.signupRow}>
          <Text style={styles.signupText}>New to Wayfare? </Text>
          <Pressable onPress={() => navigation.navigate('SignUp')} hitSlop={8} accessibilityRole="link">
            <Text style={styles.signupLink}>Create an account</Text>
          </Pressable>
        </View>
      </BottomBar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 32,
    color: colors.ink,
    marginTop: spacing.xxl,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  form: { marginTop: spacing.xxxl },
  forgot: { alignSelf: 'flex-start', marginTop: -2 },
  forgotText: { fontFamily: fonts.bold, fontSize: 14, color: colors.primary },
  signupRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  signupText: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
  signupLink: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
});
