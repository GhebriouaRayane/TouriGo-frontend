import { Button } from "./ui/button";
import { Search, Menu, User } from "lucide-react";
import logo from "../assets/9a08edf2d1705a725f9124e56803bea1d0396d59-DHUs9x5V.jpg";

export default function Navbar() {
  return (
    <nav className="w-full border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <img
              src={logo}
              alt="TouriGo Logo"
              className="h-12 w-auto"
            />
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Rechercher des maisons, voitures, activités..."
                className="w-full px-6 py-3 pr-12 rounded-full border border-border bg-white hover:shadow-md transition-shadow focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary hover:bg-primary/90 rounded-full transition-colors">
                <Search className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Center Navigation - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#home"
              className="text-foreground hover:text-primary transition-colors"
            >
              Accueil
            </a>
            <a
              href="#categories"
              className="text-foreground hover:text-primary transition-colors"
            >
              Catégories
            </a>
            <a
              href="#popular"
              className="text-foreground hover:text-primary transition-colors"
            >
              Populaires
            </a>
            <a
              href="#contact"
              className="text-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
          </div>

          {/* Right Side - Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="hover:bg-accent"
            >
              Connexion
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-white"
            >
              Inscription
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar - Mobile */}
        <div className="lg:hidden mt-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full px-4 py-2 pr-10 rounded-full border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-primary hover:bg-primary/90 rounded-full transition-colors">
              <Search className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
