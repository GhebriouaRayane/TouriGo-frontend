import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ApiUser,
  RegisterCodeResponse,
  VerificationChannel,
  becomeHostApi,
  getMeApi,
  loginApi,
  loginWithGoogleApi,
  requestRegisterCodeApi,
  verifyRegisterCodeApi,
} from "../lib/api";

const TOKEN_STORAGE_KEY = "auth_token";

type RegisterPayload = {
  email?: string;
  password: string;
  fullName?: string;
  phoneNumber: string;
  channel: VerificationChannel;
  becomeHost?: boolean;
};

type AuthContextValue = {
  user: ApiUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  requestRegisterCode: (payload: RegisterPayload) => Promise<RegisterCodeResponse>;
  verifyRegisterCode: (payload: { verificationId: number; code: string; identifier: string; password: string }) => Promise<void>;
  becomeHost: () => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getStoredToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const me = await getMeApi(token);
      setUser(me);
    } catch {
      logout();
    }
  }, [logout, token]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }
      try {
        const me = await getMeApi(token);
        if (mounted) {
          setUser(me);
        }
      } catch {
        if (mounted) {
          logout();
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [logout, token]);

  const login = useCallback(async (identifier: string, password: string) => {
    const data = await loginApi(identifier, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    setToken(data.access_token);
    const me = await getMeApi(data.access_token);
    setUser(me);
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const data = await loginWithGoogleApi(idToken);
    localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
    setToken(data.access_token);
    const me = await getMeApi(data.access_token);
    setUser(me);
  }, []);

  const requestRegisterCode = useCallback(async (payload: RegisterPayload) => {
    return requestRegisterCodeApi({
      email: payload.email,
      password: payload.password,
      full_name: payload.fullName,
      phone_number: payload.phoneNumber,
      channel: payload.channel,
      become_host: payload.becomeHost,
    });
  }, []);

  const verifyRegisterCode = useCallback(async (payload: { verificationId: number; code: string; identifier: string; password: string }) => {
    await verifyRegisterCodeApi({
      verification_id: payload.verificationId,
      code: payload.code,
    });
    await login(payload.identifier, payload.password);
  }, [login]);

  const becomeHost = useCallback(async () => {
    // `login()` stores the token in localStorage before React state is flushed.
    // Read from storage as a fallback to avoid stale closure issues in same submit tick.
    const currentToken = token ?? getStoredToken();
    if (!currentToken) {
      throw new Error("Vous devez etre connecte pour devenir hote.");
    }
    const updatedUser = await becomeHostApi(currentToken);
    setUser(updatedUser);
    if (!token) {
      setToken(currentToken);
    }
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      loading,
      login,
      loginWithGoogle,
      requestRegisterCode,
      verifyRegisterCode,
      becomeHost,
      logout,
      refreshMe,
    }),
    [user, token, loading, login, loginWithGoogle, requestRegisterCode, verifyRegisterCode, becomeHost, logout, refreshMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
