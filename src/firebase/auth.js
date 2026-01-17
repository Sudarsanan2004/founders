import {
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { auth } from './config';

/**
 * Sign in a user with email and password
 */
export const signInUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { user: userCredential.user, error: null };
    } catch (error) {
        console.error("Login error:", error.code, error.message);
        return { user: null, error: getAuthErrorMessage(error.code) };
    }
};


/**
 * Sign out the current user
 */
export const signOutUser = async () => {
    try {
        await signOut(auth);
        return { error: null };
    } catch (error) {
        console.error("Signout error:", error);
        return { error: error.message };
    }
};

/**
 * Helper to translate Firebase error codes into user-friendly messages
 */
const getAuthErrorMessage = (code) => {
    switch (code) {
        case 'auth/invalid-email':
            return 'Invalid email address format.';
        case 'auth/user-disabled':
            return 'This user account has been disabled.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password.';
        case 'auth/email-already-in-use':
            return 'An account already exists with this email.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/operation-not-allowed':
            return 'Email/Password sign-in is not enabled in Firebase Console.';
        case 'auth/invalid-credential':
            return 'Invalid login credentials.';
        default:
            return 'Authentication failed. Please try again.';
    }
};
