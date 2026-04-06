import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Search } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full h-[650px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1621680860205-c476fb092ad4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbGdlcmlhbiUyMGNvYXN0JTIwYmVhY2h8ZW58MXx8fHwxNzU5Nzg1NTgwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Côte algérienne"
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[rgb(34,45,49)]/70 via-[rgb(34,45,49)]/50 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-start justify-center h-full max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          <h1 className="text-white mb-6 text-5xl md:text-6xl lg:text-7xl leading-tight">
            Découvrez l'Algérie autrement
          </h1>
          <p className="text-white/95 mb-8 text-lg md:text-xl leading-relaxed">
            Trouvez votre maison de rêve, louez une voiture pour l'aventure, 
            ou explorez des activités uniques le long de la côte méditerranéenne.
          </p>
          
          <Button
            size="lg"
            className="bg-[rgb(153,163,168)] hover:bg-[rgb(153,163,168)]/90 text-white shadow-2xl px-10 py-7 text-lg rounded-full"
          >
            <Search className="w-5 h-5 mr-2" />
            Commencer l'exploration
          </Button>
        </div>
      </div>

      {/* Decorative wave shape at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          className="w-full h-16 md:h-24"
        >
          <path
            d="M0,0 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
            fill="rgb(250,251,252)"
          />
        </svg>
      </div>
    </section>
  );
}