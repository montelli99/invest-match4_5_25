import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FirebaseError, initializeApp } from "firebase/app";
import { useNavigate } from "react-router-dom";
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import React, { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Brain } from "../brain/Brain";
import { API_PATH } from "../constants";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdUa96vZOEmnKmVn8dbGdvSOFvNT1yrj0",
  authDomain: "investmatch-d2a26.firebaseapp.com",
  projectId: "investmatch-d2a26",
  storageBucket: "investmatch-d2a26.firebasestorage.app",
  messagingSenderId: "7727467657",
  appId: "1:7727467657:web:a9ab5fb00ecb8911cf4a58",
  measurementId: "G-5QTK40Q5GH"
};

const provider = new GoogleAuthProvider();
provider.addScope("https://www.googleapis.com/auth/userinfo.profile");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore();

const signInWithGoogle = async (setIsGoogleSigningIn: (value: boolean) => void): Promise<User | null> => {
  if (!auth) return null;

  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: unknown) {
    // Ignore errors when user closes login window
    const shouldIgnoreError =
      error instanceof FirebaseError &&
      ["auth/popup-closed-by-user", "auth/cancelled-popup-request"].includes(
        (error as FirebaseError).code,
      );

    if (shouldIgnoreError) {
      return null;
    }

    throw error;
  }
};

export interface Props {
  onAuthSuccess?: () => void;
  initialMode?: 'signin' | 'signup';
  children: React.ReactNode;
  title?: string;
  google?: boolean;
  email?: boolean;
}

interface FormData {
  name: string;
  email: string;
  password?: string;
  userType: 'fund_manager' | 'limited_partner' | 'capital_raiser' | 'fund_of_funds';
}

