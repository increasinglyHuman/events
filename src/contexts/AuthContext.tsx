"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { TRUSTED_ORIGIN, isWorldMessage } from "@/types/postmessage";

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  picture?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isIframe: boolean;
}

interface AuthContextValue extends AuthState {
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
}

const GOOGLE_CLIENT_ID =
  "482342615637-ma0n89fnl8ku2r92q63fhf96bfo1e8tu.apps.googleusercontent.com";
const AUTH_ENDPOINT = "https://poqpoq.com/voice-ninja/auth/google";
const LS_TOKEN = "auth_token";
const LS_USER = "auth_user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isIframe: false,
  });

  useEffect(() => {
    let iframe = false;
    try {
      iframe = window.self !== window.top;
    } catch {
      iframe = true;
    }
    setState((s) => ({ ...s, isIframe: iframe }));
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_USER);
      const token = localStorage.getItem(LS_TOKEN);
      if (raw && token) {
        const user: AuthUser = JSON.parse(raw);
        setState((s) => ({ ...s, user, token, isLoading: false }));
        return;
      }
    } catch {
      /* ignore */
    }
    setState((s) => ({ ...s, isLoading: false }));
  }, []);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== TRUSTED_ORIGIN) return;
      if (!isWorldMessage(e.data)) return;
      if (e.data.type !== "AUTH_TOKEN") return;

      const { token, userId, userName } = e.data.payload;
      const user: AuthUser = { id: userId, name: userName };

      try {
        sessionStorage.setItem(LS_TOKEN, token);
        sessionStorage.setItem(LS_USER, JSON.stringify(user));
      } catch {
        /* private browsing */
      }

      setState((s) => ({ ...s, user, token, isLoading: false }));
      window.parent.postMessage({ type: "EVENTS_READY" }, TRUSTED_ORIGIN);
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const signIn = useCallback(() => {
    if (state.isIframe) return;

    const existing = document.getElementById("gsi-script");
    if (existing) {
      triggerGooglePrompt();
      return;
    }

    const script = document.createElement("script");
    script.id = "gsi-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = triggerGooglePrompt;
    document.head.appendChild(script);
  }, [state.isIframe]);

  function triggerGooglePrompt() {
    const google = (window as unknown as { google: GoogleIdentityServices })
      .google;
    if (!google?.accounts?.id) return;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });
    google.accounts.id.prompt();
  }

  async function handleGoogleCredential(response: { credential: string }) {
    try {
      setState((s) => ({ ...s, isLoading: true }));

      const res = await fetch(AUTH_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      });

      if (!res.ok) throw new Error("Auth failed");

      const data = await res.json();
      const token: string = data.jwt_token;
      const user: AuthUser = {
        id: data.user_id ?? data.user?.id,
        name: data.user?.display_name ?? data.user?.username,
        email: data.user?.email,
        picture: data.user?.avatar_url,
      };

      localStorage.setItem(LS_TOKEN, token);
      localStorage.setItem(LS_USER, JSON.stringify(user));

      setState((s) => ({ ...s, user, token, isLoading: false }));
    } catch (err) {
      console.error("[AuthProvider] Google sign-in failed:", err);
      setState((s) => ({ ...s, isLoading: false }));
    }
  }

  const signOut = useCallback(() => {
    localStorage.removeItem(LS_TOKEN);
    localStorage.removeItem(LS_USER);
    sessionStorage.removeItem(LS_TOKEN);
    sessionStorage.removeItem(LS_USER);
    setState((s) => ({ ...s, user: null, token: null }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    isAuthenticated: !!state.user && !!state.token,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

interface GoogleIdentityServices {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: { credential: string }) => void;
      }) => void;
      prompt: () => void;
      revoke: (email: string, callback: () => void) => void;
    };
  };
}
