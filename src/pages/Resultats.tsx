import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Search, SlidersHorizontal, MapPin, Star, Heart, List, Map as MapIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { addFavoriteApi, ApiListing, getFavoriteIdsApi, getListingsApi, removeFavoriteApi } from "../lib/api";
import { matchesWilaya, normalizeText, normalizeWilayaValue } from "../constants/wilayas";

function parseListingTypeFilter(value: string | null): ApiListing["type"] | null {
  if (value === "immobilier" || value === "vehicule" || value === "activite") {
    return value;
  }
  return null;
}

export default function Resultats() {
  const [showMap, setShowMap] = useState(true);
  const [sortBy, setSortBy] = useState("recommended");
  const location = useLocation();
  const [search, setSearch] = useState(() => new URLSearchParams(location.search).get("destination") ?? "");
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { t, locale } = useLanguage();
  const typeFilter = useMemo(
    () => parseListingTypeFilter(new URLSearchParams(location.search).get("type")),
    [location.search]
  );
  const destinationFilter = useMemo(
    () => normalizeWilayaValue(new URLSearchParams(location.search).get("destination") ?? ""),
    [location.search]
  );

  useEffect(() => {
    if (destinationFilter) {
      setSearch(destinationFilter);
    }
  }, [destinationFilter]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getListingsApi({
          type: typeFilter ?? undefined,
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
  }, [typeFilter]);

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

  const results = useMemo(() => {
    const normalizedSearch = normalizeText(search.trim());
    let data = listings;

    if (typeFilter) {
      data = data.filter((item) => item.type === typeFilter);
    }

    if (destinationFilter) {
      data = data.filter((item) => matchesWilaya(item.location, destinationFilter));
    }

    if (normalizedSearch) {
      data = data.filter(
        (item) =>
          normalizeText(item.title).includes(normalizedSearch)
          || normalizeText(item.location).includes(normalizedSearch)
      );
    }

    if (sortBy === "price-asc") {
      data = [...data].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      data = [...data].sort((a, b) => b.price - a.price);
    }
    return data;
  }, [destinationFilter, listings, search, sortBy, typeFilter]);

  const formatPrice = (value: number) => `${new Intl.NumberFormat(locale).format(Math.round(value))} DA`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Search Header */}
      <section className="bg-white border-b border-border sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("results.searchPlaceholder")}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="rounded-xl flex-1 sm:w-[180px]">
                  <SelectValue placeholder={t("results.sortPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">{t("results.sort.recommended")}</SelectItem>
                  <SelectItem value="price-asc">{t("results.sort.priceAsc")}</SelectItem>
                  <SelectItem value="price-desc">{t("results.sort.priceDesc")}</SelectItem>
                  <SelectItem value="rating">{t("results.sort.rating")}</SelectItem>
                  <SelectItem value="distance">{t("results.sort.distance")}</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="rounded-xl">
                <SlidersHorizontal className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{t("results.filters")}</span>
              </Button>

              <Button
                variant={showMap ? "default" : "outline"}
                size="sm"
                className="rounded-xl"
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? <List className="w-4 h-4" /> : <MapIcon className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-grow">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("results.count", { count: results.length })}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
          {/* Results List */}
          <div className={showMap ? "lg:col-span-1" : "lg:col-span-2"}>
            {loading ? (
              <div className="py-10 text-center text-muted-foreground">{t("results.loading")}</div>
            ) : results.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">{t("results.empty")}</div>
            ) : (
              <div className={`grid gap-6 ${showMap ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"}`}>
                  {results.map((result) => (
                <Link
                  key={result.id}
                  to={`/detail/${result.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-border"
                >
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <ImageWithFallback
                      src={result.images[0]?.url ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600"}
                      alt={result.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      aria-label={t("results.favoriteAria")}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void toggleFavorite(result.id);
                      }}
                      className="absolute top-3 right-3 p-2 bg-white/95 rounded-full hover:bg-white transition-colors shadow-md cursor-pointer"
                    >
                      <Heart className={`w-4 h-4 ${favoriteIds.has(result.id) ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"}`} />
                    </button>
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium">
                      {result.type}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-grow">
                    <h4 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {result.title}
                    </h4>

                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{result.location}</span>
                      <span className="ml-auto text-xs">· --</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border mt-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          4.8 <span className="text-muted-foreground font-normal">({t("common.notAvailable")})</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">
                          {formatPrice(result.price)}
                        </p>
                        <p className="text-xs text-muted-foreground">{result.period ? `/ ${result.period}` : ""}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              </div>
            )}

            <div className="text-center mt-8">
              <Button variant="outline" size="lg" className="rounded-full px-8">
                {t("results.showMore")}
              </Button>
            </div>
          </div>

          {/* Map View */}
          {showMap && (
            <div className="hidden lg:block lg:col-span-1 sticky top-[160px] h-[calc(100vh-200px)]">
              <div className="w-full h-full bg-gray-100 rounded-2xl border border-border overflow-hidden relative shadow-inner">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <MapIcon className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
                    <h3 className="mb-2 text-muted-foreground font-medium">{t("results.mapTitle")}</h3>
                    <p className="text-sm text-muted-foreground/70 max-w-xs">
                      {t("results.mapDescription")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