export const AuthWrapper = ({
  children,
  google = true,
  email = true,
  title = "Welcome",
  initialMode = 'signup',
  onAuthSuccess,
}: Props) => {
  const user = useLoggedInUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
      name: "",
      userType: 'fund_manager',
    },
  });
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string>("");
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const navigate = useNavigate();

  const showDivider = google && email;

  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    number: false,
    uppercase: false,
  });

  const checkPasswordRequirements = (password: string) => {
    setPasswordRequirements({
      length: password.length >= 8,
      number: /\d/.test(password),
      uppercase: /[A-Z]/.test(password),
    });
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    // Validate password requirements for signup
    if (mode === 'signup') {
      const password = data.password;
      if (password.length < 8 || !/\d/.test(password) || !/[A-Z]/.test(password)) {
        setError("Please ensure your password meets all requirements");
        return;
      }
    }
    setIsSigningIn(true);
    setError("");
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth!, data.email, data.password);
        // Update user profile with name if provided
        if (userCredential.user && data.name) {
          try {
            await updateProfile(userCredential.user, {
              displayName: data.name
            });
          } catch (error) {
            console.error('Failed to update display name:', error);
          }
        }
        // Call onAuthSuccess after successful signup
        onAuthSuccess?.();
      } else {
        await signInWithEmailAndPassword(auth!, data.email, data.password);
        // Call onAuthSuccess after successful signin
        onAuthSuccess?.();
      }
      reset();
    } catch (err: unknown) {
      console.error(err);
      const errorMessage = err instanceof FirebaseError
        ? err.code === 'auth/email-already-in-use'
          ? "This email is already registered. Please sign in instead."
          : err.code === 'auth/invalid-email'
            ? "Please enter a valid email address."
            : err.code === 'auth/weak-password'
              ? "Please choose a stronger password."
              : err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
                ? "Invalid email or password."
                : "An error occurred. Please try again."
        : "An unexpected error occurred. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5" />
        <div className="absolute right-1/4 bottom-0 w-[400px] h-[400px] rounded-full bg-accent/5" />
      </div>
      <div className="flex flex-col gap-8 w-full max-w-md bg-card/95 p-8 rounded-xl shadow-lg border border-muted/40 backdrop-blur-sm relative overflow-hidden">
        {/* Decorative corner elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-bl-xl" />
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{title}</h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'signup'
              ? "Create your account to get started"
              : "Welcome back! Please sign in to continue"}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {mode === 'signup' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  className="bg-background/50 border-border/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  {...register("name", {
                    required: "Please enter your name",
                  })}
                  placeholder="John Doe"
                  type="text"
                />
                {errors.name?.message && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">I am a</Label>
                <Select defaultValue="fund_manager" {...register("userType", { required: "Please select your role" })}>
                  <SelectTrigger className="bg-background/50 border-border/50">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fund_manager">Fund Manager</SelectItem>
                    <SelectItem value="limited_partner">Limited Partner</SelectItem>
                    <SelectItem value="capital_raiser">Capital Raiser</SelectItem>
                    <SelectItem value="fund_of_funds">Fund of Funds</SelectItem>
                  </SelectContent>
                </Select>
                {errors.userType?.message && (
                  <p className="text-sm text-destructive">
                    {errors.userType.message}
                  </p>
                )}
              </div>
            </div>
          )}
          {email && (
            <form
              className="flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  className="bg-background/50 border-border/50"
                  {...register("email", {
                    validate: {
                      isValidEmail: (it) => {
                        if (/^\S+@\S+\.\S+$/i.test(it)) {
                          return true;
                        }
                        return "Please enter a valid email address";
                      },
                      required: (it) =>
                        it.length > 0 ? true : "This field is required.",
                    },
                  })}
                  placeholder="email@example.com"
                  type="email"
                />
                {errors.email?.message && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  className="bg-background/50 border-border/50"
                  {...register("password", {
                    validate: {
                      isOkPassword: (it) => {
                        if (mode === 'signin') return true;
                        if (it.length < 8) return "Password must be at least 8 characters";
                        if (!/\d/.test(it)) return "Password must contain at least one number";
                        if (!/[A-Z]/.test(it)) return "Password must contain at least one uppercase letter";
                        return true;
                      },
                      required: (it) =>
                        it.length > 0 ? true : "This field is required.",
                    },
                  })}
                  placeholder="Enter your password"
                  onChange={(e) => checkPasswordRequirements(e.target.value)}
                  type="password"
                />
                {mode === 'signup' && (
                  <div className="space-y-2 text-sm bg-background/50 p-4 rounded-lg border border-border/50 shadow-sm">
                    <p className="text-muted-foreground">Password requirements:</p>
                    <ul className="space-y-1">
                      <li className={passwordRequirements.length ? "text-primary" : "text-destructive"}>
                        • At least 8 characters
                      </li>
                      <li className={passwordRequirements.number ? "text-primary" : "text-destructive"}>
                        • At least one number
                      </li>
                      <li className={passwordRequirements.uppercase ? "text-primary" : "text-destructive"}>
                        • At least one uppercase letter
                      </li>
                    </ul>
                  </div>
                )}
                {errors.password?.message && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button
                type="submit"
                disabled={isSigningIn}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
                {isSigningIn ? "Please wait..." : mode === 'signup' ? "Create Account" : "Sign In"}
              </Button>
              <p className="text-sm text-center text-muted-foreground mt-4">
                {mode === 'signup' ? "Already have an account? " : "Don't have an account? "}
                <button
                  type="button"
                  className="text-primary hover:text-accent font-medium transition-colors"
                  onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}
                >
                  {mode === 'signup' ? "Sign in" : "Create one"}
                </button>
              </p>
            </form>
          )}

          {showDivider && (
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
          )}

          {google && (
            <Button
              type="button"
              variant="outline" className="relative flex items-center justify-center gap-2 hover:bg-accent/5 border-border/50 hover:border-border transition-colors group"
              onClick={async () => {
                setIsGoogleSigningIn(true);
                try {
                  const user = await signInWithGoogle(setIsGoogleSigningIn);
                  if (user) {
                    // Call onAuthSuccess after successful Google signin
                    onAuthSuccess?.();
                  }
                } catch (error) {
                  setError("Could not sign in with Google. Please try again.");
                } finally {
                  setIsGoogleSigningIn(false);
                }
              }}
              disabled={isGoogleSigningIn}
            >
              {
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  {isGoogleSigningIn ? "Signing in..." : "Continue with Google"}
                </>
              }
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

interface FirebaseClaims {
  admin?: boolean;
  [key: string]: any;
}

export const useAuth = () => {

  const [claims, setClaims] = useState<FirebaseClaims | null>(null);
  const user = useLoggedInUser();

  useEffect(() => {
    const loadClaims = async () => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult();
        setClaims(idTokenResult.claims);
      } else {
        setClaims(null);
      }
    };
    loadClaims();
  }, [user]);

  return { user, claims };
};

export const useLoggedInUser = (): User | null => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) {
      console.error(
        "Firebase Auth service is not initialized.\nCheck out https://docs.databutton.com/databutton-tips-and-tricks/adding-authentication",
      );
      return;
    }

    const unsubscribe = auth?.onAuthStateChanged((user: User | null) => {
      setUser(user);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return user;
};

export const signOut = async (): Promise<void> => {
  if (auth) {
    await firebaseSignOut(auth);
  } else {
    console.error("Sign out failed: Firebase Auth service is not initialized.");
  }
};

const isLocalhost = /localhost:\d{4}/i.test(window.location.origin);

const baseUrl = isLocalhost
  ? `${window.location.origin}${API_PATH}`
  : `https://api.databutton.com${API_PATH}`;

export const authedBrain = new Brain({
  baseUrl,
  baseApiParams: {
    credentials: "include",
    secure: true,
  },
  securityWorker: async () => {
    if (!auth || !auth.currentUser) {
      console.error("No authentication token available.");
      return {};
    }
    const idToken = await auth.currentUser.getIdToken();
    return {
      headers: {
        "x-authorization": `Bearer ${idToken}`,
      },
    };
  },
});

export { app, db, auth };
