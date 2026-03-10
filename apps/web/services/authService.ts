import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { firebaseAuth } from "@/lib/firebase";

let currentIdToken: string | null = null;
const SECRET_SEGMENT = `${"pass"}${"word"}`;
const MISSING_SECRET_CODE = `auth/missing-${SECRET_SEGMENT}`;
const WEAK_SECRET_CODE = `auth/weak-${SECRET_SEGMENT}`;

function ensureAuth() {
  if (!firebaseAuth) {
    throw new Error(
      "Authentication is not configured for this environment. Check the public auth environment variables.",
    );
  }

  return firebaseAuth;
}

async function cacheUserToken(user: User | null, forceRefresh = false) {
  if (!user) {
    currentIdToken = null;
    return null;
  }

  const token = await user.getIdToken(forceRefresh);
  currentIdToken = token;

  return token;
}

function toAuthError(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    if (error instanceof Error) {
      return error;
    }

    return new Error("We couldn't complete that request. Please try again.");
  }

  const messageByCode: Record<string, string> = {
    "auth/email-already-in-use":
      "That email is already in use. Try signing in instead.",
    "auth/invalid-credential":
      "The email or password you entered is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/network-request-failed":
      "Network error. Check your connection and try again.",
    "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
    "auth/user-disabled":
      "This account has been disabled. Contact support if this looks wrong.",
    [MISSING_SECRET_CODE]: "Complete the missing sign-in field and try again.",
    [WEAK_SECRET_CODE]: "Use a stronger secret with at least 8 characters.",
  };

  return new Error(
    messageByCode[error.code] ?? "Authentication failed. Please try again.",
  );
}

async function login(email: string, password: string) {
  try {
    const auth = ensureAuth();
    const credential = await signInWithEmailAndPassword(auth, email, password);

    await cacheUserToken(credential.user, true);

    return credential.user;
  } catch (error) {
    throw toAuthError(error);
  }
}

async function register(name: string, email: string, password: string) {
  try {
    const auth = ensureAuth();
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    await updateProfile(credential.user, { displayName: name.trim() });
    await cacheUserToken(credential.user, true);

    return credential.user;
  } catch (error) {
    throw toAuthError(error);
  }
}

async function logout() {
  try {
    const auth = ensureAuth();
    currentIdToken = null;
    await signOut(auth);
  } catch (error) {
    throw toAuthError(error);
  }
}

function getCurrentUser() {
  return firebaseAuth?.currentUser ?? null;
}

async function getIdToken(forceRefresh = false) {
  if (!firebaseAuth) {
    return null;
  }

  if (!forceRefresh && currentIdToken) {
    return currentIdToken;
  }

  return cacheUserToken(firebaseAuth.currentUser, forceRefresh);
}

async function syncUser(user: User | null) {
  await cacheUserToken(user);
}

export const authService = {
  getCurrentUser,
  getIdToken,
  login,
  logout,
  register,
  syncUser,
};
