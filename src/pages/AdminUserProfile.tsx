import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, MapPin, Shield, Star, User, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ApiHostProfile, ApiUser, getAdminUsersApi, getHostProfileApi } from "../lib/api";
import { formatListingRating } from "../lib/listingRatings";

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getInitials(name: string | null, fallback: string) {
  const source = (name ?? fallback).trim();
  if (!source) {
    return "TG";
  }
  const initials = source
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  return initials.toUpperCase() || "TG";
}

function formatPrice(locale: string, value: number) {
  return `${new Intl.NumberFormat(locale).format(Math.round(value))} DA`;
}

function getListingTypeLabel(type: string) {
  switch (type) {
    case "immobilier":
      return "Immobilier";
    case "vehicule":
      return "Véhicule";
    case "activite":
      return "Activité";
    default:
      return type;
  }
}

function getRoleLabel(role: string) {
  switch (role) {
    case "user":
      return "Client";
    case "host":
      return "Hôte";
    case "admin":
      return "Admin";
    default:
      return role;
  }
}

export default function AdminUserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, loading, isAuthenticated } = useAuth();
  const { locale } = useLanguage();
  const [account, setAccount] = useState<ApiUser | null>(null);
  const [hostProfile, setHostProfile] = useState<ApiHostProfile | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = useMemo(() => {
    const parsed = Number(id);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [id]);

  useEffect(() => {
    document.title = "TouriGo - Détail utilisateur";
  }, []);

  useEffect(() => {
    let mounted = true;

    if (loading || !isAuthenticated || user?.role !== "admin" || !token) {
      return () => {
        mounted = false;
      };
    }

    if (!userId) {
      setAccount(null);
      setHostProfile(null);
      setError("Utilisateur introuvable.");
      setLoadingData(false);
      return () => {
        mounted = false;
      };
    }

    setLoadingData(true);
    setError(null);

    void getAdminUsersApi(token)
      .then((users) => {
        if (!mounted) {
          return;
        }

        const selectedUser = users.find((entry) => entry.id === userId) ?? null;
        setAccount(selectedUser);

        if (!selectedUser) {
          setHostProfile(null);
          setError("Utilisateur introuvable.");
          return;
        }

        if (selectedUser.role !== "host") {
          setHostProfile(null);
          return;
        }

        return getHostProfileApi(selectedUser.id)
          .then((profile) => {
            if (mounted) {
              setHostProfile(profile);
            }
          })
          .catch((profileError) => {
            if (mounted) {
              console.error(profileError);
              setHostProfile(null);
              setError("Impossible de charger le profil hôte.");
            }
          });
      })
      .catch((requestError) => {
        if (mounted) {
          console.error(requestError);
          setAccount(null);
          setHostProfile(null);
          setError("Impossible de charger l'utilisateur.");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingData(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [loading, isAuthenticated, token, user?.role, userId]);

  const listingStats = useMemo(() => {
    if (!hostProfile) {
      return {
        average: null as number | null,
        ratedListings: 0,
        ratedReviews: 0,
      };
    }

    const ratedListings = hostProfile.listings.filter(
      (listing) => listing.rating_average !== null && listing.rating_count > 0
    );
    const totalWeight = ratedListings.reduce((sum, listing) => sum + listing.rating_count, 0);
    const weightedSum = ratedListings.reduce(
      (sum, listing) => sum + (listing.rating_average ?? 0) * listing.rating_count,
      0
    );

    return {
      average: totalWeight > 0 ? weightedSum / totalWeight : null,
      ratedListings: ratedListings.length,
      ratedReviews: totalWeight,
    };
  }, [hostProfile]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm text-center">
          <div className="text-lg font-semibold text-[#3A6080]">Chargement...</div>
          <div className="mt-2 text-sm text-muted-foreground">Vérification de votre session.</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm text-center">
          <Shield className="mx-auto h-10 w-10 text-[#3A6080]" />
          <h1 className="mt-4 text-2xl font-semibold text-[#3A6080]">Connexion requise</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-6">
            Vous devez être connecté avec un compte admin pour consulter cette page.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/connexion"
              className="inline-flex items-center rounded-full bg-[#3A6080] px-5 py-3 text-sm font-medium text-white"
            >
              Aller à la connexion
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground"
            >
              Retour à l&apos;admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm text-center">
          <Shield className="mx-auto h-10 w-10 text-[#5481A0]" />
          <h1 className="mt-4 text-2xl font-semibold text-[#3A6080]">Accès refusé</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-6">
            Cette page est réservée aux administrateurs.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-full bg-[#3A6080] px-5 py-3 text-sm font-medium text-white"
            >
              Ouvrir le dashboard
            </Link>
            <Link
              to="/"
              className="inline-flex items-center rounded-full border border-border bg-white px-5 py-3 text-sm font-medium text-foreground"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm text-center">
          <div className="text-lg font-semibold text-[#3A6080]">Chargement du profil utilisateur...</div>
          <div className="mt-2 text-sm text-muted-foreground">Récupération des informations détaillées.</div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-sm text-center">
          <User className="mx-auto h-10 w-10 text-[#3A6080]" />
          <h1 className="mt-4 text-2xl font-semibold text-[#3A6080]">Utilisateur introuvable</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-6">
            {error ?? "Aucun compte ne correspond à cet identifiant."}
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/admin">Retour à la liste</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const avatarSeed = account.full_name ?? `tourigo-user-${account.id}`;
  const displayName = account.full_name || account.email;
  const isHost = account.role === "host";
  const profile = hostProfile ?? null;
  const hostAverage = listingStats.average;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,153,176,0.18),_transparent_45%),linear-gradient(180deg,_#F8FBFD_0%,_#FFFFFF_100%)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <Button variant="ghost" className="mb-6 pl-0 text-muted-foreground hover:text-foreground" onClick={() => navigate("/admin")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à l&apos;admin
        </Button>

        <section className="overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
          <div className="bg-gradient-to-r from-[#EEF5FA] via-[#F7FAFC] to-[#FFFFFF] px-8 py-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <Avatar className="h-24 w-24 border-4 border-white/80 shadow-xl">
                <AvatarImage
                  src={
                    profile?.avatar_url ??
                    account.avatar_url ??
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`
                  }
                />
                <AvatarFallback className="text-lg font-bold text-[#335975]">
                  {getInitials(account.full_name, "TG")}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <p className="text-sm uppercase tracking-[0.24em] text-[#335975]">Profil utilisateur</p>
                <h1 className="mt-2 truncate text-3xl font-black text-[#1F3345] md:text-4xl">{displayName}</h1>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/70 px-5 py-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#335975]/70">Rôle</p>
                  <p className="mt-2 text-2xl font-bold text-foreground">{getRoleLabel(account.role)}</p>
                  <p className="mt-1 text-sm text-foreground/70">
                    {account.is_active ? "Compte actif" : "Compte inactif"}
                  </p>
                </div>
                {isHost ? (
                  <div className="rounded-2xl bg-white/70 px-5 py-4 backdrop-blur">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#335975]/70">Publications</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {profile ? new Intl.NumberFormat(locale).format(profile.listings.length) : "0"}
                    </p>
                    <p className="mt-1 text-sm text-foreground/70">Annonces publiées</p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <div className={`mt-8 grid gap-6 ${isHost ? "xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.35fr)]" : ""}`}>
          <section className="rounded-3xl border border-border bg-white p-6 shadow-[0_10px_30px_rgba(34,45,49,0.04)]">
            <h2 className="text-xl font-semibold text-[#3A6080]">Informations du compte</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-[rgb(250,251,252)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email</p>
                <p className="mt-2 text-sm font-medium text-foreground">{account.email}</p>
              </div>
              <div className="rounded-2xl bg-[rgb(250,251,252)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Téléphone</p>
                <p className="mt-2 text-sm font-medium text-foreground">{account.phone_number ?? "—"}</p>
              </div>
              <div className="rounded-2xl bg-[rgb(250,251,252)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Créé le</p>
                <p className="mt-2 text-sm font-medium text-foreground">{formatDate(account.created_at, locale)}</p>
              </div>
              <div className="rounded-2xl bg-[rgb(250,251,252)] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Statut</p>
                <p className="mt-2 text-sm font-medium text-foreground">{account.is_active ? "Actif" : "Inactif"}</p>
              </div>
            </div>

            {isHost ? (
              <div className="mt-6 rounded-2xl border border-border bg-gradient-to-br from-[#EEF5FA] to-white p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Note moyenne réelle des annonces</p>
                <div className="mt-2 flex items-end justify-between gap-4">
                  <div>
                    <p className="flex items-center gap-2 text-3xl font-black text-[#3A6080]">
                      <Star className="h-6 w-6 fill-current" />
                      {hostAverage !== null ? hostAverage.toFixed(1) : "—"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {hostAverage !== null
                        ? `${new Intl.NumberFormat(locale).format(listingStats.ratedReviews)} avis sur ${new Intl.NumberFormat(locale).format(listingStats.ratedListings)} annonce(s) notée(s)`
                        : "Aucune note disponible pour ses annonces."}
                    </p>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    {profile ? `${new Intl.NumberFormat(locale).format(profile.listings.length)} annonce(s)` : "0 annonce"}
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          {isHost ? (
            <section className="rounded-3xl border border-border bg-white p-6 shadow-[0_10px_30px_rgba(34,45,49,0.04)]">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-[#3A6080]">Annonces publiées</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Les annonces de l&apos;hôte sont listées ici avec leur note individuelle.
                  </p>
                </div>
                <Users className="h-5 w-5 text-[#3A6080]" />
              </div>

              {profile === null ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border bg-[rgb(250,251,252)] p-6 text-sm text-muted-foreground">
                  {error ?? "Impossible de charger les annonces de cet hôte."}
                </div>
              ) : profile.listings.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border bg-[rgb(250,251,252)] p-6 text-sm text-muted-foreground">
                  Cet hôte n&apos;a pas encore publié d&apos;annonce.
                </div>
              ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {profile.listings.map((listing) => {
                    const ratingLabel = formatListingRating(listing, "Aucune note");
                    const coverUrl =
                      listing.images[0]?.url ?? "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200";

                    return (
                      <Link
                        key={listing.id}
                        to={`/detail/${listing.id}`}
                        className="group overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        <div className="relative h-48 overflow-hidden bg-[rgb(250,251,252)]">
                          <ImageWithFallback
                            src={coverUrl}
                            alt={listing.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate text-base font-semibold text-foreground">{listing.title}</p>
                              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {listing.location}
                              </p>
                            </div>
                            <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-70 transition-opacity group-hover:opacity-100" />
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="rounded-full bg-[#3A6080]/10 px-3 py-1 text-[#3A6080]">
                              {getListingTypeLabel(listing.type)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-current" />
                              {ratingLabel}
                            </span>
                          </div>
                          <p className="mt-3 text-lg font-bold text-[#3A6080]">{formatPrice(locale, listing.price)}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
