import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import logo from "../assets/9a08edf2d1705a725f9124e56803bea1d0396d59.jpg";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

export default function FooterNew() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isHost = user?.role === "host" || user?.role === "admin";

  const footerSections = {
    about: [
      { name: t("footer.link.aboutTourigo"), path: "/a-propos" },
      { name: t("footer.link.howItWorks"), path: "/comment-ca-marche" },
      { name: t("footer.link.careers"), path: "/carrieres" },
      { name: t("footer.link.press"), path: "/presse" },
    ],
    support: [
      { name: t("footer.link.helpCenter"), path: "/centre-aide" },
      { name: t("footer.link.contact"), path: "/contact" },
      { name: t("footer.link.terms"), path: "/conditions-utilisation" },
      { name: t("footer.link.privacy"), path: "/politique-confidentialite" },
    ],
    hosting: [
      { name: t("footer.link.becomeHost"), path: "/devenir-hote" },
      { name: t("footer.link.publish"), path: "/devenir-hote" },
      { name: t("footer.link.hostResources"), path: "/ressources-hotes" },
      { name: t("footer.link.hostInsurance"), path: "/assurance-hote" },
    ],
    discover: [
      { name: t("footer.link.realEstate"), path: "/immobilier" },
      { name: t("footer.link.vehicles"), path: "/vehicules" },
      { name: t("footer.link.activities"), path: "/activites" },
      { name: t("footer.link.blog"), path: "/blog" },
    ],
  };

  const hostingLinks = isHost
    ? footerSections.hosting.filter((link) => link.path !== "/devenir-hote")
    : footerSections.hosting;

  return (
    <footer className="bg-gradient-to-b from-white to-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/">
              <img
                src={logo}
                alt="TouriGo Logo"
                className="h-14 w-auto mb-4 hover:opacity-80 transition-opacity"
              />
            </Link>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full transition-all">
                <Facebook className="w-4 h-4 text-primary" />
              </a>
              <a href="#" className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full transition-all">
                <Instagram className="w-4 h-4 text-primary" />
              </a>
              <a href="#" className="p-2 bg-primary/10 hover:bg-primary/20 rounded-full transition-all">
                <Twitter className="w-4 h-4 text-primary" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-4 font-bold">{t("footer.section.about")}</h4>
            <ul className="space-y-3">
              {footerSections.about.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold">{t("footer.section.support")}</h4>
            <ul className="space-y-3">
              {footerSections.support.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold">{t("footer.section.hosting")}</h4>
            <ul className="space-y-3">
              {hostingLinks.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-bold">{t("footer.section.discover")}</h4>
            <ul className="space-y-3">
              {footerSections.discover.map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("footer.contact.email")}</p>
                <a href="mailto:contact@tourigo.dz" className="text-sm hover:text-primary transition-colors font-medium">
                  contact@tourigo.dz
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("footer.contact.phone")}</p>
                <a href="tel:+21321000000" className="text-sm hover:text-primary transition-colors font-medium">
                  +213 21 00 00 00
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("footer.contact.address")}</p>
                <p className="text-sm font-medium">{t("footer.addressValue")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground justify-center md:justify-end">
            <Link to="/mentions-legales" className="hover:text-primary transition-colors">{t("footer.legal")}</Link>
            <Link to="/politique-cookies" className="hover:text-primary transition-colors">{t("footer.cookies")}</Link>
            <Link to="/plan-site" className="hover:text-primary transition-colors">{t("footer.sitemap")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
