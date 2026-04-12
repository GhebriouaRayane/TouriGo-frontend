import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Search, MapPin, Star, Heart, Palmtree, Compass, Waves, Mountain, Clock, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addFavoriteApi, ApiListing, getFavoriteIdsApi, getListingsApi, removeFavoriteApi } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";
import { ALGERIA_WILAYAS, matchesWilaya, normalizeText, normalizeWilayaValue } from "../constants/wilayas";

function parseDetails(details: string | null): Record<string, unknown> | null {
  if (!details) {
    return null;
  }
  try {
    return JSON.parse(details) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function asPositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
}

function normalizeDifficulty(value: string | null): string {
  if (!value) {
    return "";
  }
  const normalized = normalizeText(value);
  if (normalized === "easy" || normalized === "facile" || normalized === "debutant") {
    return "debutant";
  }
  if (normalized === "medium" || normalized === "moyen" || normalized === "intermediaire") {
    return "intermediaire";
  }
  if (normalized === "hard" || normalized === "difficile" || normalized === "experimente") {
    return "experimente";
  }
  return normalized;
}

type ActivityTab = "tous" | "nature" | "nautique" | "culture";

export default function Activites() {
  const [selectedType, setSelectedType] = useState<ActivityTab>("tous");
  const [locationFilter, setLocationFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [appliedLocationFilter, setAppliedLocationFilter] = useState("all");
  const [appliedDifficultyFilter, setAppliedDifficultyFilter] = useState("all");
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { t, locale } = useLanguage();
  const location = useLocation();

  const activityTypes = [
    { id: "tous", label: t("activities.tab.allThemes"), icon: Compass },
    { id: "nature", label: t("activities.theme.nature"), icon: Mountain },
    { id: "nautique", label: t("activities.theme.nautique"), icon: Waves },
    { id: "culture", label: t("activities.theme.culture"), icon: Palmtree },
  ] as const;

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getListingsApi({
          type: "activite",
          limit: 100,
        });
        if (mounted) {
          setListings(data);
        }
      } catch {
        if (mounted) {
          setListings([]);
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
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) {
        setFavoriteIds(new Set());
        return;
      }
      try {
        const ids = await getFavoriteIdsApi(token);
        if (mounted) {
          setFavoriteIds(new Set(ids));
        }
      } catch {
        if (mounted) {
          setFavoriteIds(new Set());
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    const destination = new URLSearchParams(location.search).get("destination");
    if (!destination) {
      return;
    }
    const normalizedDestination = normalizeWilayaValue(destination);
    if (!normalizedDestination) {
      return;
    }
    setLocationFilter(normalizedDestination);
    setAppliedLocationFilter(normalizedDestination);
  }, [location.search]);

  const toggleFavorite = async (listingId: number) => {
    if (!token) {
      return;
    }
    const alreadyFavorite = favoriteIds.has(listingId);
    try {
      if (alreadyFavorite) {
        await removeFavoriteApi(token, listingId);
        setFavoriteIds((current) => {
          const next = new Set(current);
          next.delete(listingId);
          return next;
        });
      } else {
        await addFavoriteApi(token, listingId);
        setFavoriteIds((current) => new Set([...current, listingId]));
      }
    } catch {
      // Keep previous state on API errors.
    }
  };

  const filteredActivities = useMemo(() => {
    return listings.filter((activity) => {
      const category = (activity.category ?? "").trim().toLowerCase();
      const details = parseDetails(activity.details);
      const level = normalizeDifficulty(asNonEmptyString(details?.level));
      const matchesType = selectedType === "tous" || category === selectedType;
      const matchesDifficulty = appliedDifficultyFilter === "all" || level === appliedDifficultyFilter;
      const matchesLocation = matchesWilaya(activity.location, appliedLocationFilter);
      return matchesType && matchesDifficulty && matchesLocation;
    });
  }, [appliedDifficultyFilter, appliedLocationFilter, listings, selectedType]);

  const applyFilters = () => {
    setAppliedLocationFilter(locationFilter);
    setAppliedDifficultyFilter(difficultyFilter);
  };

  const formatPrice = (value: number) => `${new Intl.NumberFormat(locale).format(Math.round(value))} DA`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <section className="relative text-white py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1521336575822-6da63fb45455?w=1600"
            alt="Activités en plein air"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl mb-4 text-white font-bold">{t("nav.activities")}</h1>
            <p className="text-lg text-white/90">{t("home.category.activities.description")}</p>
          </div>

          <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as ActivityTab)} className="w-full max-w-4xl mx-auto">
            <TabsList className="w-full bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-lg flex gap-1 overflow-x-auto justify-start">
              {activityTypes.map((type) => (
                <TabsTrigger
                  key={type.id}
                  value={type.id}
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(153,163,168)] data-[state=active]:to-[rgb(153,163,168)] data-[state=active]:text-white transition-all whitespace-nowrap px-4"
                >
                  <type.icon className="w-4 h-4 mr-2" />
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </section>

      <section className="bg-white border-b border-border sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t("activities.wherePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  {ALGERIA_WILAYAS.map((wilaya) => (
                    <SelectItem key={wilaya} value={wilaya}>
                      {wilaya}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-1">
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t("activities.difficultyPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="debutant">{t("activities.difficulty.easy")}</SelectItem>
                  <SelectItem value="intermediaire">{t("activities.difficulty.medium")}</SelectItem>
                  <SelectItem value="experimente">{t("activities.difficulty.hard")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="rounded-xl bg-primary hover:opacity-90 shadow-md" type="button" onClick={applyFilters}>
              <Search className="w-4 h-4 mr-2" />
              {t("activities.search")}
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-grow">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">{t("activities.title")}</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">{t("activities.loading")}</div>
        ) : filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">{t("activities.empty")}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredActivities.map((activity) => {
              const details = parseDetails(activity.details);
              const duration = asNonEmptyString(details?.duration);
              const level = asNonEmptyString(details?.level);
              const participantsMax = asPositiveNumber(details?.participantsMax);
              return (
                <Link
                  key={activity.id}
                  to={`/detail/${activity.id}`}
                  className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-border"
                >
                  <div className="relative h-60 overflow-hidden">
                    <ImageWithFallback
                      src={activity.images[0]?.url ?? "https://images.unsplash.com/photo-1654127655303-b955c3763777?w=600"}
                      alt={activity.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <button
                      type="button"
                      aria-label={t("activities.favoriteAria")}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void toggleFavorite(activity.id);
                      }}
                      className="absolute top-4 right-4 p-2.5 bg-white/95 rounded-full hover:bg-white transition-colors shadow-md cursor-pointer"
                    >
                      <Heart className={`w-5 h-5 ${favoriteIds.has(activity.id) ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"}`} />
                    </button>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <h4 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {activity.title}
                    </h4>

                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{activity.location}</span>
                    </div>

                    <div className="flex gap-4 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{duration ?? "-"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Compass className="w-4 h-4" />
                        <span>{level ?? "-"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{participantsMax ?? "-"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">
                          4.8 <span className="text-muted-foreground font-normal text-sm">({t("common.notAvailable")})</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">
                          {formatPrice(activity.price)}
                        </p>
                        <p className="text-xs text-muted-foreground">/ {activity.period ?? t("activities.perPerson")}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
