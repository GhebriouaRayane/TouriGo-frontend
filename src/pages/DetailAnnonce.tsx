import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { addFavoriteApi, ApiListing, ApiReview, createBookingApi, createReviewApi, getFavoriteIdsApi, getListingByIdApi, getListingReviewsApi, removeFavoriteApi } from "../lib/api";
import { makeTranslator } from "../i18n/localize";
import { Bath, BedDouble, Car, CheckCircle, ChevronLeft, ChevronRight, Clock3, Fuel, Gauge, Heart, MapPin, MessageCircle, Share2, Star, Users } from "lucide-react";

const DETAIL_TRANSLATIONS = {
  fr: {},
  en: {
    "WiFi haut débit": "High-speed WiFi",
    "Climatisation": "Air conditioning",
    "Cuisine équipée": "Equipped kitchen",
    "Machine à laver": "Washing machine",
    "Parking gratuit": "Free parking",
    "Terrasse": "Terrace",
    "Annonce introuvable": "Listing not found",
    "Impossible de charger l'annonce": "Unable to load listing",
    "Non renseigne": "Not specified",
    "Vehicule": "Vehicle",
    "Voyageurs": "Travelers",
    "2 voyageurs": "2 travelers",
    "Places disponibles": "Available seats",
    "Places": "Seats",
    "Participants": "Participants",
    "{count} places": "{count} seats",
    "{count} max": "{count} max",
    "{count} voyageurs": "{count} travelers",
    "Connectez-vous pour laisser un avis.": "Log in to leave a review.",
    "Vous ne pouvez pas laisser un avis sur votre propre annonce.": "You cannot review your own listing.",
    "Choisissez une note entre 1 et 5 etoiles.": "Choose a rating between 1 and 5 stars.",
    "Avis enregistre.": "Review saved.",
    "Erreur lors de l'envoi de l'avis.": "Error while sending review.",
    "Connectez-vous pour reserver cette annonce.": "Log in to book this listing.",
    "Vous ne pouvez pas reserver votre propre annonce.": "You cannot book your own listing.",
    "Le trajet propose au maximum {count} place(s).": "This ride offers up to {count} seat(s).",
    "La date ou l'heure de depart de ce trajet est invalide.": "This ride departure date or time is invalid.",
    "Choisissez une date de reservation.": "Choose a reservation date.",
    "Cette activite accepte au maximum {count} participant(s).": "This activity accepts up to {count} participant(s).",
    "Choisissez une date d'arrivee et de depart valides.": "Choose valid check-in and check-out dates.",
    "Cette annonce propose au maximum {count} chambre(s).": "This listing offers up to {count} room(s).",
    "Cette annonce accepte au maximum {count} personne(s).": "This listing accepts up to {count} person(s).",
    "Demande envoyee a l'hote. Vous recevrez une reponse apres validation.": "Request sent to the host. You will receive a response after validation.",
    "Erreur lors de la reservation.": "Error while booking.",
    "Chargement de l'annonce...": "Loading listing...",
    "Accueil": "Home",
    "Resultats": "Results",
    "Aucun avis": "No reviews",
    "Partager": "Share",
    "Retirer des favoris": "Remove from favorites",
    "Sauvegarder": "Save",
    "chambres disponibles": "rooms available",
    "lits": "beds",
    "doubles": "double",
    "simples": "single",
    "chambres": "rooms",
    "salles de bain": "bathrooms",
    "voyageurs": "travelers",
    "Depart": "Departure",
    "Destination": "Destination",
    "Matricule": "Plate",
    "Transmission": "Transmission",
    "Duree": "Duration",
    "Niveau": "Level",
    "Participants max": "Max participants",
    "A propos de cette annonce": "About this listing",
    "Aucune description detaillee n'a ete renseignee pour cette annonce.": "No detailed description has been provided for this listing.",
    "Details specifiques": "Specific details",
    "Inclus": "Included",
    "Avis clients": "Customer reviews",
    "{average} / 5 ({count} avis)": "{average} / 5 ({count} reviews)",
    "Aucun avis pour le moment.": "No reviews yet.",
    "Vous ne pouvez pas noter votre propre annonce.": "You cannot rate your own listing.",
    "Votre note": "Your rating",
    "{star} etoile": "{star} star",
    "{star} etoiles": "{star} stars",
    "Votre commentaire (optionnel)": "Your comment (optional)",
    "Publication...": "Publishing...",
    "Publier mon avis": "Publish my review",
    "Chargement des avis...": "Loading reviews...",
    "Soyez le premier a laisser un avis.": "Be the first to leave a review.",
    "Utilisateur #{id}": "User #{id}",
    "Aucun commentaire.": "No comment.",
    "Equipements": "Amenities",
    "Dates disponibles": "Available dates",
    "Aucune date specifique renseignee par l'hote.": "No specific date provided by the host.",
    "Votre hote": "Your host",
    "Hote 3ich": "3ich host",
    "Profil verifie": "Verified profile",
    "Tel": "Phone",
    "WhatsApp indisponible": "WhatsApp unavailable",
    "Date et heure disponibles": "Available date and time",
    "Places a reserver": "Seats to book",
    "Date": "Date",
    "Participants label": "Participants",
    "Arrivee": "Check-in",
    "Depart label": "Check-out",
    "Chambres label": "Rooms",
    "Personnes": "People",
    "Disponibilite": "Availability",
    "chambre(s)": "room(s)",
    "lit(s)": "bed(s)",
    "Reservation...": "Booking...",
    "Reserver maintenant": "Book now",
    "La date de depart doit etre apres l'arrivee.": "Check-out date must be after check-in.",
    "Total": "Total",
    "{price} × {count} place": "{price} × {count} seat",
    "{price} × {count} places": "{price} × {count} seats",
    "{price} × {count} participant": "{price} × {count} participant",
    "{price} × {count} participants": "{price} × {count} participants",
    "{price} × {nights} nuit × {rooms} chambre": "{price} × {nights} night × {rooms} room",
    "{price} × {nights} nuit × {rooms} chambres": "{price} × {nights} night × {rooms} rooms",
    "{price} × {nights} nuits × {rooms} chambre": "{price} × {nights} nights × {rooms} room",
    "{price} × {nights} nuits × {rooms} chambres": "{price} × {nights} nights × {rooms} rooms",
    "{price} × {nights} nuits": "{price} × {nights} nights",
    "Date et heure de depart": "Departure date and time",
    "Photo precedente": "Previous photo",
    "Photo suivante": "Next photo",
    "Voir localisation detaillee": "See detailed location",
    "Masquer localisation detaillee": "Hide detailed location",
    "Localisation detaillee": "Detailed location",
    "Chargement de la carte...": "Loading map...",
    "Impossible de localiser cette annonce sur la carte.": "Unable to locate this listing on the map.",
    "Ouvrir dans OpenStreetMap": "Open in OpenStreetMap",
  },
  ar: {
    "WiFi haut débit": "واي فاي عالي السرعة",
    "Climatisation": "تكييف",
    "Cuisine équipée": "مطبخ مجهز",
    "Machine à laver": "غسالة",
    "Parking gratuit": "موقف مجاني",
    "Terrasse": "شرفة",
    "Annonce introuvable": "الإعلان غير موجود",
    "Impossible de charger l'annonce": "تعذر تحميل الإعلان",
    "Non renseigne": "غير محدد",
    "Vehicule": "مركبة",
    "Voyageurs": "مسافرون",
    "2 voyageurs": "2 مسافرين",
    "Places disponibles": "المقاعد المتاحة",
    "Places": "مقاعد",
    "Participants": "المشاركون",
    "{count} places": "{count} مقاعد",
    "{count} max": "{count} كحد أقصى",
    "{count} voyageurs": "{count} مسافرين",
    "Connectez-vous pour laisser un avis.": "سجّل الدخول لترك تقييم.",
    "Vous ne pouvez pas laisser un avis sur votre propre annonce.": "لا يمكنك تقييم إعلانك الخاص.",
    "Choisissez une note entre 1 et 5 etoiles.": "اختر تقييمًا بين 1 و5 نجوم.",
    "Avis enregistre.": "تم حفظ التقييم.",
    "Erreur lors de l'envoi de l'avis.": "حدث خطأ أثناء إرسال التقييم.",
    "Connectez-vous pour reserver cette annonce.": "سجّل الدخول لحجز هذا الإعلان.",
    "Vous ne pouvez pas reserver votre propre annonce.": "لا يمكنك حجز إعلانك الخاص.",
    "Le trajet propose au maximum {count} place(s).": "توفر هذه الرحلة حتى {count} مقعد(مقاعد).",
    "La date ou l'heure de depart de ce trajet est invalide.": "تاريخ أو وقت الانطلاق لهذه الرحلة غير صالح.",
    "Choisissez une date de reservation.": "اختر تاريخ الحجز.",
    "Cette activite accepte au maximum {count} participant(s).": "يقبل هذا النشاط حتى {count} مشارك(مشاركين).",
    "Choisissez une date d'arrivee et de depart valides.": "اختر تاريخي وصول ومغادرة صالحين.",
    "Cette annonce propose au maximum {count} chambre(s).": "يوفر هذا الإعلان حتى {count} غرفة.",
    "Cette annonce accepte au maximum {count} personne(s).": "يقبل هذا الإعلان حتى {count} شخصًا.",
    "Demande envoyee a l'hote. Vous recevrez une reponse apres validation.": "تم إرسال الطلب إلى المضيف. ستتلقى ردًا بعد التأكيد.",
    "Erreur lors de la reservation.": "حدث خطأ أثناء الحجز.",
    "Chargement de l'annonce...": "جارٍ تحميل الإعلان...",
    "Accueil": "الرئيسية",
    "Resultats": "النتائج",
    "Aucun avis": "لا توجد تقييمات",
    "Partager": "مشاركة",
    "Retirer des favoris": "إزالة من المفضلة",
    "Sauvegarder": "حفظ",
    "chambres disponibles": "غرف متاحة",
    "lits": "أسرة",
    "doubles": "مزدوج",
    "simples": "مفرد",
    "chambres": "غرف",
    "salles de bain": "حمامات",
    "voyageurs": "مسافرون",
    "Depart": "الانطلاق",
    "Destination": "الوجهة",
    "Matricule": "رقم اللوحة",
    "Transmission": "ناقل الحركة",
    "Duree": "المدة",
    "Niveau": "المستوى",
    "Participants max": "الحد الأقصى للمشاركين",
    "A propos de cette annonce": "حول هذا الإعلان",
    "Aucune description detaillee n'a ete renseignee pour cette annonce.": "لم يتم توفير وصف مفصل لهذا الإعلان.",
    "Details specifiques": "تفاصيل إضافية",
    "Inclus": "يشمل",
    "Avis clients": "تقييمات العملاء",
    "{average} / 5 ({count} avis)": "{average} / 5 ({count} تقييمات)",
    "Aucun avis pour le moment.": "لا توجد تقييمات حاليًا.",
    "Vous ne pouvez pas noter votre propre annonce.": "لا يمكنك تقييم إعلانك الخاص.",
    "Votre note": "تقييمك",
    "{star} etoile": "{star} نجمة",
    "{star} etoiles": "{star} نجوم",
    "Votre commentaire (optionnel)": "تعليقك (اختياري)",
    "Publication...": "جارٍ النشر...",
    "Publier mon avis": "نشر تقييمي",
    "Chargement des avis...": "جارٍ تحميل التقييمات...",
    "Soyez le premier a laisser un avis.": "كن أول من يترك تقييمًا.",
    "Utilisateur #{id}": "مستخدم #{id}",
    "Aucun commentaire.": "لا يوجد تعليق.",
    "Equipements": "المرافق",
    "Dates disponibles": "التواريخ المتاحة",
    "Aucune date specifique renseignee par l'hote.": "لم يحدد المضيف تواريخ محددة.",
    "Votre hote": "مضيفك",
    "Hote 3ich": "مضيف 3ich",
    "Profil verifie": "ملف موثّق",
    "Tel": "الهاتف",
    "WhatsApp indisponible": "واتساب غير متاح",
    "Date et heure disponibles": "التاريخ والوقت المتاحان",
    "Places a reserver": "المقاعد المطلوب حجزها",
    "Date": "التاريخ",
    "Participants label": "المشاركون",
    "Arrivee": "الوصول",
    "Depart label": "المغادرة",
    "Chambres label": "الغرف",
    "Personnes": "الأشخاص",
    "Disponibilite": "التوفر",
    "chambre(s)": "غرفة/غرف",
    "lit(s)": "سرير/أسرة",
    "Reservation...": "جارٍ الحجز...",
    "Reserver maintenant": "احجز الآن",
    "La date de depart doit etre apres l'arrivee.": "يجب أن يكون تاريخ المغادرة بعد تاريخ الوصول.",
    "Total": "الإجمالي",
    "{price} × {count} place": "{price} × {count} مقعد",
    "{price} × {count} places": "{price} × {count} مقاعد",
    "{price} × {count} participant": "{price} × {count} مشارك",
    "{price} × {count} participants": "{price} × {count} مشاركين",
    "{price} × {nights} nuit × {rooms} chambre": "{price} × {nights} ليلة × {rooms} غرفة",
    "{price} × {nights} nuit × {rooms} chambres": "{price} × {nights} ليلة × {rooms} غرف",
    "{price} × {nights} nuits × {rooms} chambre": "{price} × {nights} ليالٍ × {rooms} غرفة",
    "{price} × {nights} nuits × {rooms} chambres": "{price} × {nights} ليالٍ × {rooms} غرف",
    "{price} × {nights} nuits": "{price} × {nights} ليالٍ",
    "Date et heure de depart": "تاريخ ووقت الانطلاق",
    "Photo precedente": "الصورة السابقة",
    "Photo suivante": "الصورة التالية",
    "Voir localisation detaillee": "عرض الموقع بالتفصيل",
    "Masquer localisation detaillee": "إخفاء الموقع التفصيلي",
    "Localisation detaillee": "الموقع التفصيلي",
    "Chargement de la carte...": "جارٍ تحميل الخريطة...",
    "Impossible de localiser cette annonce sur la carte.": "تعذر تحديد موقع هذا الإعلان على الخريطة.",
    "Ouvrir dans OpenStreetMap": "فتح في OpenStreetMap",
  },
} as const;

