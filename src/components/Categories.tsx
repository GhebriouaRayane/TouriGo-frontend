import { Home, Car, Sparkles } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export default function Categories() {
  const categories = [
    {
      icon: Home,
      iconColor: "text-[rgb(153,163,168)]",
      bgColor: "bg-[rgb(153,163,168)]/10",
      borderColor: "border-[rgb(153,163,168)]/20",
      hoverBg: "hover:bg-[rgb(153,163,168)]/5",
      title: "Immobilier",
      description: "Achetez, louez ou partagez votre logement.",
      image: "https://images.unsplash.com/photo-1757264119016-7e6b568b810d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjB2aWxsYSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU5Nzg1NTgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      icon: Car,
      iconColor: "text-[rgb(34,45,49)]",
      bgColor: "bg-[rgb(34,45,49)]/10",
      borderColor: "border-[rgb(34,45,49)]/20",
      hoverBg: "hover:bg-[rgb(34,45,49)]/5",
      title: "Véhicules",
      description: "Achetez ou louez voitures et bateaux.",
      image: "https://images.unsplash.com/photo-1614200179396-2bdb77ebf81b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBjYXJ8ZW58MXx8fHwxNzU5NjY3OTA2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      icon: Sparkles,
      iconColor: "text-[rgb(96,98,93)]",
      bgColor: "bg-[rgb(96,98,93)]/10",
      borderColor: "border-[rgb(96,98,93)]/20",
      hoverBg: "hover:bg-[rgb(96,98,93)]/5",
      title: "Activités",
      description: "Découvrez sorties et loisirs uniques.",
      image: "https://images.unsplash.com/photo-1620466459351-ddaaea83a653?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYXlha2luZyUyMGFkdmVudHVyZXxlbnwxfHx8fDE3NTk3ODU1ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ];

  return (
    <section id="categories" className="w-full py-20 bg-gradient-to-b from-[rgb(250,251,252)] to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="mb-4">Explorez nos catégories</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Que vous cherchiez un logement, un véhicule ou une aventure, TouriGo est votre plateforme tout-en-un.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={index}
                className={`group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border ${category.borderColor}`}
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  
                  {/* Icon Badge */}
                  <div className={`absolute top-4 left-4 w-14 h-14 ${category.bgColor} rounded-full flex items-center justify-center backdrop-blur-sm border-2 ${category.borderColor}`}>
                    <Icon className={`w-7 h-7 ${category.iconColor}`} />
                  </div>
                </div>

                {/* Content */}
                <div className={`p-6 ${category.hoverBg} transition-colors`}>
                  <h3 className="mb-3">{category.title}</h3>
                  <p className="text-muted-foreground">
                    {category.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}