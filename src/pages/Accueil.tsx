import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Search, Home, Car, Palmtree, MapPin, Calendar, Users, TrendingUp, Shield, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PopularListings from "../components/PopularListings";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { ALGERIA_WILAYAS, normalizeWilayaValue } from "../constants/wilayas";

// Hook: mark elements with class "reveal" as "visible" when they scroll into view
function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll(".reveal, .reveal-scale");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function Accueil() {
  const [activeTab, setActiveTab] = useState<"immobilier" | "vehicule" | "activite">("immobilier");
  const [destination, setDestination] = useState("");
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAuthenticated, user, loading } = useAuth();
  const isHost = user?.role === "host" || user?.role === "admin";
  const shouldShowBecomeHostCta = !loading && (!isAuthenticated || !isHost);

  useReveal();

  const categories = [
    {
      id: "immobilier",
      icon: Home,
      title: t("home.category.realEstate.title"),
      path: "/immobilier",
      image: "https://images.unsplash.com/photo-1618237693938-0fbc85b93774?w=800",
      description: t("home.category.realEstate.description"),
      gradient: "from-[rgb(153,163,168)] to-[rgb(34,45,49)]",
    },
    {
      id: "vehicules",
      icon: Car,
      title: t("home.category.vehicles.title"),
      path: "/vehicules",
      image: "https://images.unsplash.com/photo-1628468615047-c70ef9e36ad1?w=800",
      description: t("home.category.vehicles.description"),
      gradient: "from-[rgb(34,45,49)] to-[rgb(153,163,168)]",
    },
    {
      id: "activites",
      icon: Palmtree,
      title: t("home.category.activities.title"),
      path: "/activites",
      image: "https://images.unsplash.com/photo-1759069418542-ae707c59d2b8?w=800",
      description: t("home.category.activities.description"),
      gradient: "from-[rgb(224,190,156)] to-[rgb(96,98,93)]",
    },
  ];

  const handleSearch = () => {
    const targetPath =
      activeTab === "immobilier" ? "/immobilier" : activeTab === "vehicule" ? "/vehicules" : "/activites";

    const query = new URLSearchParams();
    const normalizedDestination = normalizeWilayaValue(destination);
    if (normalizedDestination) {
      query.set("destination", normalizedDestination);
    }
    const queryString = query.toString();
    navigate(queryString ? `${targetPath}?${queryString}` : targetPath);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1622104547694-574ff6207fe6?w=1600"
            alt="Algerian Mediterranean Coast"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[rgb(153,163,168)]/80 via-[rgb(34,45,49)]/70 to-[rgb(96,98,93)]/60"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 w-full">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl mb-4 sm:mb-6 font-bold animate-fade-in-up">
              {t("home.hero.title")}
            </h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              {t("home.hero.subtitle")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto animate-scale-in animation-delay-400">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "immobilier" | "vehicule" | "activite")} className="w-full">
              <TabsList className="w-full grid grid-cols-3 bg-white/95 backdrop-blur-md p-1 rounded-2xl mb-4 shadow-lg">
                <TabsTrigger
                  value="immobilier"
                  className="rounded-xl transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(153,163,168)] data-[state=active]:to-[rgb(153,163,168)] data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <Home className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{t("home.tabs.realEstate")}</span>
                  <span className="sm:hidden">{t("home.tabs.realEstateShort")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="vehicule"
                  className="rounded-xl transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(153,163,168)] data-[state=active]:to-[rgb(153,163,168)] data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <Car className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{t("home.tabs.vehicle")}</span>
                  <span className="sm:hidden">{t("home.tabs.vehicleShort")}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="activite"
                  className="rounded-xl transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(153,163,168)] data-[state=active]:to-[rgb(153,163,168)] data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  <Palmtree className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{t("home.tabs.activity")}</span>
                  <span className="sm:hidden">{t("home.tabs.activityShort")}</span>
                </TabsTrigger>
              </TabsList>

              <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6">
                <TabsContent value="immobilier" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border hover:border-primary/40 transition-colors">
                      <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <select
                        value={destination}
                        onChange={(event) => setDestination(event.target.value)}
                        className="bg-transparent outline-none w-full text-foreground"
                      >
                        <option value="">{t("home.input.selectCity")}</option>
                        {ALGERIA_WILAYAS.map((wilaya) => (
                          <option key={wilaya} value={wilaya}>
                            {wilaya}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border hover:border-primary/40 transition-colors">
                      <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <input
                        type="date"
                        placeholder={t("home.input.dates")}
                        className="bg-transparent outline-none w-full text-foreground"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      className="bg-primary hover:opacity-90 rounded-xl h-12 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      {t("home.input.search")}
                    </Button>
                  </div>
                </TabsContent>
                {/* Similar Content for other tabs */}
                <TabsContent value="vehicule" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border hover:border-primary/40 transition-colors">
                      <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <select
                        value={destination}
                        onChange={(event) => setDestination(event.target.value)}
                        className="bg-transparent outline-none w-full text-foreground"
                      >
                        <option value="">{t("home.input.selectCity")}</option>
                        {ALGERIA_WILAYAS.map((wilaya) => (
                          <option key={wilaya} value={wilaya}>
                            {wilaya}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border hover:border-primary/40 transition-colors">
                      <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <input
                        type="number" min="1"
                        placeholder={t("home.input.period")}
                        className="bg-transparent outline-none w-full text-foreground"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      className="bg-primary hover:opacity-90 rounded-xl h-12 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      {t("home.input.search")}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="activite" className="mt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border hover:border-primary/40 transition-colors">
                      <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <select
                        value={destination}
                        onChange={(event) => setDestination(event.target.value)}
                        className="bg-transparent outline-none w-full text-foreground"
                      >
                        <option value="">{t("home.input.selectCity")}</option>
                        {ALGERIA_WILAYAS.map((wilaya) => (
                          <option key={wilaya} value={wilaya}>
                            {wilaya}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border hover:border-primary/40 transition-colors">
                      <Users className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      <input
                        type="number"
                        placeholder={t("home.input.participants")}
                        className="bg-transparent outline-none w-full text-foreground"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      className="bg-primary hover:opacity-90 rounded-xl h-12 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                      <Search className="w-5 h-5 mr-2" />
                      {t("home.input.search")}
                    </Button>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 reveal">
            <h2 className="text-3xl font-bold mb-4">{t("home.categories.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("home.categories.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={cat.path}
                className="reveal group relative h-80 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
              >
                <ImageWithFallback
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl group-hover:bg-white/30 transition-colors duration-300">
                      <cat.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{cat.title}</h3>
                  </div>
                  <p className="text-white/80 line-clamp-2 group-hover:text-white/95 transition-colors duration-300">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PopularListings />

      {/* Benefits Section */}
      <section className="py-16 bg-gray-50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 stagger-children">
            <div className="reveal flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-border card-hover">
              <div className="p-3 bg-primary/10 rounded-2xl mb-4 animate-float" style={{ animationDelay: "0ms" }}>
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t("home.benefit.secure.title")}</h3>
              <p className="text-muted-foreground">{t("home.benefit.secure.description")}</p>
            </div>
            <div className="reveal flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-border card-hover">
              <div className="p-3 bg-primary/10 rounded-2xl mb-4 animate-float" style={{ animationDelay: "500ms" }}>
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t("home.benefit.support.title")}</h3>
              <p className="text-muted-foreground">{t("home.benefit.support.description")}</p>
            </div>
            <div className="reveal flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-border card-hover">
              <div className="p-3 bg-primary/10 rounded-2xl mb-4 animate-float" style={{ animationDelay: "1000ms" }}>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{t("home.benefit.price.title")}</h3>
              <p className="text-muted-foreground">{t("home.benefit.price.description")}</p>
            </div>
          </div>

          {shouldShowBecomeHostCta && (
            <div className="reveal mt-8 rounded-2xl border border-border bg-white p-6 sm:p-8 text-center shadow-sm">
              <h3 className="text-xl font-bold mb-2">{t("host.cta.title")}</h3>
              <p className="text-muted-foreground mb-4">{t("host.cta.subtitle")}</p>
              <Button asChild className="rounded-xl bg-primary hover:opacity-90 hover:shadow-md transition-all">
                <Link to="/devenir-hote">{t("nav.becomeHost")}</Link>
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
