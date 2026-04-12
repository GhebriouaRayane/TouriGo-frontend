import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Search, MapPin, Star, Heart, Fuel, Users, Gauge } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addFavoriteApi, ApiListing, getFavoriteIdsApi, getListingsApi, removeFavoriteApi } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";
import { ALGERIA_WILAYAS, matchesWilaya, normalizeWilayaValue } from "../constants/wilayas";

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

function formatOptionalIsoDate(value: string | null, locale: string): string | null {
  if (!value) {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(locale);
}

type VehicleTab = "location" | "covoiturage";

function normalizeVehicleCategory(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export default function Vehicules() {
  const [activeTab, setActiveTab] = useState<VehicleTab>("location");
  const [locationFilter, setLocationFilter] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [appliedLocationFilter, setAppliedLocationFilter] = useState("all");
  const [appliedPriceFilter, setAppliedPriceFilter] = useState("all");
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { t, locale } = useLanguage();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getListingsApi({
          type: "vehicule",
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

  const filteredVehicles = useMemo(() => {
    const byTab = listings.filter((vehicle) => {
      const category = normalizeVehicleCategory(vehicle.category);
      if (activeTab === "covoiturage") {
        return category === "covoiturage";
      }
      return category === "" || category === "location";
    });

    const byLocation = byTab.filter((vehicle) => {
      const details = parseDetails(vehicle.details);
      const departurePlace = asNonEmptyString(details?.departure_place) ?? "";
      const destination = asNonEmptyString(details?.destination) ?? "";
      return [vehicle.location, departurePlace, destination]
        .some((part) => matchesWilaya(part, appliedLocationFilter));
    });

    if (appliedPriceFilter === "all") {
      return byLocation;
    }
    if (appliedPriceFilter === "0-10000") {
      return byLocation.filter((vehicle) => vehicle.price <= 10000);
    }
    if (appliedPriceFilter === "10000-50000") {
      return byLocation.filter((vehicle) => vehicle.price > 10000 && vehicle.price <= 50000);
    }
    return byLocation.filter((vehicle) => vehicle.price > 50000);
  }, [activeTab, appliedLocationFilter, appliedPriceFilter, listings]);

  const applyFilters = () => {
    setAppliedLocationFilter(locationFilter);
    setAppliedPriceFilter(priceFilter);
  };

  const formatPrice = (value: number) => `${new Intl.NumberFormat(locale).format(Math.round(value))} DA`;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Tabs */}
      <section className="relative text-white py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=1600"
            alt="Véhicules sur la route"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl mb-4 text-white font-bold">{t("vehicles.pageTitle")}</h1>
            <p className="text-lg text-white/90">
              {t("vehicles.pageSubtitle")}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as VehicleTab)} className="w-full max-w-2xl mx-auto">
            <TabsList className="w-full grid grid-cols-2 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-lg">
              <TabsTrigger
                value="location"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(153,163,168)] data-[state=active]:to-[rgb(153,163,168)] data-[state=active]:text-white transition-all"
              >
                {t("vehicles.tab.rental")}
              </TabsTrigger>
              <TabsTrigger
                value="covoiturage"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(153,163,168)] data-[state=active]:to-[rgb(153,163,168)] data-[state=active]:text-white transition-all"
              >
                {t("vehicles.tab.carpool")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-white border-b border-border sticky top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t("vehicles.placePlaceholder")} />
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
              <select
                value={priceFilter}
                onChange={(event) => setPriceFilter(event.target.value)}
                className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">{t("vehicles.priceAll")}</option>
                <option value="0-10000">0 - 10,000 DA</option>
                <option value="10000-50000">10,000 - 50,000 DA</option>
                <option value="50000+">50,000+ DA</option>
              </select>
            </div>
            <Button className="sm:col-span-1 rounded-xl bg-primary hover:opacity-90 shadow-md" type="button" onClick={applyFilters}>
              <Search className="w-4 h-4 mr-2" />
              {t("vehicles.search")}
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">{t("vehicles.available", { count: filteredVehicles.length })}</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">{t("vehicles.loading")}</div>
        ) : filteredVehicles.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {activeTab === "covoiturage"
              ? t("vehicles.emptyCarpool")
              : t("vehicles.emptyRental")}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredVehicles.map((vehicle) => {
              const details = parseDetails(vehicle.details);
              const seats = asPositiveNumber(details?.seats);
              const mileage = asPositiveNumber(details?.mileage);
              const fuel = asNonEmptyString(details?.fuel);
              const isCarpool = normalizeVehicleCategory(vehicle.category) === "covoiturage";
              const departurePlace = asNonEmptyString(details?.departure_place);
              const destination = asNonEmptyString(details?.destination);
              const departureDate = formatOptionalIsoDate(asNonEmptyString(details?.departure_date), locale);
              const departureTime = asNonEmptyString(details?.departure_time);
              const passengersMax = asPositiveNumber(details?.passengers_max) ?? seats;
              const plateNumber = asNonEmptyString(details?.plate_number);
              const periodLabel = isCarpool ? null : (vehicle.period ?? t("vehicles.defaultPeriod"));
              return (
                <Link
                  key={vehicle.id}
                  to={`/detail/${vehicle.id}`}
                  className="group bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-border"
                >
                  <div className="relative h-60 overflow-hidden">
                    <ImageWithFallback
                      src={vehicle.images[0]?.url ?? "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?w=600"}
                      alt={vehicle.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <button
                      type="button"
                      aria-label={t("vehicles.favoriteAria")}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        void toggleFavorite(vehicle.id);
                      }}
                      className="absolute top-4 right-4 p-2.5 bg-white/95 rounded-full hover:bg-white transition-colors shadow-md cursor-pointer"
                    >
                      <Heart className={`w-5 h-5 ${favoriteIds.has(vehicle.id) ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"}`} />
                    </button>
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold uppercase">
                      {isCarpool ? t("vehicles.badgeCarpool") : t("vehicles.badgeRental")}
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col">
                    <h4 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {vehicle.title}
                    </h4>

                    <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{isCarpool ? `${departurePlace ?? "-"} -> ${destination ?? "-"}` : vehicle.location}</span>
                    </div>

                    <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>
                          {(isCarpool ? passengersMax : seats) !== null
                            ? t("vehicles.places", { count: isCarpool ? passengersMax ?? 0 : seats ?? 0 })
                            : "-"}
                        </span>
                      </div>
                      {!isCarpool && (
                        <>
                          <div className="flex items-center gap-1">
                            <Gauge className="w-4 h-4" />
                            <span className="text-xs">
                              {mileage !== null ? `${new Intl.NumberFormat(locale).format(mileage)} km` : "-"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Fuel className="w-4 h-4" />
                            <span>{fuel ?? "-"}</span>
                          </div>
                        </>
                      )}
                    </div>
                    {isCarpool && (
                      <div className="mb-6 space-y-1 text-xs text-muted-foreground">
                        <p>
                          {t("vehicles.depart")}:{" "}
                          {departureDate ? `${departureDate}${departureTime ? ` ${departureTime}` : ""}` : departureTime ?? "-"}
                        </p>
                        <p>{t("vehicles.plate")}: {plateNumber ?? "-"}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">
                          4.8 <span className="text-muted-foreground font-normal text-sm">({t("common.notAvailable")})</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-foreground">
                          {formatPrice(vehicle.price)}
                        </p>
                        {periodLabel && <p className="text-xs text-muted-foreground">/ {periodLabel}</p>}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="rounded-full px-8">
            {t("vehicles.loadMore")}
          </Button>
        </div>
      </div>
    </div>
  );
}
