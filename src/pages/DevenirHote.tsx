import { useState } from "react";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Home, Car, Palmtree, TrendingUp, Shield, Users, CheckCircle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function DevenirHote() {
  const navigate = useNavigate();
  const { isAuthenticated, user, becomeHost } = useAuth();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isAlreadyHost = user?.role === "host" || user?.role === "admin";

  const handleBecomeHost = async () => {
    if (!isAuthenticated) {
      navigate("/inscription?becomeHost=1");
      return;
    }
    if (isAlreadyHost) {
      setMessage(t("host.message.already"));
      navigate("/dashboard");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await becomeHost();
      setMessage(t("host.message.success"));
      navigate("/dashboard");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : t("host.message.error"));
    } finally {
      setSubmitting(false);
    }
  };

  const hostTypes = [
    {
      id: "immobilier",
      icon: Home,
      title: t("host.type.realEstate.title"),
      image: "https://images.unsplash.com/photo-1618237693938-0fbc85b93774?w=800",
      description: t("host.type.realEstate.description"),
      gradient: "from-[#00A6A6] to-[#004E64]",
      benefits: [
        t("host.type.realEstate.benefit1"),
        t("host.type.realEstate.benefit2"),
        t("host.type.realEstate.benefit3"),
      ],
    },
    {
      id: "vehicule",
      icon: Car,
      title: t("host.type.vehicle.title"),
      image: "https://images.unsplash.com/photo-1715260927356-9402f78e5032?w=800",
      description: t("host.type.vehicle.description"),
      gradient: "from-[#004E64] to-[#FF9E57]",
      benefits: [
        t("host.type.vehicle.benefit1"),
        t("host.type.vehicle.benefit2"),
        t("host.type.vehicle.benefit3"),
      ],
    },
    {
      id: "activite",
      icon: Palmtree,
      title: t("host.type.activity.title"),
      image: "https://images.unsplash.com/photo-1759069418542-ae707c59d2b8?w=800",
      description: t("host.type.activity.description"),
      gradient: "from-[#FFD9A0] to-[#00A6A6]",
      benefits: [
        t("host.type.activity.benefit1"),
        t("host.type.activity.benefit2"),
        t("host.type.activity.benefit3"),
      ],
    },
  ];

  const steps = [
    {
      number: "1",
      title: t("host.step1.title"),
      description: t("host.step1.description"),
    },
    {
      number: "2",
      title: t("host.step2.title"),
      description: t("host.step2.description"),
    },
    {
      number: "3",
      title: t("host.step3.title"),
      description: t("host.step3.description"),
    },
    {
      number: "4",
      title: t("host.step4.title"),
      description: t("host.step4.description"),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden py-16 sm:py-24">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1600"
            alt="Paysage pour devenir hote"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/65 to-black/55"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl mb-6 text-white font-bold">
            {t("host.hero.title")}
          </h1>
          <p className="text-xl sm:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
            {t("host.hero.subtitle")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Users className="w-8 h-8 text-white mb-3 mx-auto" />
              <div className="text-3xl font-bold mb-1 text-white">10,000+</div>
              <div className="text-white/80">{t("host.stat.hosts")}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <TrendingUp className="w-8 h-8 text-white mb-3 mx-auto" />
              <div className="text-3xl font-bold mb-1 text-white">2,5M DA</div>
              <div className="text-white/80">{t("host.stat.revenue")}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <Shield className="w-8 h-8 text-white mb-3 mx-auto" />
              <div className="text-3xl font-bold mb-1 text-white">100%</div>
              <div className="text-white/80">{t("host.stat.secure")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Host Types */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("host.types.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("host.types.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {hostTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-border"
                >
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={type.image}
                      alt={type.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <div className="absolute top-4 right-4 w-14 h-14 bg-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <Icon className="w-7 h-7 text-primary" />
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3">{type.title}</h3>
                    <p className="text-muted-foreground mb-4">{type.description}</p>
                    <ul className="space-y-2 mb-6">
                      {type.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      type="button"
                      onClick={handleBecomeHost}
                      disabled={submitting}
                      className="w-full rounded-xl bg-primary hover:opacity-90 shadow-md disabled:opacity-60"
                    >
                      {submitting ? t("host.button.activating") : t("host.button.start")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          {message && (
            <p className="mt-8 text-center text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="relative py-16 sm:py-20 border-y border-border overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1600"
            alt="Paysage Algérie"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/85"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("host.steps.title")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("host.steps.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white mb-4 text-2xl font-bold shadow-lg">
                  {step.number}
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              type="button"
              size="lg"
              onClick={handleBecomeHost}
              disabled={submitting}
              className="bg-primary hover:opacity-90 rounded-full px-10 shadow-lg disabled:opacity-60"
            >
              {submitting ? t("host.button.activating") : t("host.button.createListing")}
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 text-white text-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1600"
            alt="Maison confortable"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/65 to-black/55"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-white mb-6">{t("host.cta.title")}</h2>
          <p className="text-xl text-white/90 mb-10">{t("host.cta.subtitle")}</p>
          <Button
            type="button"
            size="lg"
            onClick={handleBecomeHost}
            disabled={submitting}
            className="bg-white text-primary hover:bg-white/90 rounded-full px-10 font-bold shadow-xl disabled:opacity-70"
          >
            {submitting ? t("host.button.activating") : t("host.button.createAccount")}
          </Button>
        </div>
      </section>
    </div>
  );
}
