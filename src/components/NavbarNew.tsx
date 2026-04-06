import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Menu, X, Home, Car, Palmtree, UserPlus, Moon, Sun, Globe } from "lucide-react";
import logo from "../assets/9a08edf2d1705a725f9124e56803bea1d0396d59.jpg";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { LANGUAGE_LABELS, type Language } from "../i18n/translations";

type NavbarNewProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export default function NavbarNew({ theme, onToggleTheme }: NavbarNewProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const currentPath = location.pathname;
  const { isAuthenticated, logout, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const isHost = user?.role === "host" || user?.role === "admin";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navItems = [
    { path: "/", label: t("nav.home"), icon: Home },
    { path: "/immobilier", label: t("nav.realEstate"), icon: Home },
    { path: "/vehicules", label: t("nav.vehicles"), icon: Car },
    { path: "/activites", label: t("nav.activities"), icon: Palmtree },
    ...(!isHost ? [{ path: "/devenir-hote", label: t("nav.becomeHost"), icon: UserPlus }] : []),
  ];

  const isActive = (path: string) => {
    if (path === "/" && currentPath === "/") return true;
    if (path !== "/" && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className={`w-full border-b border-border sticky top-0 z-50 transition-all duration-300 ${scrolled ? "navbar-glass border-transparent" : "bg-white/95 backdrop-blur-md shadow-sm dark:bg-background/95"
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <img
              src={logo}
              alt="TouriGo Logo"
              className="h-10 sm:h-12 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-full transition-all text-sm font-medium ${isActive(item.path)
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent"
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side - Desktop */}
          <div className="hidden sm:flex items-center gap-3">
            <label className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <select
                aria-label={t("nav.language")}
                value={language}
                onChange={(event) => setLanguage(event.target.value as Language)}
                className="bg-transparent text-sm outline-none cursor-pointer"
              >
                <option value="fr">{LANGUAGE_LABELS.fr}</option>
                <option value="en">{LANGUAGE_LABELS.en}</option>
                <option value="ar">{LANGUAGE_LABELS.ar}</option>
              </select>
            </label>
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-full border border-border bg-background hover:bg-accent transition-colors"
              aria-label={theme === "dark" ? t("nav.enableLight") : t("nav.enableDark")}
              title={theme === "dark" ? t("nav.themeLight") : t("nav.themeDark")}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="relative group">
                  <Avatar className="w-9 h-9" style={{ border: "2px solid var(--primary)", opacity: 0.9, transition: "all 0.2s" }}>
                    <AvatarImage src={user?.avatar_url || undefined} />
                    <AvatarFallback className="text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg, var(--primary), rgb(34,45,49))" }}>
                      {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute rounded-full" style={{ bottom: "-2px", right: "-2px", width: "12px", height: "12px", background: "#10b981", border: "2px solid white" }} />
                </Link>
                <Button
                  type="button"
                  onClick={logout}
                  className="rounded-full bg-gradient-to-r from-[rgb(153,163,168)] to-[rgb(96,98,93)] hover:opacity-90"
                >
                  {t("nav.logout")}
                </Button>
              </>
            ) : (
              <>
                <Link to="/connexion">
                  <Button
                    variant="outline"
                    className="rounded-full border-primary text-primary hover:bg-primary/5"
                  >
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link to="/inscription">
                  <Button
                    className="rounded-full bg-gradient-to-r from-[rgb(153,163,168)] to-[rgb(96,98,93)] hover:opacity-90"
                  >
                    {t("nav.register")}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors"
            aria-controls="mobile-menu"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="lg:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-in-up">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-accent transition-colors"
                aria-label={theme === "dark" ? t("nav.enableLight") : t("nav.enableDark")}
              >
                {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                <span>{theme === "dark" ? t("nav.themeLight") : t("nav.themeDark")}</span>
              </button>
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-accent transition-colors">
                <Globe className="w-5 h-5" />
                <span>{t("nav.language")}</span>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as Language)}
                  className="ml-auto bg-transparent outline-none"
                  aria-label={t("nav.language")}
                >
                  <option value="fr">{LANGUAGE_LABELS.fr}</option>
                  <option value="en">{LANGUAGE_LABELS.en}</option>
                  <option value="ar">{LANGUAGE_LABELS.ar}</option>
                </select>
              </label>
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-accent transition-colors"
                    >
                      <Avatar className="w-10 h-10" style={{ border: "2px solid var(--primary)", opacity: 0.9 }}>
                        <AvatarImage src={user?.avatar_url || undefined} />
                        <AvatarFallback className="text-white text-sm font-semibold" style={{ background: "linear-gradient(135deg, var(--primary), rgb(34,45,49))" }}>
                          {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{user?.full_name || t("nav.dashboard")}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
                      </div>
                    </Link>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-primary text-primary"
                      >
                        {t("nav.dashboard")}
                      </Button>
                    </Link>
                    <Button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full rounded-full bg-gradient-to-r from-[rgb(153,163,168)] to-[rgb(96,98,93)]"
                    >
                      {t("nav.logout")}
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/connexion" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full rounded-full border-primary text-primary"
                      >
                        {t("nav.login")}
                      </Button>
                    </Link>
                    <Link to="/inscription" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        className="w-full rounded-full bg-gradient-to-r from-[rgb(153,163,168)] to-[rgb(96,98,93)]"
                      >
                        {t("nav.register")}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