function parseDetails(details: string | null): Record<string, unknown> | null {
  if (!details) {
    return null;
  }
  try {
    return JSON.parse(details) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function asPositiveNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return null;
}

function asNumberInRange(value: unknown, min: number, max: number): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return null;
  }
  return parsed;
}

const DEFAULT_ALGERIA_BOUNDS = {
  west: -8.67,
  south: 18.96,
  east: 11.99,
  north: 37.12,
};

const DEFAULT_ALGERIA_CENTER = {
  latitude: 28.0339,
  longitude: 1.6596,
};

function buildDetailMapEmbedUrl(latitude?: number, longitude?: number): string {
  const hasMarker = Number.isFinite(latitude) && Number.isFinite(longitude);
  const bbox = hasMarker
    ? `${(longitude as number) - 0.08}%2C${(latitude as number) - 0.05}%2C${(longitude as number) + 0.08}%2C${(latitude as number) + 0.05}`
    : `${DEFAULT_ALGERIA_BOUNDS.west}%2C${DEFAULT_ALGERIA_BOUNDS.south}%2C${DEFAULT_ALGERIA_BOUNDS.east}%2C${DEFAULT_ALGERIA_BOUNDS.north}`;
  const marker = hasMarker ? `&marker=${latitude}%2C${longitude}` : "";
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}`;
}

function buildDetailMapExternalUrl(latitude?: number, longitude?: number, locationQuery?: string): string {
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;
  }
  const normalizedQuery = (locationQuery ?? "").trim();
  if (normalizedQuery) {
    return `https://www.openstreetmap.org/search?query=${encodeURIComponent(normalizedQuery)}`;
  }
  return `https://www.openstreetmap.org/#map=5/${DEFAULT_ALGERIA_CENTER.latitude}/${DEFAULT_ALGERIA_CENTER.longitude}`;
}

