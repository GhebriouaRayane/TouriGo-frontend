import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useLanguage } from "../context/LanguageContext";
import { ApiHostProfile, getHostProfileApi } from "../lib/api";
import { formatListingRating } from "../lib/listingRatings";

function formatPrice(locale: string, value: number) {
  return `${new Intl.NumberFormat(locale).format(Math.round(value))} DA`;
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

function parsePublicationDetails(details: string | null): unknown {
  if (!details) {
    return null;
  }
  try {
    return JSON.parse(details) as unknown;
  } catch {
    return null;
  }
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function summarizePublication(details: string | null): { label: string | null; highlights: string[] } {
  const parsed = parsePublicationDetails(details);
  if (!parsed) {
    return { label: null, highlights: [] };
  }

  const highlights: string[] = [];
  let label: string | null = null;

  const pushHighlights = (raw: unknown) => {
    const items = asStringArray(raw);
    for (const item of items) {
      if (!highlights.includes(item)) {
        highlights.push(item);
      }
    }
  };

  const inspectRecord = (value: Record<string, unknown>) => {
    const kind = typeof value.kind === "string" ? value.kind.trim() : "";
    if (kind && !label) {
      label = kind;
    }
    pushHighlights(value.amenities);
    pushHighlights(value.included);

    const notableKeys = [
      "brand",
      "model",
      "fuel",
      "transmission",
      "level",
      "duration",
      "departure_place",
      "destination",
    ];
    for (const key of notableKeys) {
      const rawValue = value[key];
      if (typeof rawValue === "string" && rawValue.trim() && !highlights.includes(rawValue.trim())) {
        highlights.push(rawValue.trim());
      }
    }
  };

  if (Array.isArray(parsed)) {
    for (const item of parsed) {
      if (item && typeof item === "object") {
        inspectRecord(item as Record<string, unknown>);
      }
    }
  } else if (parsed && typeof parsed === "object") {
    inspectRecord(parsed as Record<string, unknown>);
  }

  return {
    label,
    highlights: highlights.slice(0, 3),
  };
}

export default function HostProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const [profile, setProfile] = useState<ApiHostProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileId = useMemo(() => {
    const parsed = Number(id);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }, [id]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!profileId) {
        setLoading(false);
        setError(t("profile.host.notFound"));
        return;
      }
      setLoading(true);
      try {
        const data = await getHostProfileApi(profileId);
        if (mounted) {
          setProfile(data);
          setError(null);
        }
      } catch (requestError) {
        if (mounted) {
          setError(requestError instanceof Error ? requestError.message : t("profile.host.notFound"));
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
  }, [profileId, t]);

  const ratingLabel = useMemo(() => {
    if (!profile || profile.rating_average === null || profile.rating_count === 0) {
      return t("profile.host.noRating");
    }
    return `${profile.rating_average.toFixed(1)} / 5`;
  }, [profile, t]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-muted-foreground">{t("app.loading")}</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[70vh] bg-gradient-to-br from-[#EEF5FA] via-background to-[#F7FAFC] flex items-center justify-center px-6">
        <div className="max-w-xl w-full rounded-3xl border border-border bg-white p-8 shadow-xl">
          <p className="text-lg font-semibold text-foreground">{error ?? t("profile.host.notFound")}</p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              {t("profile.host.back")}
            </Button>
            <Button asChild>
              <Link to="/resultats">{t("popular.seeAll")}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const avatarSeed = profile.full_name ?? `tourigo-host-${profile.id}`;
  const fallbackName = profile.full_name ?? t("profile.host.anonymous");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(124,153,176,0.22),_transparent_45%),linear-gradient(180deg,_#F8FBFD_0%,_#FFFFFF_100%)]">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <Button variant="ghost" className="mb-6 pl-0 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("profile.host.back")}
        </Button>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="overflow-hidden rounded-[2rem] border border-border bg-white shadow-[0_28px_70px_rgba(15,23,42,0.08)] dark:bg-[#0f172a]"
        >
          <div className="bg-gradient-to-r from-[#EEF5FA] via-[#F7FAFC] to-[#FFFFFF] px-8 py-10 text-foreground dark:from-[#3A6080] dark:via-[#5481A0] dark:to-[#7C99B0] dark:text-white">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <Avatar className="h-24 w-24 border-4 border-white/80 shadow-xl">
                <AvatarImage src={profile.avatar_url ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`} />
                <AvatarFallback className="text-lg font-bold text-[#335975] dark:text-white">
                  {getInitials(profile.full_name, "TG")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm uppercase tracking-[0.24em] text-[#335975] dark:text-white/75">{t("profile.host.title")}</p>
                <h1 className="mt-2 truncate text-3xl font-black md:text-4xl">{fallbackName}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground/80 dark:text-white/85 md:text-base">
                  {t("profile.host.subtitle")}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/70 px-5 py-4 backdrop-blur dark:bg-white/12">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#335975]/70 dark:text-white/70">{t("profile.host.reviewsAverage")}</p>
                  <p className="mt-2 flex items-center gap-2 text-2xl font-bold text-foreground dark:text-white">
                    <Star className="h-5 w-5 fill-current" />
                    {ratingLabel}
                  </p>
                  <p className="mt-1 text-sm text-foreground/70 dark:text-white/75">
                    {profile.rating_count > 0
                      ? `${new Intl.NumberFormat(locale).format(profile.rating_count)} ${t("profile.host.reviewsCount")}`
                      : t("profile.host.noRating")}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/70 px-5 py-4 backdrop-blur dark:bg-white/12">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#335975]/70 dark:text-white/70">{t("profile.host.publications")}</p>
                  <p className="mt-2 text-2xl font-bold text-foreground dark:text-white">
                    {new Intl.NumberFormat(locale).format(profile.listings.length)}
                  </p>
                  <p className="mt-1 text-sm text-foreground/70 dark:text-white/75">{t("profile.host.publications")}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="mt-10">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{t("profile.host.publications")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("profile.host.subtitle")}</p>
            </div>
          </div>

          {profile.listings.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-white/80 p-10 text-center text-muted-foreground shadow-sm">
              {t("profile.host.noListings")}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {profile.listings.map((listing) => {
                const ratingText = formatListingRating(listing, t("profile.host.noRating"));
                const coverUrl = listing.images[0]?.url ?? "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200";
                const publicationSummary = summarizePublication(listing.details);
                const publicationTitle = publicationSummary.label ?? listing.category ?? listing.type;
                const publicationHighlights = publicationSummary.highlights;
                const publicationDescription =
                  listing.description ??
                  (publicationHighlights.length > 0 ? publicationHighlights.join(" • ") : null) ??
                  listing.category ??
                  listing.type;

                return (
                  <Link key={listing.id} to={`/detail/${listing.id}`}>
                    <motion.article
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.2 }}
                      className="group h-full overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] transition-shadow hover:shadow-[0_24px_50px_rgba(15,23,42,0.12)]"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <ImageWithFallback
                          src={coverUrl}
                          alt={listing.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent px-5 py-4 text-white">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4" />
                            <span className="truncate">{listing.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4 p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="line-clamp-2 text-lg font-bold text-foreground">{listing.title}</h3>
                          <span className="shrink-0 rounded-full bg-[#EEF5FA] px-3 py-1 text-xs font-semibold text-[#335975]">
                            {publicationTitle}
                          </span>
                        </div>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {publicationDescription}
                        </p>
                        {publicationHighlights.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {publicationHighlights.map((highlight) => (
                              <span
                                key={highlight}
                                className="rounded-full border border-[#D7E6F0] bg-[#F8FBFD] px-3 py-1 text-xs font-medium text-[#335975]"
                              >
                                {highlight}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xl font-black text-[#335975]">{formatPrice(locale, listing.price)}</p>
                            <p className="text-xs text-muted-foreground">{t("profile.host.viewListing")}</p>
                          </div>
                          <div className="rounded-2xl bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700">
                            {ratingText}
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
