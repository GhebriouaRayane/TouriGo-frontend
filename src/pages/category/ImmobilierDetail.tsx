import { Bath, BedDouble, Square, Users, CheckCircle } from "lucide-react";
import { useMemo } from "react";
import { ApiListing } from "../../lib/api";

type ImmobilierDetailProps = {
  listing: ApiListing;
  parsedDetails: Record<string, unknown> | null;
};

export default function ImmobilierDetail({ listing, parsedDetails }: ImmobilierDetailProps) {
  const travelersCount = useMemo(() => {
    if (!parsedDetails) {
      return Math.max(2, (listing?.bedrooms ?? 1) * 2);
    }
    const value = parsedDetails["travelers"];
    return typeof value === "number" && value > 0 ? value : Math.max(2, (listing?.bedrooms ?? 1) * 2);
  }, [listing?.bedrooms, parsedDetails]);

  const amenities = [
    "WiFi haut débit",
    "Climatisation",
    "Cuisine équipée",
    "Machine à laver",
    "Parking gratuit",
    "Terrasse",
  ];

  const immobilierAmenities = useMemo(() => {
    if (!parsedDetails) {
      return [];
    }
    const raw = parsedDetails["amenities"];
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.filter((value): value is string => typeof value === "string");
  }, [parsedDetails]);

  return (
    <>
      <div className="border-b border-border pb-8">
        <h2 className="text-2xl font-bold mb-4">{listing.category ?? listing.type}</h2>
        <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5" />
            <span>{listing.bedrooms ?? 0} chambres</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="w-5 h-5" />
            <span>{listing.bathrooms ?? 0} salles de bain</span>
          </div>
          <div className="flex items-center gap-2">
            <Square className="w-5 h-5" />
            <span>{listing.area ?? 0} m²</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>{travelersCount} voyageurs</span>
          </div>
        </div>
      </div>

      <div className="border-b border-border pb-8">
        <h3 className="text-xl font-bold mb-4">A propos de cette annonce</h3>
        <p className="text-muted-foreground leading-relaxed">
          {listing.description ?? "Aucune description detaillee n'a ete renseignee pour cette annonce."}
        </p>
        {listing.details && !parsedDetails && (
          <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-border">
            <h4 className="font-semibold mb-2">Details specifiques</h4>
            <p className="text-muted-foreground whitespace-pre-line">{listing.details}</p>
          </div>
        )}
      </div>

      <div className="border-b border-border pb-8">
        <h3 className="text-xl font-bold mb-4">Equipements</h3>
        <div className="grid grid-cols-2 gap-4">
          {(immobilierAmenities.length > 0 ? immobilierAmenities : amenities).map((amenity) => (
            <div key={amenity} className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>{amenity}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
