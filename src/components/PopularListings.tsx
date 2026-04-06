import { useEffect, useState } from "react";
import { Heart, Star, MapPin } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { addFavoriteApi, ApiListing, getFavoriteIdsApi, getListingsApi, removeFavoriteApi } from "../lib/api";

// Small hook to trigger reveal animations
function useRevealOnce() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal,.reveal-scale");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function PopularListings() {
  const [listings, setListings] = useState<ApiListing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const { t, locale } = useLanguage();

  useRevealOnce();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getListingsApi({ limit: 8 });
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

  const formatPrice = (value: number) =>
    `${new Intl.NumberFormat(locale).format(Math.round(value))} DA`;

  return (
    <section id="popular" className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="mb-2 text-3xl font-bold">{t("popular.title")}</h2>
            <p className="text-muted-foreground">
              {t("popular.subtitle")}
            </p>
          </div>
          <Link to="/resultats">
            <Button variant="outline" className="hidden sm:inline-flex rounded-full">
              {t("popular.seeAll")}
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">{t("popular.loading")}</div>
        ) : listings.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">{t("popular.empty")}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                to={`/detail/${listing.id}`}
                className="reveal group bg-white rounded-2xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <ImageWithFallback
                    src={listing.images[0]?.url ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"}
                    alt={listing.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <button
                    type="button"
                    aria-label={t("results.favoriteAria")}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void toggleFavorite(listing.id);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150"
                  >
                    <Heart className={`w-4 h-4 ${favoriteIds.has(listing.id) ? "fill-red-500 text-red-500" : "text-gray-600 hover:text-red-500"}`} />
                  </button>
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/95 rounded-full backdrop-blur-sm">
                    <span className="text-xs font-medium">{listing.type}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-grow flex flex-col">
                  <h4 className="font-semibold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {listing.title}
                  </h4>

                  <div className="flex items-center gap-1 text-muted-foreground mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-sm">{listing.location}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">
                        4.8 <span className="text-muted-foreground font-normal">(N/A)</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {formatPrice(listing.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">{listing.period ? `/ ${listing.period}` : ""}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12 sm:hidden">
          <Link to="/resultats">
            <Button variant="outline" className="w-full rounded-full">
              {t("popular.seeAllMobile")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
