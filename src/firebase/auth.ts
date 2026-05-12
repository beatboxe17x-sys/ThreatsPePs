// Firebase Auth removed - app uses password-only login
// Stubs to prevent import errors

export function loginWithEmail(_email: string, _password: string) {
  return Promise.reject(new Error('Firebase Auth not configured'));
}

export function logoutFirebase() {
  return Promise.resolve();
}

export function onAuthChange(callback: (user: unknown) => void) {
  callback(null);
  return () => {};
}

export function getCurrentUser(): unknown {
  return null;
}
