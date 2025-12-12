export const MIN_PASSWORD_LENGTH = 8;

export const getPasswordUpdateErrorKey = (
  password: string,
  confirmPassword: string
): string | null => {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return "auth:resetPassword.minLength";
  }
  if (password !== confirmPassword) {
    return "auth:resetPassword.mismatch";
  }
  return null;
};
