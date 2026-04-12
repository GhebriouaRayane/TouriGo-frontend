import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Search, MapPin, BedDouble, Bath, Square, Star, Heart } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { addFavoriteApi, ApiListing, getFavoriteIdsApi, getListingsApi, removeFavoriteApi } from "../lib/api";
import { useLanguage } from "../context/LanguageContext";
import { ALGERIA_WILAYAS, matchesWilaya, normalizeWilayaValue } from "../constants/wilayas";

type RealEstateTab = "tous" | "appartement" | "maison" | "studio" | "hotel" | "cabanon";

export default function Immobilier() {
  const [selectedType, setSelectedType] = useState<RealEstateTab>("tous");
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

  const propertyTypes = [
    { id: "tous", label: t("realEstate.tab.allTypes") },
    { id: "appartement", label: t("common.apartment") },
    { id: "maison", label: t("common.house") },
    { id: "studio", label: t("common.studio") },
    { id: "hotel", label: t("common.hotel") },
    { id: "cabanon", label: t("common.cabin") },
  ] as const;

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getListingsApi({
          type: "immobilier",
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

  const filteredProperties = useMemo(() => {
    return listings.filter((property) => {
      const category = (property.category ?? "").trim().toLowerCase();
      const matchesType = selectedType === "tous" || category === selectedType;
      const matchesLocation = matchesWilaya(property.location, appliedLocationFilter);
      const matchesPrice =
        appliedPriceFilter === "all"
          ? true
          : appliedPriceFilter === "0-20000"
            ? property.price <= 20000
            : appliedPriceFilter === "20000-40000"
              ? property.price > 20000 && property.price <= 40000
              : property.price > 40000;

      return matchesType && matchesLocation && matchesPrice;
    });
  }, [appliedLocationFilter, appliedPriceFilter, listings, selectedType]);

  const applyFilters = () => {
    setAppliedLocationFilter(locationFilter);
    setAppliedPriceFilter(priceFilter);
  };

  const formatPrice = (value: number) => `${new Intl.NumberFormat(locale).format(Math.round(value))} DA`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <section className="relative text-white py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600"
            alt="Ville et immobilier"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl mb-4 text-white font-bold">{t("nav.realEstate")}</h1>
            <p className="text-lg text-white/90">{t("home.category.realEstate.description")}</p>
          </div>

          <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as RealEstateTab)} className="w-full max-w-5xl mx-auto">
            <TabsList className="w-full bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-lg flex gap-1 overflow-x-auto justify-start">
              {propertyTypes.map((type) => (
                <TabsTrigger
                  key={type.id}
                  value={type.id}
                  className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(153,163,168)] data-[state=active]:to-[rgb(153,163,168)] data-[state=active]:text-white transition-all whitespace-nowrap px-4"
                >
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
                  <SelectValue placeholder={t("realEstate.cityPlaceholder")} />
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
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t("realEstate.pricePlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="0-20000">0 - 20,000 DA</SelectItem>
                  <SelectItem value="20000-40000">20,000 - 40,000 DA</SelectItem>
                  <SelectItem value="40000+">40,000+ DA</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="rounded-xl bg-primary hover:opacity-90 shadow-md" type="button" onClick={applyFilters}>
              <Search className="w-4 h-4 mr-2" />
              {t("realEstate.search")}
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-grow">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">{t("realEstate.available")}</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">{t("realEstate.loading")}</div>
        ) : filteredProperties.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">{t("realEstate.empty")}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <Link
                key={property.id}
                to={`/detail/${property.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col border border-border"
              >
                <div className="relative h-56 overflow-hidden">
                  <ImageWithFallback
                    src={property.images[0]?.url ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600"}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    aria-label={t("realEstate.favoriteAria")}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void toggleFavorite(property.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/95 rounded-full hover:bg-white transition-colors shadow-md cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${favoriteIds.has(property.id) ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"}`} />
                  </button>
                </div>

                <div className="p-4 flex-grow">
                  <h4 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {property.title}
                  </h4>

                  <div className="flex items-center gap-1 text-muted-foreground text-sm mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{property.location}</span>
                  </div>

                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BedDouble className="w-4 h-4" />
                      <span>{property.bedrooms ?? "-"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Bath className="w-4 h-4" />
                      <span>{property.bathrooms ?? "-"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="w-4 h-4" />
                      <span>{property.area ?? "-"}m²</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        4.8 <span className="text-muted-foreground font-normal">({t("common.notAvailable")})</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {formatPrice(property.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">{property.period ? `/ ${property.period}` : ""}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="rounded-full px-8">
            {t("realEstate.loadMore")}
          </Button>
        </div>
      </div>
    </div>
  );
}
