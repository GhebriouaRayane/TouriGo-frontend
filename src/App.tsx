import { FormEvent, useEffect, useRef, useState } from "react";
import { Capacitor, PluginListenerHandle, registerPlugin } from "@capacitor/core";
import { BrowserRouter as Router, Link, Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router-dom";

// Page transition wrapper — fades in when route changes
function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-enter">
      {children}
    </div>
  );
}
import ChatBot from "./components/ChatBot";
import FooterNew from "./components/FooterNew";
import NavbarNew from "./components/NavbarNew";
import { useAuth } from "./context/AuthContext";
import { useLanguage } from "./context/LanguageContext";
import { loadGoogleIdentityScript } from "./lib/googleIdentity";
import Accueil from "./pages/Accueil";
import Activites from "./pages/Activites";
import Dashboard from "./pages/Dashboard";
import DetailAnnonce from "./pages/DetailAnnonce";
import DevenirHote from "./pages/DevenirHote";
import Immobilier from "./pages/Immobilier";
import Resultats from "./pages/Resultats";
import StaticPage from "./pages/StaticPage";
import Vehicules from "./pages/Vehicules";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

type CapacitorAppPlugin = {
  addListener: (
    eventName: "backButton",
    listener: (event: { canGoBack: boolean }) => void
  ) => Promise<PluginListenerHandle> | PluginListenerHandle;
  exitApp: () => Promise<void>;
};

const CapacitorApp = registerPlugin<CapacitorAppPlugin>("App");

function AndroidHardwareBackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location.pathname);

  useEffect(() => {
    locationRef.current = location.pathname;
  }, [location.pathname]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let cancelled = false;
    let listenerHandle: PluginListenerHandle | null = null;

    const attach = async () => {
      try {
        const handle = await Promise.resolve(
          CapacitorApp.addListener("backButton", ({ canGoBack }) => {
            const isRootRoute = locationRef.current === "/";
            if (canGoBack) {
              navigate(-1);
              return;
            }
            if (!isRootRoute) {
              navigate("/", { replace: true });
              return;
            }
            void CapacitorApp.exitApp();
          })
        );

        if (cancelled) {
          await handle.remove();
          return;
        }
        listenerHandle = handle;
      } catch {
        // Ignore listener errors to avoid crashing app startup.
      }
    };

    void attach();

    return () => {
      cancelled = true;
      if (listenerHandle) {
        void listenerHandle.remove();
      }
    };
  }, [navigate]);

  return null;
}

function ProtectedRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center">{t("app.loading")}</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace state={{ from: location.pathname }} />;
  }

  return children;
}

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "tourigo-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const onToggleTheme = () => {
    setTheme((previousTheme) => (previousTheme === "dark" ? "light" : "dark"));
  };

  return (
    <Router>
      <ScrollToTop />
      <AndroidHardwareBackButton />
      <div className="min-h-screen bg-background flex flex-col">
        <NavbarNew theme={theme} onToggleTheme={onToggleTheme} />
        <main className="flex-grow">
          <PageTransition>
            <Routes>
              <Route path="/" element={<Accueil />} />
              <Route path="/immobilier" element={<Immobilier />} />
              <Route path="/vehicules" element={<Vehicules />} />
              <Route path="/activites" element={<Activites />} />
              <Route path="/devenir-hote" element={<DevenirHote />} />
              <Route path="/resultats" element={<Resultats />} />
              <Route path="/detail/:id" element={<DetailAnnonce />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/connexion" element={<Login />} />
              <Route path="/inscription" element={<Register />} />
              <Route path="/a-propos" element={<StaticPage pageKey="about" />} />
              <Route path="/comment-ca-marche" element={<StaticPage pageKey="howItWorks" />} />
              <Route path="/carrieres" element={<StaticPage pageKey="careers" />} />
              <Route path="/presse" element={<StaticPage pageKey="press" />} />
              <Route path="/centre-aide" element={<StaticPage pageKey="helpCenter" />} />
              <Route path="/contact" element={<StaticPage pageKey="contact" />} />
              <Route path="/conditions-utilisation" element={<StaticPage pageKey="terms" />} />
              <Route path="/politique-confidentialite" element={<StaticPage pageKey="privacy" />} />
              <Route path="/ressources-hotes" element={<StaticPage pageKey="hostResources" />} />
              <Route path="/assurance-hote" element={<StaticPage pageKey="hostInsurance" />} />
              <Route path="/blog" element={<StaticPage pageKey="blog" />} />
              <Route path="/mentions-legales" element={<StaticPage pageKey="legal" />} />
              <Route path="/politique-cookies" element={<StaticPage pageKey="cookies" />} />
              <Route path="/plan-site" element={<StaticPage pageKey="sitemap" />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PageTransition>
        </main>
        <FooterNew />
        <ChatBot />
      </div>
    </Router>
  );
}

function Login() {
  const { login, loginWithGoogle, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    let cancelled = false;
    const setupGoogleButton = async () => {
      try {
        await loadGoogleIdentityScript();
        if (cancelled || !googleButtonRef.current || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async ({ credential }) => {
            if (!credential) {
              setError(t("auth.error.googleTokenMissing"));
              return;
            }
            setError(null);
            setGoogleSubmitting(true);
            try {
              await loginWithGoogle(credential);
              navigate(redirectTo, { replace: true });
            } catch (err) {
              setError(err instanceof Error ? err.message : t("auth.error.googleLoginFailed"));
            } finally {
              if (!cancelled) {
                setGoogleSubmitting(false);
              }
            }
          },
          ux_mode: "popup",
          cancel_on_tap_outside: true,
        });

        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: "320",
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t("auth.error.googleUnavailableLogin"));
        }
      }
    };

    void setupGoogleButton();

    return () => {
      cancelled = true;
    };
  }, [googleClientId, loginWithGoogle, navigate, redirectTo, t]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const identifier = loginMethod === "email" ? email.trim() : phoneNumber.trim();
    if (!identifier) {
      setError(loginMethod === "email" ? t("auth.error.emailRequired") : t("auth.error.phoneRequired"));
      return;
    }
    setSubmitting(true);
    try {
      await login(identifier, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.error.loginFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-background flex items-center justify-center py-20">
      <div className="max-w-md w-full mx-4">
        <form onSubmit={onSubmit} className="bg-card rounded-3xl shadow-xl p-8 border border-border">
          <h1 className="text-center mb-6">{t("auth.login.title")}</h1>
          <p className="text-center text-muted-foreground mb-6">
            {t("auth.login.subtitle")}
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{t("auth.login.methodLabel")}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setLoginMethod("email"); setError(null); }}
                  className={`relative flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border-2 transition-all duration-200 font-medium text-sm ${loginMethod === "email"
                    ? "border-[rgb(34,45,49)] bg-gradient-to-br from-[rgb(34,45,49)] to-[rgb(60,80,90)] text-white shadow-lg scale-[1.02]"
                    : "border-border text-muted-foreground hover:border-[rgb(153,163,168)] hover:bg-accent/50 hover:scale-[1.01]"
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <span>{t("auth.login.methodEmail")}</span>
                  {loginMethod === "email" && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/60" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod("phone"); setError(null); }}
                  className={`relative flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border-2 transition-all duration-200 font-medium text-sm ${loginMethod === "phone"
                    ? "border-[rgb(34,45,49)] bg-gradient-to-br from-[rgb(34,45,49)] to-[rgb(60,80,90)] text-white shadow-lg scale-[1.02]"
                    : "border-border text-muted-foreground hover:border-[rgb(153,163,168)] hover:bg-accent/50 hover:scale-[1.01]"
                    }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>{t("auth.login.methodPhone")}</span>
                  {loginMethod === "phone" && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/60" />
                  )}
                </button>
              </div>
            </div>
            {loginMethod === "email" ? (
              <input
                required
                type="email"
                placeholder={t("auth.login.emailPlaceholder")}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            ) : (
              <input
                required
                type="tel"
                placeholder={t("auth.login.phonePlaceholder")}
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
            <input
              required
              type="password"
              placeholder={t("auth.login.passwordPlaceholder")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={submitting || googleSubmitting}
                className="px-12 py-3 bg-gradient-to-r from-[rgb(153,163,168)] to-[rgb(34,45,49)] text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg disabled:opacity-60"
              >
                {submitting ? t("auth.login.submitting") : t("auth.login.submit")}
              </button>
            </div>
            {googleClientId && (
              <>
                <div className="relative py-2">
                  <div className="h-px bg-border" />
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground bg-card w-fit mx-auto px-3">
                    {t("auth.or")}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                    <path
                      d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.48-1.73 4.33-5.27 4.33-3.17 0-5.75-2.62-5.75-5.85s2.58-5.85 5.75-5.85c1.8 0 3 0.77 3.69 1.43l2.51-2.43C16.78 4.2 14.72 3.3 12.17 3.3 7.3 3.3 3.33 7.3 3.33 12.2s3.97 8.9 8.84 8.9c5.1 0 8.48-3.59 8.48-8.65 0-.58-.07-1.02-.15-1.35z"
                      fill="#4285F4"
                    />
                    <path
                      d="M6.48 14.34l-.7 2.56-2.5.05C4.5 19.26 8.05 21.1 12.17 21.1c2.55 0 4.61-.84 6.15-2.28l-2.93-2.27c-.8.56-1.83.95-3.22.95-3.09 0-5.7-2.08-6.69-4.91z"
                      fill="#34A853"
                    />
                    <path
                      d="M3.28 7.45l2.54 1.86c.67-1.95 2.5-3.36 4.85-3.36 1.4 0 2.66.48 3.64 1.4l2.72-2.64C15.68 3.54 13.82 2.8 11.67 2.8c-3.67 0-6.79 2.07-8.39 5.1z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12.17 21.1c2.47 0 4.54-.82 6.05-2.22l-2.8-2.16c-.78.55-1.8.88-3.25.88-3.09 0-5.7-2.08-6.69-4.91l-2.57 1.98C4.5 19.26 8.05 21.1 12.17 21.1z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>{t("auth.login.googleDirect")}</span>
                </div>
                <div className="flex justify-center">
                  <div ref={googleButtonRef} aria-label={t("auth.login.googleAria")} />
                </div>
                {googleSubmitting && <p className="text-xs text-muted-foreground text-center">{t("auth.login.googleSubmitting")}</p>}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Register() {
  const { requestRegisterCode, verifyRegisterCode, loginWithGoogle, isAuthenticated } = useAuth();
  const { t, locale } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [registrationMethod, setRegistrationMethod] = useState<"email" | "phone">("email");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationId, setVerificationId] = useState<number | null>(null);
  const [verificationTarget, setVerificationTarget] = useState<string | null>(null);
  const [verificationExpiresAt, setVerificationExpiresAt] = useState<string | null>(null);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [step, setStep] = useState<"request" | "verify">("request");
  const [accessType, setAccessType] = useState<"" | "client" | "host">(
    searchParams.get("becomeHost") === "1" ? "host" : ""
  );
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const registerGoogleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!googleClientId || step !== "request") {
      return;
    }

    let cancelled = false;
    const setupGoogleButton = async () => {
      try {
        await loadGoogleIdentityScript();
        if (cancelled || !registerGoogleButtonRef.current || !window.google?.accounts?.id) {
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async ({ credential }) => {
            if (!credential) {
              setError(t("auth.error.googleTokenMissing"));
              return;
            }
            if (!acceptedTerms) {
              setError(t("auth.error.termsRequired"));
              return;
            }
            setError(null);
            setGoogleSubmitting(true);
            try {
              await loginWithGoogle(credential);
              navigate("/dashboard", { replace: true });
            } catch (err) {
              setError(err instanceof Error ? err.message : t("auth.error.googleSignupFailed"));
            } finally {
              if (!cancelled) {
                setGoogleSubmitting(false);
              }
            }
          },
          ux_mode: "popup",
          cancel_on_tap_outside: true,
        });

        registerGoogleButtonRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(registerGoogleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "signup_with",
          shape: "pill",
          width: "320",
        });
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t("auth.error.googleUnavailableSignup"));
        }
      }
    };

    void setupGoogleButton();

    return () => {
      cancelled = true;
    };
  }, [acceptedTerms, googleClientId, loginWithGoogle, navigate, step, t]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const normalizedEmail = email.trim();
    const normalizedPhone = phoneNumber.trim();
    if (!accessType) {
      setError(t("auth.error.accessTypeRequired"));
      return;
    }
    if (!acceptedTerms) {
      setError(t("auth.error.termsRequired"));
      return;
    }
    if (registrationMethod === "email" && !normalizedEmail) {
      setError(t("auth.error.emailRequiredRegister"));
      return;
    }
    if (!normalizedPhone) {
      setError(t("auth.error.phoneRequiredRegister"));
      return;
    }
    setSubmitting(true);
    try {
      const response = await requestRegisterCode({
        email: registrationMethod === "email" ? normalizedEmail : undefined,
        password,
        fullName: fullName.trim() || undefined,
        phoneNumber: normalizedPhone,
        channel: registrationMethod,
        becomeHost: accessType === "host",
      });
      setVerificationId(response.verification_id);
      setVerificationTarget(response.target);
      setVerificationExpiresAt(response.expires_at);
      setDebugCode(response.debug_code);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.error.registerFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const onVerifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!verificationId) {
      setError(t("auth.error.invalidSession"));
      setStep("request");
      return;
    }
    const identifier = registrationMethod === "email" ? email.trim() : phoneNumber.trim();
    setSubmitting(true);
    try {
      await verifyRegisterCode({
        verificationId,
        code: verificationCode.trim(),
        identifier,
        password,
      });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.error.invalidCode"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-background flex items-center justify-center py-20">
      <div className="max-w-md w-full mx-4">
        <form onSubmit={step === "request" ? onSubmit : onVerifyCode} className="bg-card rounded-3xl shadow-xl p-8 border border-border">
          <h1 className="text-center mb-6">{t("auth.register.title")}</h1>
          <p className="text-center text-muted-foreground mb-6">
            {step === "request" ? t("auth.register.subtitleRequest") : t("auth.register.subtitleVerify")}
          </p>
          <div className="space-y-4">
            {step === "request" ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{t("auth.register.typeLabel")}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegistrationMethod("email")}
                      className={`relative flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border-2 transition-all duration-200 font-medium text-sm ${registrationMethod === "email"
                        ? "border-[rgb(34,45,49)] bg-gradient-to-br from-[rgb(34,45,49)] to-[rgb(60,80,90)] text-white shadow-lg scale-[1.02]"
                        : "border-border text-muted-foreground hover:border-[rgb(153,163,168)] hover:bg-accent/50 hover:scale-[1.01]"
                        }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <span>{t("auth.register.typeEmail")}</span>
                      {registrationMethod === "email" && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/60" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegistrationMethod("phone")}
                      className={`relative flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border-2 transition-all duration-200 font-medium text-sm ${registrationMethod === "phone"
                        ? "border-[rgb(34,45,49)] bg-gradient-to-br from-[rgb(34,45,49)] to-[rgb(60,80,90)] text-white shadow-lg scale-[1.02]"
                        : "border-border text-muted-foreground hover:border-[rgb(153,163,168)] hover:bg-accent/50 hover:scale-[1.01]"
                        }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>{t("auth.register.typePhone")}</span>
                      {registrationMethod === "phone" && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/60" />
                      )}
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder={t("auth.register.fullName")}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {registrationMethod === "email" && (
                  <input
                    required
                    type="email"
                    placeholder={t("auth.register.emailPlaceholder")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                )}
                <input
                  required
                  type="tel"
                  placeholder={t("auth.register.phonePlaceholder")}
                  value={phoneNumber}
                  onChange={(event) => setPhoneNumber(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <input
                  required
                  type="password"
                  minLength={8}
                  placeholder={t("auth.register.passwordPlaceholder")}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">{t("auth.register.accessTypeLabel")}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAccessType("client")}
                      className={`relative flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border-2 transition-all duration-200 font-medium text-sm ${accessType === "client"
                        ? "border-[rgb(34,45,49)] bg-gradient-to-br from-[rgb(34,45,49)] to-[rgb(60,80,90)] text-white shadow-lg scale-[1.02]"
                        : "border-border text-muted-foreground hover:border-[rgb(153,163,168)] hover:bg-accent/50 hover:scale-[1.01]"
                        }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="5" />
                        <path d="M20 21a8 8 0 1 0-16 0" />
                      </svg>
                      <span>{t("auth.register.accessClient")}</span>
                      {accessType === "client" && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/60" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccessType("host")}
                      className={`relative flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border-2 transition-all duration-200 font-medium text-sm ${accessType === "host"
                        ? "border-[rgb(34,45,49)] bg-gradient-to-br from-[rgb(34,45,49)] to-[rgb(60,80,90)] text-white shadow-lg scale-[1.02]"
                        : "border-border text-muted-foreground hover:border-[rgb(153,163,168)] hover:bg-accent/50 hover:scale-[1.01]"
                        }`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                      <span>{t("auth.register.accessHost")}</span>
                      {accessType === "host" && (
                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/60" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <input
                    id="accept-terms"
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => setAcceptedTerms(event.target.checked)}
                    required
                  />
                  <span className="leading-5">
                    <label htmlFor="accept-terms" className="cursor-pointer">
                      {t("auth.register.acceptTermsPrefix")}{" "}
                    </label>
                    <Link
                      to="/conditions-utilisation"
                      className="underline hover:text-foreground"
                      onClick={(event) => event.stopPropagation()}
                    >
                      {t("footer.link.terms")}
                    </Link>
                    .
                  </span>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {t("auth.register.codeSentTo")} <span className="font-medium text-foreground">{verificationTarget ?? "-"}</span>
                </p>
                {verificationExpiresAt && (
                  <p className="text-xs text-muted-foreground">
                    {t("auth.register.expiresOn")} {new Date(verificationExpiresAt).toLocaleString(locale)}
                  </p>
                )}
                {debugCode && (
                  <p className="text-xs text-amber-600">
                    {t("auth.register.devCode", { code: debugCode })}
                  </p>
                )}
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  placeholder={t("auth.register.codePlaceholder")}
                  value={verificationCode}
                  onChange={(event) => setVerificationCode(event.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => {
                    setStep("request");
                    setVerificationCode("");
                    setVerificationId(null);
                  }}
                  className="w-full py-2 rounded-xl border border-border text-sm hover:bg-accent transition-colors"
                >
                  {t("auth.register.restart")}
                </button>
              </>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={submitting || googleSubmitting}
                className="px-12 py-3 bg-gradient-to-r from-[rgb(153,163,168)] to-[rgb(34,45,49)] text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg disabled:opacity-60"
              >
                {submitting ? t("auth.register.submitting") : step === "request" ? t("auth.register.submitRequest") : t("auth.register.submitVerify")}
              </button>
            </div>
            {step === "request" && googleClientId && (
              <>
                <div className="relative py-2">
                  <div className="h-px bg-border" />
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground bg-card w-fit mx-auto px-3">
                    {t("auth.or")}
                  </span>
                </div>
                <div className="flex justify-center">
                  <div ref={registerGoogleButtonRef} aria-label={t("auth.register.googleAria")} />
                </div>
                {googleSubmitting && <p className="text-xs text-muted-foreground text-center">{t("auth.register.googleSubmitting")}</p>}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
