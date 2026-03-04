import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // Create user document
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        baseCurrency: "USD",
        financialHealthScore: 0,
        createdAt: new Date(),
      });
    }

    return user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

export const subscribeToAuthChanges = (
  callback: (user: User | null) => void,
) => {
  return onAuthStateChanged(auth, callback);
};

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string,
) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    await updateProfile(user, { displayName });

    // Create user document in Firestore
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
      uid: user.uid,
      displayName: displayName,
      email: user.email,
      baseCurrency: "USD",
      financialHealthScore: 0,
      createdAt: new Date(),
    });

    return user;
  } catch (error) {
    console.error("Error signing up with email", error);
    throw error;
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error) {
    console.error("Error signing in with email", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email", error);
    throw error;
  }
};
