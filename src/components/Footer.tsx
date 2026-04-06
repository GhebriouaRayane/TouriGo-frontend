import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import logo from "../assets/9a08edf2d1705a725f9124e56803bea1d0396d59.jpg";

export default function Footer() {
  const footerLinks = {
    company: [
      { name: "À propos", href: "#" },
      { name: "Carrières", href: "#" },
      { name: "Presse", href: "#" },
      { name: "Blog", href: "#" },
    ],
    support: [
      { name: "Centre d'aide", href: "#" },
      { name: "Sécurité", href: "#" },
      { name: "Conditions", href: "#" },
      { name: "Confidentialité", href: "#" },
    ],
    community: [
      { name: "Forum", href: "#" },
      { name: "Événements", href: "#" },
      { name: "Partenaires", href: "#" },
      { name: "Affiliés", href: "#" },
    ],
    hosting: [
      { name: "Devenir Hôte", href: "#" },
      { name: "Ressources", href: "#" },
      { name: "Conseils", href: "#" },
      { name: "Assurance", href: "#" },
    ],
  };

  return (
    <footer className="bg-gradient-to-b from-white to-[#FFF9F1] border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Logo and Description */}
          <div className="lg:col-span-1">
            <img
              src={logo}
              alt="TouriGo Logo"
              className="h-16 w-auto mb-4"
            />
            <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
              Votre plateforme de confiance pour l'immobilier, les véhicules et les activités en Algérie.
            </p>
            {/* Social Media */}
            <div className="flex gap-3">
              <a
                href="#"
                className="p-2 bg-[#00A6A6]/10 hover:bg-[#00A6A6]/20 rounded-full transition-colors"
              >
                <Facebook className="w-5 h-5 text-[#00A6A6]" />
              </a>
              <a
                href="#"
                className="p-2 bg-[#00A6A6]/10 hover:bg-[#00A6A6]/20 rounded-full transition-colors"
              >
                <Instagram className="w-5 h-5 text-[#00A6A6]" />
              </a>
              <a
                href="#"
                className="p-2 bg-[#00A6A6]/10 hover:bg-[#00A6A6]/20 rounded-full transition-colors"
              >
                <Twitter className="w-5 h-5 text-[#00A6A6]" />
              </a>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h4 className="mb-4">Entreprise</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4">Communauté</h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4">Hébergement</h4>
            <ul className="space-y-3">
              {footerLinks.hosting.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#00A6A6]/10 rounded-lg">
                <Mail className="w-5 h-5 text-[#00A6A6]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-sm">contact@tourigo.dz</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#00A6A6]/10 rounded-lg">
                <Phone className="w-5 h-5 text-[#00A6A6]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Téléphone</p>
                <p className="text-sm">+213 XX XX XX XX</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#00A6A6]/10 rounded-lg">
                <MapPin className="w-5 h-5 text-[#00A6A6]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Adresse</p>
                <p className="text-sm">Bejaia, Algérie</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2025 TouriGo. Tous droits réservés.
          </p>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Politique de confidentialité
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Conditions d'utilisation
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
