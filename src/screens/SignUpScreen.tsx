import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { BottomBar } from '../components/BottomBar';
import { PrimaryButton } from '../components/PrimaryButton';
import { TextField } from '../components/TextField';
import { useTrip } from '../context/TripContext';
import type { ScreenProps } from '../navigation/RootNavigator';
import { colors, fonts, spacing } from '../theme';
import {
  MIN_PASSWORD_LENGTH,
  validateEmail,
  validateName,
  validatePassword,
  validatePasswordMatch,
} from '../utils/validation';

type Form = { name: string; email: string; password: string; confirm: string };
type Errors = Partial<Record<keyof Form, string>>;

const validateForm = (f: Form): Errors => ({
  name: validateName(f.name),
  email: validateEmail(f.email),
  password: validatePassword(f.password),
  confirm: validatePasswordMatch(f.password, f.confirm),
});

/** "Create an account" – not in the Figma, so it reuses the Login screen's components and styling. */
export function SignUpScreen({ navigation }: ScreenProps<'SignUp'>) {
  const insets = useSafeAreaInsets();
  const { signIn } = useTrip();
  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const confirmRef = useRef<any>(null);

  const [form, setForm] = useState<Form>({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof Form) => (value: string) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (submitted) setErrors(validateForm(next));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const result = validateForm(form);
    setErrors(result);
    if (Object.values(result).some(Boolean)) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      signIn(form.email.trim());
      // Replace so "back" from Set Locations returns to Login, not the sign-up form.
      navigation.replace('SetLocations');
    }, 700);
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={navigation.goBack}
          hitSlop={12}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="chevron-left" size={26} color={colors.ink} />
        </Pressable>

        <Text style={styles.title} accessibilityRole="header">
          Create account
        </Text>
        <Text style={styles.subtitle}>Join Wayfare to save places and plan trips in seconds.</Text>

        <View style={styles.form}>
          <TextField
            label="Full name"
            icon="user"
            placeholder="Your name"
            value={form.name}
            onChangeText={update('name')}
            error={errors.name}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
            submitBehavior="submit"
          />
          <TextField
            ref={emailRef}
            label="Email"
            icon="mail"
            placeholder="you@example.com"
            value={form.email}
            onChangeText={update('email')}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            submitBehavior="submit"
          />
          <TextField
            ref={passwordRef}
            label="Password"
            icon="lock"
            placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
            value={form.password}
            onChangeText={update('password')}
            error={errors.password}
            secureToggle
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => confirmRef.current?.focus()}
            submitBehavior="submit"
          />
          <TextField
            ref={confirmRef}
            label="Confirm password"
            icon="lock"
            placeholder="Re-enter your password"
            value={form.confirm}
            onChangeText={update('confirm')}
            error={errors.confirm}
            secureToggle
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
          />
        </View>
      </ScrollView>

      <BottomBar>
        <PrimaryButton title="Create account" onPress={handleSubmit} loading={loading} />
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Pressable onPress={navigation.goBack} hitSlop={8} accessibilityRole="link">
            <Text style={styles.loginLink}>Log in</Text>
          </Pressable>
        </View>
      </BottomBar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxl },
  back: { alignSelf: 'flex-start', marginLeft: -6, marginBottom: spacing.lg },
  title: { fontFamily: fonts.extrabold, fontSize: 32, color: colors.ink },
  subtitle: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22, color: colors.muted, marginTop: spacing.sm },
  form: { marginTop: spacing.xxl },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  loginText: { fontFamily: fonts.medium, fontSize: 14, color: colors.muted },
  loginLink: { fontFamily: fonts.bold, fontSize: 14, color: colors.ink },
});
