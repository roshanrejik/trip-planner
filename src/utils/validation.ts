const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const MIN_PASSWORD_LENGTH = 6;

/** Each validator returns an error message, or undefined when the value is valid. */
export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return 'Email is required';
  if (!EMAIL_REGEX.test(email)) return 'Enter a valid email address';
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required';
  if (value.length < MIN_PASSWORD_LENGTH)
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  return undefined;
}

export function validateName(value: string): string | undefined {
  if (!value.trim()) return 'Name is required';
  if (value.trim().length < 2) return 'Name looks too short';
  return undefined;
}

export function validatePasswordMatch(password: string, confirm: string): string | undefined {
  if (!confirm) return 'Please confirm your password';
  if (password !== confirm) return 'Passwords do not match';
  return undefined;
}
