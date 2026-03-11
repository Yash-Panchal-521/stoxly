import {
  confirmPasswordReset as firebaseConfirmPasswordReset,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export interface AuthResult {
  readonly user: User | null;
  readonly error: string | null;
}

function toAuthResult(user: User): AuthResult {
  return { user, error: null };
}

function toAuthError(err: unknown): AuthResult {
  const message =
    err instanceof Error ? err.message : "An unexpected error occurred";
  return { user: null, error: message };
}

export async function registerWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    return toAuthResult(credential.user);
  } catch (err) {
    return toAuthError(err);
  }
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return toAuthResult(credential.user);
  } catch (err) {
    return toAuthError(err);
  }
}

export async function loginWithGoogle(): Promise<AuthResult> {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    return toAuthResult(credential.user);
  } catch (err) {
    return toAuthError(err);
  }
}

export async function logout(): Promise<{ error: string | null }> {
  try {
    await signOut(auth);
    return { error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return { error: message };
  }
}

export interface ResetPasswordResult {
  readonly success: boolean;
  readonly error: string | null;
}

export async function resetPassword(
  email: string,
): Promise<ResetPasswordResult> {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
    return { success: true, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

export async function confirmPasswordReset(
  oobCode: string,
  newPassword: string,
): Promise<ResetPasswordResult> {
  try {
    await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
    return { success: true, error: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return { success: false, error: message };
  }
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}
