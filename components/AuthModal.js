"use client";

import { useState } from "react";
import { useAppState } from "@/app/providers/AppStateProvider";

export default function AuthModal({ isOpen, onClose }) {
  const { signIn, signOut, user, isLoading, authError } = useAppState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [localError, setLocalError] = useState("");

  if (!isOpen) {
    return null;
  }

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLocalError("");
    setIsSigningIn(true);

    if (!email || !password) {
      setLocalError("Email and password are required.");
      setIsSigningIn(false);
      return;
    }

    const { error } = await signIn(email, password);
    setIsSigningIn(false);

    if (error) {
      setLocalError(error.message || "Sign in failed.");
      return;
    }

    setEmail("");
    setPassword("");
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} type="button">
          ✕
        </button>

        {user ? (
          <div className="auth-signed-in">
            <h2>Signed in</h2>
            <p className="auth-user-email">{user.email}</p>
            <button
              className="auth-button auth-button-danger"
              onClick={handleSignOut}
              type="button"
            >
              Sign out
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSignIn}>
            <h2>Admin login</h2>

            <div className="auth-form-group">
              <label htmlFor="auth-email">Email</label>
              <input
                id="auth-email"
                type="email"
                placeholder="researcher@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSigningIn || isLoading}
              />
            </div>

            <div className="auth-form-group">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSigningIn || isLoading}
              />
            </div>

            {(localError || authError) && (
              <p className="auth-error">{localError || authError}</p>
            )}

            <button
              className="auth-button"
              type="submit"
              disabled={isSigningIn || isLoading}
            >
              {isSigningIn ? "Signing in..." : "Sign in"}
            </button>

            <p className="auth-hint">
              Create a test account in your Supabase project to sign in here.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