function parseAvailabilityDates(value: string | null): string[] {
  if (!value) {
    return [];
  }
  const normalized = value
    .split(",")
    .map((part) => part.trim())
    .filter((part) => /^\d{4}-\d{2}-\d{2}$/.test(part));
  return Array.from(new Set(normalized)).sort();
}

function formatOptionalIsoDate(value: string | null, locale: string): string | null {
  if (!value) {
    return null;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return isoDateToLocalDate(value).toLocaleDateString(locale);
}

function isoDateToLocalDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function localDateToIsoDate(dateValue: Date): string {
  const year = dateValue.getFullYear();
  const month = String(dateValue.getMonth() + 1).padStart(2, "0");
  const day = String(dateValue.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(isoDate: string, days: number): string {
  const source = isoDateToLocalDate(isoDate);
  source.setDate(source.getDate() + days);
  return localDateToIsoDate(source);
}

function localDateTimeToApiValue(value: Date): string {
  const datePart = localDateToIsoDate(value);
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  const seconds = String(value.getSeconds()).padStart(2, "0");
  return `${datePart}T${hours}:${minutes}:${seconds}`;
}

function buildCarpoolBookingWindow(departureDate: string | null, departureTime: string | null): { start: string; end: string } | null {
  if (!departureDate || !/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) {
    return null;
  }
  const [year, month, day] = departureDate.split("-").map(Number);
  const normalizedTime = (departureTime ?? "").trim();
  let hours = 0;
  let minutes = 0;
  let seconds = 0;

  if (normalizedTime.length > 0) {
    const timeMatch = normalizedTime.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (!timeMatch) {
      return null;
    }
    hours = Number(timeMatch[1]);
    minutes = Number(timeMatch[2]);
    seconds = timeMatch[3] ? Number(timeMatch[3]) : 0;
    if (
      !Number.isInteger(hours) ||
      !Number.isInteger(minutes) ||
      !Number.isInteger(seconds) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return null;
    }
  }

  const startDate = new Date(year, month - 1, day, hours, minutes, seconds, 0);
  if (Number.isNaN(startDate.getTime())) {
    return null;
  }
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  return {
    start: localDateTimeToApiValue(startDate),
    end: localDateTimeToApiValue(endDate),
  };
}

export default function DetailAnnonce() {
  const { id } = useParams();
  const [listing, setListing] = useState<ApiListing | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [bookingStartDate, setBookingStartDate] = useState(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + 2);
    return localDateToIsoDate(start);
  });
  const [bookingEndDate, setBookingEndDate] = useState(() => {
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    end.setDate(end.getDate() + 7);
    return localDateToIsoDate(end);
  });
  const [bookingSeatsRequested, setBookingSeatsRequested] = useState(1);
  const [bookingParticipantsRequested, setBookingParticipantsRequested] = useState(1);
  const [bookingRoomsRequested, setBookingRoomsRequested] = useState(1);
  const [bookingGuestsRequested, setBookingGuestsRequested] = useState(1);
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);
  const [reviewFormTouched, setReviewFormTouched] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLocationDetailsOpen, setIsLocationDetailsOpen] = useState(false);
  const [locationMapCoordinates, setLocationMapCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationMapLoading, setLocationMapLoading] = useState(false);
  const [locationMapError, setLocationMapError] = useState<string | null>(null);
  const { token, user } = useAuth();
  const { language, locale } = useLanguage();
  const tr = useMemo(() => makeTranslator(language, DETAIL_TRANSLATIONS), [language]);
  const defaultAmenities = useMemo(
    () => [
      tr("WiFi haut débit"),
      tr("Climatisation"),
      tr("Cuisine équipée"),
      tr("Machine à laver"),
      tr("Parking gratuit"),
      tr("Terrasse"),
    ],
    [tr]
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) {
        setLoading(false);
        setError(tr("Annonce introuvable"));
        return;
      }
      setLoading(true);
      try {
        const data = await getListingByIdApi(Number(id));
        if (mounted) {
          setListing(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : tr("Impossible de charger l'annonce"));
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
  }, [id, tr]);

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

  const isFavorite = listing ? favoriteIds.has(listing.id) : false;

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!listing?.id) {
        if (mounted) {
          setReviews([]);
          setLoadingReviews(false);
        }
        return;
      }
      setLoadingReviews(true);
      try {
        const data = await getListingReviewsApi(listing.id);
        if (mounted) {
          setReviews(data);
        }
      } catch {
        if (mounted) {
          setReviews([]);
        }
      } finally {
        if (mounted) {
          setLoadingReviews(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [listing?.id]);

  const toggleFavorite = async () => {
    if (!token || !listing) {
      return;
    }
    const alreadyFavorite = favoriteIds.has(listing.id);
    try {
      if (alreadyFavorite) {
        await removeFavoriteApi(token, listing.id);
        setFavoriteIds((current) => {
          const next = new Set(current);
          next.delete(listing.id);
          return next;
        });
      } else {
        await addFavoriteApi(token, listing.id);
        setFavoriteIds((current) => new Set([...current, listing.id]));
      }
    } catch {
      // Keep previous state on API errors.
    }
  };

  const images = useMemo(() => {
    if (!listing) {
      return [];
    }
    const fromApi = listing.images.map((image) => image.url);
    if (fromApi.length > 0) {
      return fromApi;
    }
    return ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"];
  }, [listing]);
  const selectedImage = images[selectedImageIndex] ?? images[0];
  const onPreviousImage = () => {
    if (images.length <= 1) {
      return;
    }
    setSelectedImageIndex((current) => (current === 0 ? images.length - 1 : current - 1));
  };
  const onNextImage = () => {
    if (images.length <= 1) {
      return;
    }
    setSelectedImageIndex((current) => (current === images.length - 1 ? 0 : current + 1));
  };

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [listing?.id]);

  useEffect(() => {
    setSelectedImageIndex((current) => {
      if (images.length === 0) {
        return 0;
      }
      return Math.min(current, images.length - 1);
    });
  }, [images.length]);

  const selectedStartDate = useMemo(() => isoDateToLocalDate(bookingStartDate), [bookingStartDate]);
  const selectedEndDate = useMemo(() => isoDateToLocalDate(bookingEndDate), [bookingEndDate]);
  const bookingRangeValid = selectedEndDate.getTime() > selectedStartDate.getTime();
  const nights = bookingRangeValid
    ? Math.max(1, Math.round((selectedEndDate.getTime() - selectedStartDate.getTime()) / 86400000))
    : 1;

  const parsedDetails = useMemo(() => {
    return parseDetails(listing?.details ?? null);
  }, [listing?.details]);

  const detailsGeoCoordinates = useMemo(() => {
    const raw = parsedDetails?.geo;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return null;
    }
    const asRecord = raw as Record<string, unknown>;
    const latitude =
      asNumberInRange(asRecord.latitude, -90, 90)
      ?? asNumberInRange(asRecord.lat, -90, 90);
    const longitude =
      asNumberInRange(asRecord.longitude, -180, 180)
      ?? asNumberInRange(asRecord.lon, -180, 180);
    if (latitude === null || longitude === null) {
      return null;
    }
    return { latitude, longitude };
  }, [parsedDetails]);

  const locationMapEmbedUrl = useMemo(
    () => buildDetailMapEmbedUrl(locationMapCoordinates?.latitude, locationMapCoordinates?.longitude),
    [locationMapCoordinates?.latitude, locationMapCoordinates?.longitude]
  );

  const locationMapExternalUrl = useMemo(
    () =>
      buildDetailMapExternalUrl(
        locationMapCoordinates?.latitude,
        locationMapCoordinates?.longitude,
        listing?.location ?? undefined
      ),
    [listing?.location, locationMapCoordinates?.latitude, locationMapCoordinates?.longitude]
  );

  useEffect(() => {
    setIsLocationDetailsOpen(false);
    setLocationMapLoading(false);
    setLocationMapError(null);
    setLocationMapCoordinates(detailsGeoCoordinates);
  }, [detailsGeoCoordinates, listing?.id]);

  useEffect(() => {
    if (!isLocationDetailsOpen || locationMapCoordinates) {
      return;
    }
    const query = (listing?.location ?? "").trim();
    if (!query) {
      setLocationMapError(tr("Impossible de localiser cette annonce sur la carte."));
      return;
    }

    const abortController = new AbortController();
    setLocationMapLoading(true);
    setLocationMapError(null);

    void (async () => {
      try {
        const params = new URLSearchParams({
          q: query,
          format: "jsonv2",
          countrycodes: "dz",
          limit: "1",
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          signal: abortController.signal,
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as Array<{ lat: string; lon: string }>;
        const first = Array.isArray(data) ? data[0] : undefined;
        const latitude = first ? Number(first.lat) : NaN;
        const longitude = first ? Number(first.lon) : NaN;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          setLocationMapError(tr("Impossible de localiser cette annonce sur la carte."));
          return;
        }
        setLocationMapCoordinates({ latitude, longitude });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setLocationMapError(tr("Impossible de localiser cette annonce sur la carte."));
      } finally {
        setLocationMapLoading(false);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [isLocationDetailsOpen, listing?.location, locationMapCoordinates, tr]);

  const availabilityDates = useMemo(
    () => parseAvailabilityDates(listing?.availability_dates ?? null),
    [listing?.availability_dates]
  );

  useEffect(() => {
    if (availabilityDates.length === 0) {
      return;
    }
    const start = availabilityDates[0];
    const end = availabilityDates.length > 1 ? availabilityDates[1] : addDays(start, 1);
    setBookingStartDate(start);
    setBookingEndDate(end);
  }, [availabilityDates]);

  const immobilierAmenities = useMemo(() => {
    if (!parsedDetails) {
      return [];
    }
    const raw = parsedDetails["amenities"];
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw
      .filter((value): value is string => typeof value === "string")
      .map((value) => value.trim())
      .filter((value) => value.length > 0);
  }, [parsedDetails]);

  const travelersCount = useMemo(() => {
    const value = asPositiveNumber(parsedDetails?.travelers);
    if (value !== null) {
      return value;
    }
    return Math.max(2, (listing?.bedrooms ?? 1) * 2);
  }, [listing?.bedrooms, parsedDetails]);

  const vehicleDetails = useMemo(
    () => ({
      brand: asNonEmptyString(parsedDetails?.brand),
      model: asNonEmptyString(parsedDetails?.model),
      year: asPositiveNumber(parsedDetails?.year),
      mileage: asPositiveNumber(parsedDetails?.mileage),
      fuel: asNonEmptyString(parsedDetails?.fuel),
      transmission: asNonEmptyString(parsedDetails?.transmission),
      seats: asPositiveNumber(parsedDetails?.seats),
    }),
    [parsedDetails]
  );

  const isCarpoolListing = useMemo(() => {
    if (!listing || listing.type !== "vehicule") {
      return false;
    }
    const detailsKind = asNonEmptyString(parsedDetails?.kind)?.toLowerCase();
    const category = (listing.category ?? "").trim().toLowerCase();
    return detailsKind === "covoiturage" || category === "covoiturage";
  }, [listing, parsedDetails]);
  const isImmobilierListing = listing?.type === "immobilier";
  const isHotelImmobilier = useMemo(() => {
    if (!isImmobilierListing) {
      return false;
    }
    const normalizedCategory = (listing?.category ?? "").trim().toLowerCase();
    return normalizedCategory === "hotel" || normalizedCategory === "hôtel";
  }, [isImmobilierListing, listing?.category]);
  const isActivityListing = listing?.type === "activite";

  const hotelBeds = useMemo(() => {
    if (!isHotelImmobilier) {
      return null;
    }
    const raw = parsedDetails?.hotelBeds;
    if (!raw || typeof raw !== "object") {
      return null;
    }
    const asRecord = raw as Record<string, unknown>;
    const double = asPositiveNumber(asRecord.double) ?? 0;
    const single = asPositiveNumber(asRecord.single) ?? 0;
    const total = asPositiveNumber(asRecord.total) ?? (double + single > 0 ? double + single : null);
    if (double <= 0 && single <= 0 && total === null) {
      return null;
    }
    return { double, single, total };
  }, [isHotelImmobilier, parsedDetails]);

  const carpoolDetails = useMemo(
    () => ({
      departureDate: asNonEmptyString(parsedDetails?.departure_date),
      departureTime: asNonEmptyString(parsedDetails?.departure_time),
      departurePlace: asNonEmptyString(parsedDetails?.departure_place),
      destination: asNonEmptyString(parsedDetails?.destination),
      passengersMax: asPositiveNumber(parsedDetails?.passengers_max) ?? asPositiveNumber(parsedDetails?.seats),
      plateNumber: asNonEmptyString(parsedDetails?.plate_number),
    }),
    [parsedDetails]
  );

  useEffect(() => {
    if (!isCarpoolListing) {
      return;
    }
    setBookingSeatsRequested((current) => {
      const normalized = Number.isFinite(current) ? Math.max(1, Math.floor(current)) : 1;
      if (carpoolDetails.passengersMax !== null) {
        return Math.min(normalized, carpoolDetails.passengersMax);
      }
      return normalized;
    });
  }, [carpoolDetails.passengersMax, isCarpoolListing]);

  const immobilierRoomsCapacity = useMemo(() => {
    if (!isImmobilierListing) {
      return null;
    }
    if (typeof listing?.bedrooms === "number" && listing.bedrooms > 0) {
      return listing.bedrooms;
    }
    if (isHotelImmobilier) {
      const hotelRoomsFromDetails = asPositiveNumber(parsedDetails?.hotelRoomsAvailable);
      if (hotelRoomsFromDetails !== null) {
        return hotelRoomsFromDetails;
      }
    }
    return null;
  }, [isHotelImmobilier, isImmobilierListing, listing?.bedrooms, parsedDetails]);

  const immobilierGuestsCapacity = useMemo(() => {
    if (!isImmobilierListing) {
      return null;
    }
    return travelersCount;
  }, [isImmobilierListing, travelersCount]);

  useEffect(() => {
    if (!isImmobilierListing) {
      return;
    }
    setBookingRoomsRequested((current) => {
      const normalized = Number.isFinite(current) ? Math.max(1, Math.floor(current)) : 1;
      if (immobilierRoomsCapacity !== null) {
        return Math.min(normalized, immobilierRoomsCapacity);
      }
      return normalized;
    });
    setBookingGuestsRequested((current) => {
      const normalized = Number.isFinite(current) ? Math.max(1, Math.floor(current)) : 1;
      if (immobilierGuestsCapacity !== null) {
        return Math.min(normalized, immobilierGuestsCapacity);
      }
      return normalized;
    });
  }, [immobilierGuestsCapacity, immobilierRoomsCapacity, isImmobilierListing]);

  const price = listing?.price ?? 0;
  const bookingUnits = isCarpoolListing
    ? bookingSeatsRequested
    : isActivityListing
      ? bookingParticipantsRequested
      : isImmobilierListing
        ? nights * bookingRoomsRequested
        : nights;
  const total = Math.round(price * bookingUnits);
  const formatDza = (value: number) => `${new Intl.NumberFormat(locale).format(Math.round(value))} DA`;
  const carpoolDepartureLabel = useMemo(() => {
    if (!carpoolDetails.departureDate) {
      return tr("Non renseigne");
    }
    const dateLabel = formatOptionalIsoDate(carpoolDetails.departureDate, locale) ?? carpoolDetails.departureDate;
    return `${dateLabel}${carpoolDetails.departureTime ? ` ${carpoolDetails.departureTime}` : ""}`;
  }, [carpoolDetails.departureDate, carpoolDetails.departureTime, locale, tr]);

  const activityDetails = useMemo(
    () => ({
      duration: asNonEmptyString(parsedDetails?.duration),
      level: asNonEmptyString(parsedDetails?.level),
      participantsMax: asPositiveNumber(parsedDetails?.participantsMax) ?? asPositiveNumber(parsedDetails?.participants_max),
      included: asNonEmptyString(parsedDetails?.included),
    }),
    [parsedDetails]
  );

  useEffect(() => {
    if (!isActivityListing) {
      return;
    }
    setBookingParticipantsRequested((current) => {
      const normalized = Number.isFinite(current) ? Math.max(1, Math.floor(current)) : 1;
      if (activityDetails.participantsMax !== null) {
        return Math.min(normalized, activityDetails.participantsMax);
      }
      return normalized;
    });
  }, [activityDetails.participantsMax, isActivityListing]);

  const vehicleTitle = useMemo(() => {
    const base = [vehicleDetails.brand, vehicleDetails.model].filter(Boolean).join(" ");
    if (!base) {
      return tr("Vehicule");
    }
    if (vehicleDetails.year !== null) {
      return `${base} (${vehicleDetails.year})`;
    }
    return base;
  }, [vehicleDetails.brand, vehicleDetails.model, vehicleDetails.year, tr]);

  const vehicleMileageLabel = useMemo(() => {
    if (vehicleDetails.mileage === null) {
      return "-";
    }
    return `${new Intl.NumberFormat(locale).format(vehicleDetails.mileage)} km`;
  }, [vehicleDetails.mileage, locale]);

  const bookingMeta = useMemo(() => {
    if (!listing) {
      return { label: tr("Voyageurs"), value: tr("2 voyageurs") };
    }
    if (listing.type === "vehicule" && isCarpoolListing) {
      return {
        label: tr("Places disponibles"),
        value: carpoolDetails.passengersMax !== null ? tr("{count} places", { count: carpoolDetails.passengersMax }) : tr("Non renseigne"),
      };
    }
    if (listing.type === "vehicule") {
      return {
        label: tr("Places"),
        value: vehicleDetails.seats !== null ? tr("{count} places", { count: vehicleDetails.seats }) : tr("Non renseigne"),
      };
    }
    if (listing.type === "activite") {
      return {
        label: tr("Participants"),
        value: activityDetails.participantsMax !== null ? tr("{count} max", { count: activityDetails.participantsMax }) : tr("Non renseigne"),
      };
    }
    return {
      label: tr("Voyageurs"),
      value: tr("{count} voyageurs", { count: travelersCount }),
    };
  }, [activityDetails.participantsMax, carpoolDetails.passengersMax, isCarpoolListing, listing, travelersCount, vehicleDetails.seats, tr]);

  const whatsappLink = useMemo(() => {
    const rawPhone = listing?.owner_phone_number;
    if (!rawPhone) {
      return null;
    }
    const digits = rawPhone.replace(/[^\d]/g, "");
    if (!digits) {
      return null;
    }
    const normalized = digits.startsWith("0") ? `213${digits.slice(1)}` : digits;
    return `https://wa.me/${normalized}`;
  }, [listing?.owner_phone_number]);

  const reviewStats = useMemo(() => {
    if (reviews.length === 0) {
      return { average: null as number | null, count: 0 };
    }
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return {
      average: totalRating / reviews.length,
      count: reviews.length,
    };
  }, [reviews]);

  useEffect(() => {
    setReviewFormTouched(false);
    setReviewRating(5);
    setReviewComment("");
    setReviewMessage(null);
  }, [listing?.id]);

  useEffect(() => {
    if (!user || reviewFormTouched) {
      return;
    }
    const myReview = reviews.find((review) => review.user_id === user.id);
    if (!myReview) {
      return;
    }
    setReviewRating(myReview.rating);
    setReviewComment(myReview.comment ?? "");
  }, [reviewFormTouched, reviews, user]);

  const onSubmitReview = async () => {
    if (!listing) {
      return;
    }
    if (!token) {
      setReviewMessage(tr("Connectez-vous pour laisser un avis."));
      return;
    }
    if (listing.owner_id && user?.id === listing.owner_id) {
      setReviewMessage(tr("Vous ne pouvez pas laisser un avis sur votre propre annonce."));
      return;
    }
    if (reviewRating < 1 || reviewRating > 5) {
      setReviewMessage(tr("Choisissez une note entre 1 et 5 etoiles."));
      return;
    }
    setReviewSubmitting(true);
    setReviewMessage(null);
    try {
      const savedReview = await createReviewApi(token, {
        listing_id: listing.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviews((current) => {
        const filtered = current.filter(
          (review) =>
            review.id !== savedReview.id &&
            !(review.user_id === savedReview.user_id && review.listing_id === savedReview.listing_id)
        );
        return [savedReview, ...filtered].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
      setReviewMessage(tr("Avis enregistre."));
    } catch (error) {
      setReviewMessage(error instanceof Error ? error.message : tr("Erreur lors de l'envoi de l'avis."));
    } finally {
      setReviewSubmitting(false);
    }
  };

  const onReserveNow = async () => {
    if (!listing) {
      return;
    }
    if (!token) {
      setBookingMessage(tr("Connectez-vous pour reserver cette annonce."));
      return;
    }
    if (listing.owner_id && user?.id === listing.owner_id) {
      setBookingMessage(tr("Vous ne pouvez pas reserver votre propre annonce."));
      return;
    }
    let startDatePayload = `${bookingStartDate}T00:00:00`;
    let endDatePayload = `${bookingEndDate}T00:00:00`;
    if (isCarpoolListing) {
      if (carpoolDetails.passengersMax !== null && bookingSeatsRequested > carpoolDetails.passengersMax) {
        setBookingMessage(tr("Le trajet propose au maximum {count} place(s).", { count: carpoolDetails.passengersMax }));
        return;
      }
      const bookingWindow = buildCarpoolBookingWindow(carpoolDetails.departureDate, carpoolDetails.departureTime);
      if (!bookingWindow) {
        setBookingMessage(tr("La date ou l'heure de depart de ce trajet est invalide."));
        return;
      }
      startDatePayload = bookingWindow.start;
      endDatePayload = bookingWindow.end;
    } else if (isActivityListing) {
      if (!bookingStartDate) {
        setBookingMessage(tr("Choisissez une date de reservation."));
        return;
      }
      if (activityDetails.participantsMax !== null && bookingParticipantsRequested > activityDetails.participantsMax) {
        setBookingMessage(
          tr("Cette activite accepte au maximum {count} participant(s).", { count: activityDetails.participantsMax })
        );
        return;
      }
      startDatePayload = `${bookingStartDate}T00:00:00`;
      endDatePayload = `${addDays(bookingStartDate, 1)}T00:00:00`;
    } else if (isImmobilierListing) {
      if (!bookingStartDate || !bookingEndDate || !bookingRangeValid) {
        setBookingMessage(tr("Choisissez une date d'arrivee et de depart valides."));
        return;
      }
      if (immobilierRoomsCapacity !== null && bookingRoomsRequested > immobilierRoomsCapacity) {
        setBookingMessage(tr("Cette annonce propose au maximum {count} chambre(s).", { count: immobilierRoomsCapacity }));
        return;
      }
      if (immobilierGuestsCapacity !== null && bookingGuestsRequested > immobilierGuestsCapacity) {
        setBookingMessage(tr("Cette annonce accepte au maximum {count} personne(s).", { count: immobilierGuestsCapacity }));
        return;
      }
    } else if (!bookingStartDate || !bookingEndDate || !bookingRangeValid) {
      setBookingMessage(tr("Choisissez une date d'arrivee et de depart valides."));
      return;
    }
    setBookingSubmitting(true);
    setBookingMessage(null);
    try {
      await createBookingApi(token, {
        listing_id: listing.id,
        start_date: startDatePayload,
        end_date: endDatePayload,
        seats_reserved: isCarpoolListing ? bookingSeatsRequested : isActivityListing ? bookingParticipantsRequested : undefined,
        rooms_reserved: isImmobilierListing ? bookingRoomsRequested : undefined,
        guests_reserved: isImmobilierListing ? bookingGuestsRequested : undefined,
      });
      setBookingMessage(tr("Demande envoyee a l'hote. Vous recevrez une reponse apres validation."));
    } catch (err) {
      setBookingMessage(err instanceof Error ? err.message : tr("Erreur lors de la reservation."));
    } finally {
      setBookingSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center">{tr("Chargement de l'annonce...")}</div>;
  }

  if (error || !listing) {
    return <div className="min-h-[70vh] flex items-center justify-center text-muted-foreground">{error ?? tr("Annonce introuvable")}</div>;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">{tr("Accueil")}</Link>
          <span>/</span>
          <Link to="/resultats" className="hover:text-primary">{tr("Resultats")}</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{listing.title}</span>
        </div>

        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">
                  {reviewStats.average !== null ? `${reviewStats.average.toFixed(1)} (${reviewStats.count})` : tr("Aucun avis")}
                </span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{listing.location}</span>
              </div>
            </div>
            <div className="mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setIsLocationDetailsOpen((current) => !current)}
              >
                <MapPin className="w-4 h-4 mr-2" />
                {isLocationDetailsOpen ? tr("Masquer localisation detaillee") : tr("Voir localisation detaillee")}
              </Button>
            </div>
            {isLocationDetailsOpen && (
              <div className="mt-3 w-full max-w-2xl rounded-2xl border border-border bg-white p-3 shadow-sm">
                <p className="mb-2 text-sm font-semibold">{tr("Localisation detaillee")}</p>
                {locationMapLoading && (
                  <p className="text-sm text-muted-foreground">{tr("Chargement de la carte...")}</p>
                )}
                {!locationMapLoading && locationMapError && (
                  <p className="text-sm text-muted-foreground">{locationMapError}</p>
                )}
                {locationMapCoordinates && (
                  <div className="h-64 overflow-hidden rounded-xl border border-border bg-muted/20">
                    <iframe
                      title={tr("Localisation detaillee")}
                      src={locationMapEmbedUrl}
                      className="h-full w-full"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="mt-2">
                  <a
                    href={locationMapExternalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-primary underline underline-offset-2"
                  >
                    {tr("Ouvrir dans OpenStreetMap")}
                  </a>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full">
              <Share2 className="w-4 h-4 mr-2" />
              {tr("Partager")}
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => void toggleFavorite()}>
              <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              {isFavorite ? tr("Retirer des favoris") : tr("Sauvegarder")}
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <div className="relative h-[300px] overflow-hidden rounded-2xl md:h-[500px]">
            <ImageWithFallback
              src={selectedImage}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={onPreviousImage}
                  aria-label={tr("Photo precedente")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/75"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={onNextImage}
                  aria-label={tr("Photo suivante")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white hover:bg-black/75"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div className="border-b border-border pb-8">
              <h2 className="text-2xl font-bold mb-4">{listing.category ?? listing.type}</h2>
              {listing.type === "immobilier" && (
                <div className="flex flex-wrap items-center gap-6 text-muted-foreground">
                  {isHotelImmobilier ? (
                    <>
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-5 h-5" />
                        <span>{immobilierRoomsCapacity ?? "-"} {tr("chambres disponibles")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BedDouble className="w-5 h-5" />
                        <span>
                          {hotelBeds?.total ?? "-"} {tr("lits")}
                          {hotelBeds ? ` (${hotelBeds.double} ${tr("doubles")}, ${hotelBeds.single} ${tr("simples")})` : ""}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <BedDouble className="w-5 h-5" />
                      <span>{listing.bedrooms ?? "-"} {tr("chambres")}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5" />
                    <span>{listing.bathrooms ?? "-"} {tr("salles de bain")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{travelersCount} {tr("voyageurs")}</span>
                  </div>
                </div>
              )}
              {listing.type === "vehicule" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                  {isCarpoolListing ? (
                    <>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        <span>{tr("Depart")}: {carpoolDetails.departurePlace ?? "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        <span>{tr("Destination")}: {carpoolDetails.destination ?? "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock3 className="w-5 h-5" />
                        <span>
                          {tr("Depart")}:{" "}
                          {carpoolDetails.departureDate
                            ? `${formatOptionalIsoDate(carpoolDetails.departureDate, locale)} ${carpoolDetails.departureTime ?? ""}`.trim()
                            : carpoolDetails.departureTime ?? "-"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span>{carpoolDetails.passengersMax !== null ? tr("{count} places", { count: carpoolDetails.passengersMax }) : "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Car className="w-5 h-5" />
                        <span>{tr("Matricule")}: {carpoolDetails.plateNumber ?? "-"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Car className="w-5 h-5" />
                        <span>{vehicleTitle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gauge className="w-5 h-5" />
                        <span>{vehicleMileageLabel}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Fuel className="w-5 h-5" />
                        <span>{vehicleDetails.fuel ?? "-"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <span>{vehicleDetails.seats !== null ? tr("{count} places", { count: vehicleDetails.seats }) : "-"}</span>
                      </div>
                    </>
                  )}
                  {!isCarpoolListing && vehicleDetails.transmission && (
                    <div className="flex items-center gap-2">
                      <Clock3 className="w-5 h-5" />
                      <span>{tr("Transmission")}: {vehicleDetails.transmission}</span>
                    </div>
                  )}
                </div>
              )}
              {listing.type === "activite" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock3 className="w-5 h-5" />
                    <span>{tr("Duree")}: {activityDetails.duration ?? "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    <span>{tr("Niveau")}: {activityDetails.level ?? "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    <span>{tr("Participants max")}: {activityDetails.participantsMax ?? "-"}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-b border-border pb-8">
              <h3 className="text-xl font-bold mb-4">{tr("A propos de cette annonce")}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {listing.description ?? tr("Aucune description detaillee n'a ete renseignee pour cette annonce.")}
              </p>
              {listing.details && !parsedDetails && (
                <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-border">
                  <h4 className="font-semibold mb-2">{tr("Details specifiques")}</h4>
                  <p className="text-muted-foreground whitespace-pre-line">{listing.details}</p>
                </div>
              )}
              {listing.type === "activite" && activityDetails.included && (
                <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-border">
                  <h4 className="font-semibold mb-2">{tr("Inclus")}</h4>
                  <p className="text-muted-foreground whitespace-pre-line">{activityDetails.included}</p>
                </div>
              )}
            </div>

            <div className="border-b border-border pb-8">
              <h3 className="text-xl font-bold mb-4">{tr("Avis clients")}</h3>
              <div className="mb-4 text-sm text-muted-foreground">
                {reviewStats.average !== null
                  ? tr("{average} / 5 ({count} avis)", { average: reviewStats.average.toFixed(1), count: reviewStats.count })
                  : tr("Aucun avis pour le moment.")}
              </div>

              {!token ? (
                <p className="mb-4 text-sm text-muted-foreground">{tr("Connectez-vous pour laisser un avis.")}</p>
              ) : listing.owner_id && user?.id === listing.owner_id ? (
                <p className="mb-4 text-sm text-muted-foreground">{tr("Vous ne pouvez pas noter votre propre annonce.")}</p>
              ) : (
                <div className="mb-6 rounded-2xl border border-border bg-gray-50 p-4 space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">{tr("Votre note")}</p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((starValue) => (
                        <button
                          key={starValue}
                          type="button"
                          onClick={() => {
                            setReviewFormTouched(true);
                            setReviewRating(starValue);
                          }}
                          className={`p-1 rounded-md hover:bg-white cursor-pointer transition-transform ${
                            starValue <= reviewRating ? "scale-110" : ""
                          }`}
                          aria-label={tr(starValue > 1 ? "{star} etoiles" : "{star} etoile", { star: starValue })}
                        >
                          <Star
                            className="w-6 h-6 transition-all"
                            fill={starValue <= reviewRating ? "#D4AF37" : "#FFFFFF"}
                            color={starValue <= reviewRating ? "#D4AF37" : "#FFFFFF"}
                            style={
                              starValue <= reviewRating
                                ? { filter: "drop-shadow(0 0 6px rgba(212, 175, 55, 0.6))" }
                                : { filter: "drop-shadow(0 0 2px rgba(0, 0, 0, 0.45))" }
                            }
                          />
                        </button>
                      ))}
                      <span className="text-sm text-muted-foreground">{reviewRating}/5</span>
                    </div>
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(event) => {
                      setReviewFormTouched(true);
                      setReviewComment(event.target.value);
                    }}
                    placeholder={tr("Votre commentaire (optionnel)")}
                    className="w-full p-2 rounded-lg border border-border bg-white min-h-20"
                  />
                  <Button
                    type="button"
                    onClick={() => void onSubmitReview()}
                    disabled={reviewSubmitting}
                    className="rounded-full"
                  >
                    {reviewSubmitting ? tr("Publication...") : tr("Publier mon avis")}
                  </Button>
                  {reviewMessage && <p className="text-sm text-muted-foreground">{reviewMessage}</p>}
                </div>
              )}

              {loadingReviews ? (
                <p className="text-sm text-muted-foreground">{tr("Chargement des avis...")}</p>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">{tr("Soyez le premier a laisser un avis.")}</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-border p-4 bg-white">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-semibold text-sm">
                          {review.user_full_name ?? tr("Utilisateur #{id}", { id: review.user_id })}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString(locale)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((starValue) => (
                          <Star
                            key={`${review.id}-${starValue}`}
                            className="w-4 h-4"
                            fill={starValue <= review.rating ? "#D4AF37" : "none"}
                            color={starValue <= review.rating ? "#D4AF37" : "#D1D5DB"}
                          />
                        ))}
                        <span className="ml-1 text-xs font-medium text-muted-foreground">{review.rating}/5</span>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {review.comment ?? tr("Aucun commentaire.")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {listing.type === "immobilier" && (
              <div className="border-b border-border pb-8">
                <h3 className="text-xl font-bold mb-4">{tr("Equipements")}</h3>
                <div className="grid grid-cols-2 gap-4">
                  {(immobilierAmenities.length > 0 ? immobilierAmenities : defaultAmenities).map((amenity) => (
                    <div key={amenity} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-b border-border pb-8">
              <h3 className="text-xl font-bold mb-4">{tr("Dates disponibles")}</h3>
              {availabilityDates.length === 0 ? (
                <p className="text-muted-foreground">{tr("Aucune date specifique renseignee par l'hote.")}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availabilityDates.map((availabilityDate) => (
                    <span key={availabilityDate} className="px-3 py-1 rounded-full bg-gray-100 border border-border text-sm">
                      {isoDateToLocalDate(availabilityDate).toLocaleDateString(locale)}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6">{tr("Votre hote")}</h3>
              <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-2xl border border-border">
                <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Karim" />
                  <AvatarFallback>KM</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-lg">{listing.owner_full_name ?? tr("Hote 3ich")}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{tr("Profil verifie")}</p>
                  {listing.owner_phone_number && (
                    <p className="text-sm text-muted-foreground mb-2">{tr("Tel")}: {listing.owner_phone_number}</p>
                  )}
                  {whatsappLink ? (
                    <a href={whatsappLink} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" className="rounded-full">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                    </a>
                  ) : (
                    <Button variant="outline" size="sm" className="rounded-full" disabled>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {tr("WhatsApp indisponible")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl shadow-2xl border border-border p-8">
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-3xl font-bold">{formatDza(price)}</span>
                <span className="text-muted-foreground">{listing.period ? `/ ${listing.period}` : ""}</span>
              </div>

              <div className="space-y-4 mb-8">
                {isCarpoolListing ? (
                  <>
                    <div className="border border-border rounded-xl p-3 bg-gray-50">
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">
                        {tr("Date et heure disponibles")}
                      </label>
                      <span className="text-sm font-medium">{carpoolDepartureLabel}</span>
                    </div>
                    <div className="border border-border rounded-xl p-3 bg-gray-50">
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{tr("Places a reserver")}</label>
                      <input
                        type="number"
                        min={1}
                        max={carpoolDetails.passengersMax ?? undefined}
                        value={bookingSeatsRequested}
                        onChange={(event) => {
                          const parsed = Number(event.target.value);
                          const normalized = Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
                          setBookingSeatsRequested(
                            carpoolDetails.passengersMax !== null
                              ? Math.min(normalized, carpoolDetails.passengersMax)
                              : normalized
                          );
                        }}
                        className="w-full text-sm font-medium bg-transparent focus:outline-none"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {bookingMeta.label}: {bookingMeta.value}
                      </p>
                    </div>
                  </>
                ) : isActivityListing ? (
                  <>
                    <div className="border border-border rounded-xl p-3 bg-gray-50">
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{tr("Date")}</label>
                      <input
                        type="date"
                        value={bookingStartDate}
                        onChange={(event) => {
                          const nextDate = event.target.value;
                          setBookingStartDate(nextDate);
                          if (nextDate) {
                            setBookingEndDate(addDays(nextDate, 1));
                          }
                        }}
                        className="w-full text-sm font-medium bg-transparent focus:outline-none"
                      />
                    </div>
                    <div className="border border-border rounded-xl p-3 bg-gray-50">
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{tr("Participants label")}</label>
                      <input
                        type="number"
                        min={1}
                        max={activityDetails.participantsMax ?? undefined}
                        value={bookingParticipantsRequested}
                        onChange={(event) => {
                          const parsed = Number(event.target.value);
                          const normalized = Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
                          setBookingParticipantsRequested(
                            activityDetails.participantsMax !== null
                              ? Math.min(normalized, activityDetails.participantsMax)
                              : normalized
                          );
                        }}
                        className="w-full text-sm font-medium bg-transparent focus:outline-none"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">{bookingMeta.label}: {bookingMeta.value}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="border border-border rounded-xl p-3 bg-gray-50">
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{tr("Arrivee")}</label>
                        <input
                          type="date"
                          value={bookingStartDate}
                          onChange={(event) => setBookingStartDate(event.target.value)}
                          className="w-full text-sm font-medium bg-transparent focus:outline-none"
                        />
                      </div>
                      <div className="border border-border rounded-xl p-3 bg-gray-50">
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{tr("Depart label")}</label>
                        <input
                          type="date"
                          value={bookingEndDate}
                          onChange={(event) => setBookingEndDate(event.target.value)}
                          className="w-full text-sm font-medium bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>
                    {isImmobilierListing && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="border border-border rounded-xl p-3 bg-gray-50">
                          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{tr("Chambres label")}</label>
                          <input
                            type="number"
                            min={1}
                            max={immobilierRoomsCapacity ?? undefined}
                            value={bookingRoomsRequested}
                            onChange={(event) => {
                              const parsed = Number(event.target.value);
                              const normalized = Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
                              setBookingRoomsRequested(
                                immobilierRoomsCapacity !== null
                                  ? Math.min(normalized, immobilierRoomsCapacity)
                                  : normalized
                              );
                            }}
                            className="w-full text-sm font-medium bg-transparent focus:outline-none"
                          />
                        </div>
                        <div className="border border-border rounded-xl p-3 bg-gray-50">
                          <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{tr("Personnes")}</label>
                          <input
                            type="number"
                            min={1}
                            max={immobilierGuestsCapacity ?? undefined}
                            value={bookingGuestsRequested}
                            onChange={(event) => {
                              const parsed = Number(event.target.value);
                              const normalized = Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1;
                              setBookingGuestsRequested(
                                immobilierGuestsCapacity !== null
                                  ? Math.min(normalized, immobilierGuestsCapacity)
                                  : normalized
                              );
                            }}
                            className="w-full text-sm font-medium bg-transparent focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                    {isHotelImmobilier && (
                      <div className="border border-border rounded-xl p-3 bg-gray-50">
                        <p className="text-xs text-muted-foreground">
                          {tr("Disponibilite")}: {immobilierRoomsCapacity ?? "-"} {tr("chambre(s)")} et {hotelBeds?.total ?? "-"} {tr("lit(s)")}
                        </p>
                      </div>
                    )}
                  </>
                )}
                {!isCarpoolListing && !isActivityListing && !isImmobilierListing && (
                  <div className="border border-border rounded-xl p-3 bg-gray-50">
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">{bookingMeta.label}</label>
                    <span className="text-sm font-medium">{bookingMeta.value}</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full rounded-xl bg-primary hover:opacity-90 py-6 text-lg font-bold shadow-lg"
                onClick={() => void onReserveNow()}
                disabled={bookingSubmitting}
              >
                {bookingSubmitting ? tr("Reservation...") : tr("Reserver maintenant")}
              </Button>
              {bookingMessage && <p className="mt-3 text-sm text-muted-foreground">{bookingMessage}</p>}
              {!isCarpoolListing && !isActivityListing && !bookingRangeValid && (
                <p className="mt-2 text-xs text-red-600">{tr("La date de depart doit etre apres l'arrivee.")}</p>
              )}

              <div className="mt-8 space-y-3 text-sm border-t border-border pt-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isCarpoolListing
                      ? tr(
                        bookingSeatsRequested > 1 ? "{price} × {count} places" : "{price} × {count} place",
                        { price: formatDza(price), count: bookingSeatsRequested }
                      )
                      : isActivityListing
                        ? tr(
                          bookingParticipantsRequested > 1 ? "{price} × {count} participants" : "{price} × {count} participant",
                          { price: formatDza(price), count: bookingParticipantsRequested }
                        )
                      : isImmobilierListing
                        ? tr(
                          nights > 1
                            ? (bookingRoomsRequested > 1
                              ? "{price} × {nights} nuits × {rooms} chambres"
                              : "{price} × {nights} nuits × {rooms} chambre")
                            : (bookingRoomsRequested > 1
                              ? "{price} × {nights} nuit × {rooms} chambres"
                              : "{price} × {nights} nuit × {rooms} chambre"),
                          { price: formatDza(price), nights, rooms: bookingRoomsRequested }
                        )
                        : tr("{price} × {nights} nuits", { price: formatDza(price), nights })}
                  </span>
                  <span className="font-medium">{formatDza(price * bookingUnits)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-border text-lg font-bold">
                  <span>{tr("Total")}</span>
                  <span>{formatDza(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
