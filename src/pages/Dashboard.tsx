import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Button } from "../components/ui/button";
import { Calendar as CalendarPicker } from "../components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import type { Locale } from "date-fns";
import type { DateRange } from "react-day-picker";
import { ar, enUS, fr } from "date-fns/locale";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import {
  ApiBooking,
  ApiListing,
  ApiMessage,
  ApiNotification,
  changePasswordApi,
  confirmBookingApi,
  cancelBookingApi,
  createListingApi,
  deleteListingApi,
  deleteMeApi,
  getBookingMessagesApi,
  getFavoriteListingsApi,
  getMyBookingsApi,
  getMyListingsApi,
  getNotificationsApi,
  getReceivedBookingsApi,
  markAllNotificationsReadApi,
  markNotificationReadApi,
  rejectBookingApi,
  sendBookingMessageApi,
  uploadAvatarApi,
  uploadListingImagesApi,
  updateListingApi,
  updateMeApi,
} from "../lib/api";
import { makeTranslator } from "../i18n/localize";
import { Bell, Calendar, Check, Heart, MapPin, MessageCircle, Plus, SendHorizontal, Settings, Star, X } from "lucide-react";

const DASHBOARD_TRANSLATIONS = {
  fr: {},
  en: {
    "WiFi haut debit": "High-speed WiFi",
    "Climatisation": "Air conditioning",
    "Cuisine equipee": "Equipped kitchen",
    "Machine a laver": "Washing machine",
    "Parking gratuit": "Free parking",
    "Terrasse": "Terrace",
    "Disponibilites (choisir une periode)": "Availability (choose a period)",
    "Aucune date selectionnee": "No date selected",
    "{count} jour(s) disponible(s)": "{count} day(s) available",
    "Effacer": "Clear",
    "Les anciennes disponibilites n'etaient pas continues. Choisissez une nouvelle periode pour les remplacer.": "Previous availability dates were not consecutive. Choose a new period to replace them.",
    "Hote": "Host",
    "Client": "Client",
    "En attente": "Pending",
    "Confirmee": "Confirmed",
    "Refusee": "Rejected",
    "Annulee": "Cancelled",
    "Terminee": "Completed",
    "Annonce mise a jour.": "Listing updated.",
    "Erreur lors de la mise a jour.": "Error while updating.",
    "Confirmer la suppression de cette annonce ?": "Confirm deletion of this listing?",
    "Annonce supprimee.": "Listing deleted.",
    "Erreur lors de la suppression.": "Error while deleting.",
    "Photo de profil importee. Pensez a enregistrer le profil.": "Profile photo uploaded. Remember to save your profile.",
    "Erreur lors de l'upload de la photo.": "Error while uploading photo.",
    "Profil mis a jour.": "Profile updated.",
    "Erreur de mise a jour du profil.": "Profile update error.",
    "La confirmation du nouveau mot de passe ne correspond pas.": "New password confirmation does not match.",
    "Mot de passe modifie.": "Password updated.",
    "Erreur lors du changement de mot de passe.": "Error while changing password.",
    "Pour un hotel, les chambres disponibles, les lits doubles, les lits simples et les salles de bain sont obligatoires.": "For a hotel, available rooms, double beds, single beds, and bathrooms are required.",
    "Pour un hotel, le nombre de chambres disponibles doit etre superieur a 0.": "For a hotel, available rooms must be greater than 0.",
    "Pour un hotel, le total des lits doit etre superieur a 0.": "For a hotel, total beds must be greater than 0.",
    "Pour l'immobilier, chambres, salles de bain et surface sont obligatoires.": "For real estate, bedrooms, bathrooms, and area are required.",
    "Pour un vehicule, la marque et le modele sont obligatoires.": "For a vehicle, brand and model are required.",
    "Pour un covoiturage, renseignez date/heure de depart, lieu de depart, destination, passagers et matricule.": "For carpooling, provide departure date/time, departure place, destination, passengers, and plate number.",
    "Pour une activite, la duree et le niveau sont obligatoires.": "For an activity, duration and level are required.",
    "Annonce creee avec succes.": "Listing created successfully.",
    "Erreur lors de la creation de l'annonce.": "Error while creating listing.",
    "Reservation confirmee.": "Booking confirmed.",
    "Reservation annulee.": "Booking cancelled.",
    "Erreur lors de la confirmation.": "Error while confirming booking.",
    "Erreur lors de l'annulation.": "Error while cancelling booking.",
    "Annulation...": "Cancelling...",
    "Motif du refus (optionnel):": "Reason for rejection (optional):",
    "Reservation refusee.": "Booking rejected.",
    "Erreur lors du refus.": "Error while rejecting booking.",
    "Ecrivez un message avant l'envoi.": "Write a message before sending.",
    "Message envoye.": "Message sent.",
    "Erreur lors de l'envoi du message.": "Error while sending message.",
    "Mon tableau de bord": "My dashboard",
    "Gere vos annonces, votre profil et vos interactions": "Manage your listings, profile, and interactions",
    "Devenir hote": "Become a host",
    "Reservations": "Bookings",
    "Mes annonces": "My listings",
    "Messages": "Messages",
    "Favoris": "Favorites",
    "Profil": "Profile",
    "Parametre": "Settings",
    "Supprimer mon compte": "Delete my account",
    "Vous etes sur de supprimer votre compte ?": "Are you sure you want to delete your account?",
    "Oui": "Yes",
    "Non": "No",
    "Le mot de passe est faux.": "Incorrect password.",
    "Veuillez saisir votre mot de passe.": "Please enter your password.",
    "Erreur lors de la suppression du compte.": "Error while deleting account.",
    "Mes reservations (client)": "My bookings (client)",
    "Chargement des reservations...": "Loading bookings...",
    "Aucune reservation pour le moment.": "No bookings for now.",
    "Du {start} au {end}": "From {start} to {end}",
    "Quantite reservee: {count}": "Reserved quantity: {count}",
    "Demandes recues (hote)": "Received requests (host)",
    "Chargement des demandes recues...": "Loading received requests...",
    "Aucune demande recue pour le moment.": "No received requests for now.",
    "Client: {name}": "Client: {name}",
    "Confirmer": "Confirm",
    "Refuser": "Reject",
    "Activez votre compte hote pour publier des annonces avec photos et details.": "Activate host mode to publish listings with photos and details.",
    "Activer le mode hote": "Activate host mode",
    "Ajouter une annonce": "Add listing",
    "Ajouter une nouvelle annonce": "Add a new listing",
    "Titre": "Title",
    "Immobilier": "Real estate",
    "Vehicule": "Vehicle",
    "Activite": "Activity",
    "Location": "Rental",
    "Covoiturage": "Carpool",
    "Categorie": "Category",
    "Localisation": "Location",
    "Carte": "Map",
    "Fermer la carte": "Hide map",
    "Carte de localisation": "Location map",
    "Saisissez une ville ou un lieu dans localisation pour centrer la carte.": "Type a city or place in location to center the map.",
    "Recherche sur la carte...": "Searching on the map...",
    "Localisation trouvee: {label}": "Location found: {label}",
    "Aucune position trouvee pour cette localisation.": "No matching position found for this location.",
    "Localisation exacte (carte Algerie)": "Exact location (Algeria map)",
    "Ajoutez latitude/longitude pour un point exact sur la carte.": "Add latitude/longitude for an exact point on the map.",
    "Utiliser ma position": "Use my location",
    "Ouvrir OpenStreetMap": "Open OpenStreetMap",
    "Carte Algerie": "Algeria map",
    "Latitude (optionnel)": "Latitude (optional)",
    "Longitude (optionnel)": "Longitude (optional)",
    "Prix": "Price",
    "Par nuit": "Per night",
    "Par mois": "Per month",
    "Periode (jour, semaine...)": "Period (day, week...)",
    "Nombre de chambres disponibles": "Number of available rooms",
    "Nombre de lits doubles": "Number of double beds",
    "Nombre de lits simples": "Number of single beds",
    "Total des lits": "Total beds",
    "Chambres": "Rooms",
    "Salles de bain": "Bathrooms",
    "Surface (m2)": "Area (m2)",
    "Description": "Description",
    "Voyageurs": "Travelers",
    "Nombre de voyageurs": "Number of travelers",
    "Equipements": "Amenities",
    "Lieu de depart": "Departure place",
    "Destination": "Destination",
    "Nombre de passagers": "Number of passengers",
    "Matricule": "Plate number",
    "Marque vehicule (optionnel)": "Vehicle brand (optional)",
    "Modele vehicule (optionnel)": "Vehicle model (optional)",
    "Marque": "Brand",
    "Modele": "Model",
    "Annee": "Year",
    "Kilometrage": "Mileage",
    "Carburant": "Fuel",
    "Transmission": "Transmission",
    "Places": "Seats",
    "Duree (ex: 2h)": "Duration (e.g. 2h)",
    "Participants max": "Max participants",
    "Inclus (materiel, guide, transport...)": "Included (equipment, guide, transport...)",
    "Photos de l'annonce": "Listing photos",
    "{count} image(s) selectionnee(s)": "{count} image(s) selected",
    "Upload des photos...": "Uploading photos...",
    "Publier l'annonce": "Publish listing",
    "Chargement des annonces...": "Loading listings...",
    "Vous n'avez pas encore publie d'annonce.": "You have not published any listing yet.",
    "Type:": "Type:",
    "Categorie:": "Category:",
    "Modifier": "Edit",
    "Suppression...": "Deleting...",
    "Supprimer": "Delete",
    "Voir": "View",
    "Periode": "Period",
    "Enregistrement...": "Saving...",
    "Enregistrer": "Save",
    "Annuler": "Cancel",
    "Annuler la reservation": "Cancel booking",
    "Notifications": "Notifications",
    "Tout lire": "Mark all read",
    "Chargement des notifications...": "Loading notifications...",
    "Aucune notification.": "No notifications.",
    "Lu": "Read",
    "Messagerie reservation": "Booking messages",
    "Aucune conversation": "No conversation",
    "Reservation #{id} - {title}": "Booking #{id} - {title}",
    "Chargement des messages...": "Loading messages...",
    "Aucun message pour cette reservation. Envoyez le premier message.": "No messages for this booking. Send the first one.",
    "Vous": "You",
    "Interlocuteur": "Contact",
    "Ecrire un message...": "Write a message...",
    "Envoi...": "Sending...",
    "Envoyer": "Send",
    "Chargement des favoris...": "Loading favorites...",
    "Vous n'avez pas encore de favoris": "You have no favorites yet",
    "Utilisateur 3ich": "3ich user",
    "Statut: {role}": "Status: {role}",
    "Informations du profil": "Profile information",
    "Email": "Email",
    "Nom complet": "Full name",
    "Telephone": "Phone",
    "Ou importer une photo": "Or upload a photo",
    "Upload en cours...": "Upload in progress...",
    "Enregistrer les modifications": "Save changes",
    "Changer le mot de passe": "Change password",
    "Mot de passe actuel": "Current password",
    "Nouveau mot de passe": "New password",
    "Confirmer le nouveau mot de passe": "Confirm new password",
    "Mettre a jour le mot de passe": "Update password",
    "Maison": "House",
    "Appartement": "Apartment",
    "Studio": "Studio",
    "Hotel": "Hotel",
    "Cabanon": "Cabin",
    "Nature": "Nature",
    "Nautique": "Water activities",
    "Culture": "Culture",
    "Debutant": "Beginner",
    "Intermediaire": "Intermediate",
    "Experimente": "Experienced",
    "Annonce #{id}": "Listing #{id}",
    "Utilisateur #{id}": "User #{id}",
    "Geolocalisation indisponible sur cet appareil.": "Geolocation is unavailable on this device.",
    "Impossible de recuperer votre position.": "Unable to retrieve your position.",
    "La geolocalisation precise necessite HTTPS ou localhost.": "Precise geolocation requires HTTPS or localhost.",
    "Permission de localisation refusee. Autorisez-la dans votre navigateur.": "Location permission denied. Please allow it in your browser.",
    "Position indisponible. Activez le GPS de votre appareil.": "Position unavailable. Enable your device GPS.",
    "Temps d'attente depasse pour la localisation.": "Location request timed out.",
    "Erreur geolocalisation: {message}": "Geolocation error: {message}",
    "Precision GPS faible ({meters} m). Verifiez votre GPS ou corrigez sur la carte.": "Low GPS accuracy ({meters} m). Check GPS or correct it on the map.",
    "Latitude et longitude doivent etre renseignees ensemble.": "Latitude and longitude must be provided together.",
    "Coordonnees invalides.": "Invalid coordinates.",
    "N/A": "N/A",
  },
  ar: {
    "WiFi haut debit": "واي فاي عالي السرعة",
    "Climatisation": "تكييف",
    "Cuisine equipee": "مطبخ مجهز",
    "Machine a laver": "غسالة",
    "Parking gratuit": "موقف مجاني",
    "Terrasse": "شرفة",
    "Disponibilites (choisir une periode)": "التوفر (اختر فترة)",
    "Aucune date selectionnee": "لم يتم اختيار أي تاريخ",
    "{count} jour(s) disponible(s)": "{count} يوم متاح",
    "Effacer": "مسح",
    "Les anciennes disponibilites n'etaient pas continues. Choisissez une nouvelle periode pour les remplacer.": "تواريخ التوفر السابقة لم تكن متتالية. اختر فترة جديدة لاستبدالها.",
    "Hote": "مضيف",
    "Client": "عميل",
    "En attente": "قيد الانتظار",
    "Confirmee": "مؤكدة",
    "Refusee": "مرفوضة",
    "Annulee": "ملغاة",
    "Terminee": "مكتملة",
    "Annonce mise a jour.": "تم تحديث الإعلان.",
    "Erreur lors de la mise a jour.": "حدث خطأ أثناء التحديث.",
    "Confirmer la suppression de cette annonce ?": "تأكيد حذف هذا الإعلان؟",
    "Annonce supprimee.": "تم حذف الإعلان.",
    "Erreur lors de la suppression.": "حدث خطأ أثناء الحذف.",
    "Photo de profil importee. Pensez a enregistrer le profil.": "تم رفع صورة الملف الشخصي. تذكّر حفظ الملف.",
    "Erreur lors de l'upload de la photo.": "حدث خطأ أثناء رفع الصورة.",
    "Profil mis a jour.": "تم تحديث الملف الشخصي.",
    "Erreur de mise a jour du profil.": "خطأ في تحديث الملف الشخصي.",
    "La confirmation du nouveau mot de passe ne correspond pas.": "تأكيد كلمة المرور الجديدة غير مطابق.",
    "Mot de passe modifie.": "تم تغيير كلمة المرور.",
    "Erreur lors du changement de mot de passe.": "حدث خطأ أثناء تغيير كلمة المرور.",
    "Pour un hotel, les chambres disponibles, les lits doubles, les lits simples et les salles de bain sont obligatoires.": "بالنسبة للفندق، عدد الغرف المتاحة والأسرة المزدوجة والمفردة والحمامات حقول إلزامية.",
    "Pour un hotel, le nombre de chambres disponibles doit etre superieur a 0.": "بالنسبة للفندق، يجب أن يكون عدد الغرف المتاحة أكبر من 0.",
    "Pour un hotel, le total des lits doit etre superieur a 0.": "بالنسبة للفندق، يجب أن يكون إجمالي الأسرّة أكبر من 0.",
    "Pour l'immobilier, chambres, salles de bain et surface sont obligatoires.": "بالنسبة للعقار، الغرف والحمامات والمساحة حقول إلزامية.",
    "Pour un vehicule, la marque et le modele sont obligatoires.": "بالنسبة للمركبة، العلامة والطراز حقول إلزامية.",
    "Pour un covoiturage, renseignez date/heure de depart, lieu de depart, destination, passagers et matricule.": "بالنسبة للمرافقة بالسيارة، أدخل تاريخ/وقت الانطلاق ومكان الانطلاق والوجهة والركاب ورقم اللوحة.",
    "Pour une activite, la duree et le niveau sont obligatoires.": "بالنسبة للنشاط، المدة والمستوى حقول إلزامية.",
    "Annonce creee avec succes.": "تم إنشاء الإعلان بنجاح.",
    "Erreur lors de la creation de l'annonce.": "حدث خطأ أثناء إنشاء الإعلان.",
    "Reservation confirmee.": "تم تأكيد الحجز.",
    "Reservation annulee.": "تم إلغاء الحجز.",
    "Erreur lors de la confirmation.": "حدث خطأ أثناء التأكيد.",
    "Erreur lors de l'annulation.": "حدث خطأ أثناء الإلغاء.",
    "Annulation...": "جارٍ الإلغاء...",
    "Motif du refus (optionnel):": "سبب الرفض (اختياري):",
    "Reservation refusee.": "تم رفض الحجز.",
    "Erreur lors du refus.": "حدث خطأ أثناء الرفض.",
    "Ecrivez un message avant l'envoi.": "اكتب رسالة قبل الإرسال.",
    "Message envoye.": "تم إرسال الرسالة.",
    "Erreur lors de l'envoi du message.": "حدث خطأ أثناء إرسال الرسالة.",
    "Mon tableau de bord": "لوحة التحكم الخاصة بي",
    "Gere vos annonces, votre profil et vos interactions": "أدر إعلاناتك وملفك الشخصي وتفاعلاتك",
    "Devenir hote": "أصبح مضيفًا",
    "Reservations": "الحجوزات",
    "Mes annonces": "إعلاناتي",
    "Messages": "الرسائل",
    "Favoris": "المفضلة",
    "Profil": "الملف الشخصي",
    "Parametre": "الإعدادات",
    "Supprimer mon compte": "حذف حسابي",
    "Vous etes sur de supprimer votre compte ?": "هل أنت متأكد من حذف حسابك؟",
    "Oui": "نعم",
    "Non": "لا",
    "Le mot de passe est faux.": "كلمة المرور غير صحيحة.",
    "Veuillez saisir votre mot de passe.": "يرجى إدخال كلمة المرور.",
    "Erreur lors de la suppression du compte.": "حدث خطأ أثناء حذف الحساب.",
    "Mes reservations (client)": "حجوزاتي (عميل)",
    "Chargement des reservations...": "جارٍ تحميل الحجوزات...",
    "Aucune reservation pour le moment.": "لا توجد حجوزات حاليًا.",
    "Du {start} au {end}": "من {start} إلى {end}",
    "Quantite reservee: {count}": "الكمية المحجوزة: {count}",
    "Demandes recues (hote)": "الطلبات المستلمة (مضيف)",
    "Chargement des demandes recues...": "جارٍ تحميل الطلبات المستلمة...",
    "Aucune demande recue pour le moment.": "لا توجد طلبات مستلمة حاليًا.",
    "Client: {name}": "العميل: {name}",
    "Confirmer": "تأكيد",
    "Refuser": "رفض",
    "Activez votre compte hote pour publier des annonces avec photos et details.": "فعّل حساب المضيف لنشر إعلانات مع الصور والتفاصيل.",
    "Activer le mode hote": "تفعيل وضع المضيف",
    "Ajouter une annonce": "إضافة إعلان",
    "Ajouter une nouvelle annonce": "إضافة إعلان جديد",
    "Titre": "العنوان",
    "Immobilier": "عقار",
    "Vehicule": "مركبة",
    "Activite": "نشاط",
    "Location": "إيجار",
    "Covoiturage": "مرافقة بالسيارة",
    "Categorie": "الفئة",
    "Localisation": "الموقع",
    "Carte": "الخريطة",
    "Fermer la carte": "إخفاء الخريطة",
    "Carte de localisation": "خريطة الموقع",
    "Saisissez une ville ou un lieu dans localisation pour centrer la carte.": "اكتب مدينة أو مكانًا في حقل الموقع لتمركز الخريطة عليه.",
    "Recherche sur la carte...": "جارٍ البحث على الخريطة...",
    "Localisation trouvee: {label}": "تم العثور على الموقع: {label}",
    "Aucune position trouvee pour cette localisation.": "لم يتم العثور على موقع مطابق لهذه الوجهة.",
    "Localisation exacte (carte Algerie)": "الموقع الدقيق (خريطة الجزائر)",
    "Ajoutez latitude/longitude pour un point exact sur la carte.": "أضف خط العرض/خط الطول لتحديد نقطة دقيقة على الخريطة.",
    "Utiliser ma position": "استخدام موقعي",
    "Ouvrir OpenStreetMap": "فتح OpenStreetMap",
    "Carte Algerie": "خريطة الجزائر",
    "Latitude (optionnel)": "خط العرض (اختياري)",
    "Longitude (optionnel)": "خط الطول (اختياري)",
    "Prix": "السعر",
    "Par nuit": "لكل ليلة",
    "Par mois": "شهريًا",
    "Periode (jour, semaine...)": "الفترة (يوم، أسبوع...)",
    "Nombre de chambres disponibles": "عدد الغرف المتاحة",
    "Nombre de lits doubles": "عدد الأسرّة المزدوجة",
    "Nombre de lits simples": "عدد الأسرّة المفردة",
    "Total des lits": "إجمالي الأسرّة",
    "Chambres": "الغرف",
    "Salles de bain": "الحمامات",
    "Surface (m2)": "المساحة (م²)",
    "Description": "الوصف",
    "Voyageurs": "المسافرون",
    "Nombre de voyageurs": "عدد المسافرين",
    "Equipements": "المرافق",
    "Lieu de depart": "مكان الانطلاق",
    "Destination": "الوجهة",
    "Nombre de passagers": "عدد الركاب",
    "Matricule": "رقم اللوحة",
    "Marque vehicule (optionnel)": "علامة المركبة (اختياري)",
    "Modele vehicule (optionnel)": "طراز المركبة (اختياري)",
    "Marque": "العلامة التجارية",
    "Modele": "الطراز",
    "Annee": "السنة",
    "Kilometrage": "عدد الكيلومترات",
    "Carburant": "الوقود",
    "Transmission": "ناقل الحركة",
    "Places": "المقاعد",
    "Duree (ex: 2h)": "المدة (مثال: 2س)",
    "Participants max": "الحد الأقصى للمشاركين",
    "Inclus (materiel, guide, transport...)": "المتضمن (معدات، دليل، نقل...)",
    "Photos de l'annonce": "صور الإعلان",
    "{count} image(s) selectionnee(s)": "تم اختيار {count} صورة",
    "Upload des photos...": "جارٍ رفع الصور...",
    "Publier l'annonce": "نشر الإعلان",
    "Chargement des annonces...": "جارٍ تحميل الإعلانات...",
    "Vous n'avez pas encore publie d'annonce.": "لم تنشر أي إعلان بعد.",
    "Type:": "النوع:",
    "Categorie:": "الفئة:",
    "Modifier": "تعديل",
    "Suppression...": "جارٍ الحذف...",
    "Supprimer": "حذف",
    "Voir": "عرض",
    "Periode": "الفترة",
    "Enregistrement...": "جارٍ الحفظ...",
    "Enregistrer": "حفظ",
    "Annuler": "إلغاء",
    "Annuler la reservation": "إلغاء الحجز",
    "Notifications": "الإشعارات",
    "Tout lire": "تحديد الكل كمقروء",
    "Chargement des notifications...": "جارٍ تحميل الإشعارات...",
    "Aucune notification.": "لا توجد إشعارات.",
    "Lu": "مقروء",
    "Messagerie reservation": "مراسلة الحجز",
    "Aucune conversation": "لا توجد محادثة",
    "Reservation #{id} - {title}": "الحجز #{id} - {title}",
    "Chargement des messages...": "جارٍ تحميل الرسائل...",
    "Aucun message pour cette reservation. Envoyez le premier message.": "لا توجد رسائل لهذا الحجز. أرسل أول رسالة.",
    "Vous": "أنت",
    "Interlocuteur": "الطرف الآخر",
    "Ecrire un message...": "اكتب رسالة...",
    "Envoyer": "إرسال",
    "Envoi...": "جارٍ الإرسال...",
    "Chargement des favoris...": "جارٍ تحميل المفضلة...",
    "Vous n'avez pas encore de favoris": "ليس لديك عناصر مفضلة بعد",
    "Utilisateur 3ich": "مستخدم 3ich",
    "Statut: {role}": "الحالة: {role}",
    "Informations du profil": "معلومات الملف الشخصي",
    "Ou importer une photo": "أو ارفع صورة",
    "Upload en cours...": "جارٍ الرفع...",
    "Enregistrer les modifications": "حفظ التعديلات",
    "Changer le mot de passe": "تغيير كلمة المرور",
    "Mettre a jour le mot de passe": "تحديث كلمة المرور",
    "Email": "البريد الإلكتروني",
    "Nom complet": "الاسم الكامل",
    "Telephone": "الهاتف",
    "Mot de passe actuel": "كلمة المرور الحالية",
    "Nouveau mot de passe": "كلمة المرور الجديدة",
    "Confirmer le nouveau mot de passe": "تأكيد كلمة المرور الجديدة",
    "Maison": "منزل",
    "Appartement": "شقة",
    "Studio": "استوديو",
    "Hotel": "فندق",
    "Cabanon": "كوخ",
    "Nature": "طبيعة",
    "Nautique": "أنشطة مائية",
    "Culture": "ثقافة",
    "Debutant": "مبتدئ",
    "Intermediaire": "متوسط",
    "Experimente": "متقدم",
    "Annonce #{id}": "إعلان #{id}",
    "Utilisateur #{id}": "مستخدم #{id}",
    "Geolocalisation indisponible sur cet appareil.": "خدمة تحديد الموقع غير متاحة على هذا الجهاز.",
    "Impossible de recuperer votre position.": "تعذر الحصول على موقعك.",
    "La geolocalisation precise necessite HTTPS ou localhost.": "تحديد الموقع الدقيق يتطلب HTTPS أو localhost.",
    "Permission de localisation refusee. Autorisez-la dans votre navigateur.": "تم رفض إذن الموقع. يرجى السماح به في المتصفح.",
    "Position indisponible. Activez le GPS de votre appareil.": "الموقع غير متاح. فعّل GPS في جهازك.",
    "Temps d'attente depasse pour la localisation.": "انتهت مهلة طلب الموقع.",
    "Erreur geolocalisation: {message}": "خطأ في تحديد الموقع: {message}",
    "Precision GPS faible ({meters} m). Verifiez votre GPS ou corrigez sur la carte.": "دقة GPS ضعيفة ({meters} م). تحقّق من GPS أو صحّح الموقع على الخريطة.",
    "Latitude et longitude doivent etre renseignees ensemble.": "يجب إدخال خط العرض وخط الطول معًا.",
    "Coordonnees invalides.": "الإحداثيات غير صالحة.",
    "N/A": "غير متوفر",
  },
} as const;

const HOST_ROLES = new Set(["host", "admin"]);
const IMMOBILIER_AMENITIES = [
  "WiFi haut debit",
  "Climatisation",
  "Cuisine equipee",
  "Machine a laver",
  "Parking gratuit",
  "Terrasse",
];

const IMMOBILIER_CATEGORIES = ["maison", "appartement", "studio", "hotel", "cabanon"] as const;
const ACTIVITY_CATEGORIES = ["nature", "nautique", "culture"] as const;
const ACTIVITY_LEVELS = ["debutant", "intermediaire", "experimente"] as const;
const CATEGORY_LABEL_BY_VALUE: Record<string, string> = {
  maison: "Maison",
  appartement: "Appartement",
  studio: "Studio",
  hotel: "Hotel",
  cabanon: "Cabanon",
  location: "Location",
  covoiturage: "Covoiturage",
  nature: "Nature",
  nautique: "Nautique",
  culture: "Culture",
};
const ACTIVITY_LEVEL_LABEL_BY_VALUE: Record<string, string> = {
  debutant: "Debutant",
  intermediaire: "Intermediaire",
  experimente: "Experimente",
};
const TYPE_LABEL_BY_VALUE: Record<string, string> = {
  immobilier: "Immobilier",
  vehicule: "Vehicule",
  activite: "Activite",
};

const ALGERIA_MAP_BOUNDS = {
  west: -8.67,
  south: 18.96,
  east: 11.99,
  north: 37.12,
};

const ALGERIA_MAP_CENTER = {
  latitude: 28.0339,
  longitude: 1.6596,
};

const buildAlgeriaMapEmbedUrl = (latitude?: number, longitude?: number) => {
  const bbox =
    `${ALGERIA_MAP_BOUNDS.west}%2C${ALGERIA_MAP_BOUNDS.south}%2C${ALGERIA_MAP_BOUNDS.east}%2C${ALGERIA_MAP_BOUNDS.north}`;
  const marker =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? `&marker=${latitude}%2C${longitude}`
      : "";
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}`;
};

const buildAlgeriaMapExternalUrl = (latitude?: number, longitude?: number) => {
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=13/${latitude}/${longitude}`;
  }
  return `https://www.openstreetmap.org/#map=5/${ALGERIA_MAP_CENTER.latitude}/${ALGERIA_MAP_CENTER.longitude}`;
};

const toLabelKey = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

const buildDefaultAmenities = () =>
  IMMOBILIER_AMENITIES.reduce<Record<string, boolean>>((acc, amenity) => {
    acc[amenity] = false;
    return acc;
  }, {});

const buildInitialCreateForm = () => ({
  title: "",
  description: "",
  type: "immobilier" as "immobilier" | "vehicule" | "activite",
  category: "appartement",
  location: "",
  exact_latitude: "",
  exact_longitude: "",
  price: "",
  period: "nuit",
  details: "",
  availability_dates: "",
  travelers: "2",
  bedrooms: "",
  bathrooms: "",
  area: "",
  hotel_rooms_available: "",
  hotel_double_beds: "",
  hotel_single_beds: "",
  amenities: buildDefaultAmenities(),
  vehicle_brand: "",
  vehicle_model: "",
  vehicle_year: "",
  vehicle_mileage: "",
  vehicle_fuel: "",
  vehicle_transmission: "",
  vehicle_seats: "",
  carpool_departure_date: "",
  carpool_departure_time: "",
  carpool_departure_place: "",
  carpool_destination: "",
  carpool_passengers: "",
  carpool_plate: "",
  activity_duration: "",
  activity_level: "",
  activity_participants_max: "",
  activity_included: "",
});

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const parseAvailabilityDates = (value: string | null | undefined): string[] => {
  if (!value) {
    return [];
  }
  return Array.from(
    new Set(
      value
        .split(",")
        .map((part) => part.trim())
        .filter((part) => ISO_DATE_PATTERN.test(part))
    )
  ).sort();
};

const isoDateToDate = (value: string): Date => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const dateToIsoDate = (value: Date): string => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getNextIsoDate = (isoDate: string): string => {
  const next = isoDateToDate(isoDate);
  next.setDate(next.getDate() + 1);
  return dateToIsoDate(next);
};

const areConsecutiveIsoDates = (dates: string[]): boolean => {
  if (dates.length <= 1) {
    return true;
  }
  for (let index = 1; index < dates.length; index += 1) {
    if (dates[index] !== getNextIsoDate(dates[index - 1])) {
      return false;
    }
  }
  return true;
};

const availabilityDatesToRange = (dates: string[]): DateRange | undefined => {
  if (dates.length === 0) {
    return undefined;
  }
  return {
    from: isoDateToDate(dates[0]),
    to: isoDateToDate(dates[dates.length - 1]),
  };
};

const rangeToAvailabilityDates = (range: DateRange | undefined): string => {
  if (!range?.from) {
    return "";
  }
  const fromIso = dateToIsoDate(range.from);
  const toIso = dateToIsoDate(range.to ?? range.from);
  const startIso = fromIso <= toIso ? fromIso : toIso;
  const endIso = fromIso <= toIso ? toIso : fromIso;
  const dates: string[] = [];
  let current = startIso;
  while (current <= endIso) {
    dates.push(current);
    current = getNextIsoDate(current);
  }
  return dates.join(",");
};

const formatAvailabilityDate = (value: string, locale: string): string =>
  isoDateToDate(value).toLocaleDateString(locale);

type AvailabilityDatePickerProps = {
  value: string;
  onChange: (nextValue: string) => void;
  locale: string;
  calendarLocale: Locale;
  tr: (source: string, params?: Record<string, number | string>) => string;
};

type LocationSuggestion = {
  latitude: number;
  longitude: number;
  label: string;
};

function AvailabilityDatePicker({ value, onChange, locale, calendarLocale, tr }: AvailabilityDatePickerProps) {
  const parsedDates = parseAvailabilityDates(value);
  const selectedRange = availabilityDatesToRange(parsedDates);
  const hasNonConsecutiveDates = !areConsecutiveIsoDates(parsedDates);
  const rangeStart = parsedDates[0];
  const rangeEnd = parsedDates.length > 0 ? parsedDates[parsedDates.length - 1] : undefined;

  let label = tr("Disponibilites (choisir une periode)");
  if (rangeStart && rangeEnd) {
    if (rangeStart === rangeEnd) {
      label = formatAvailabilityDate(rangeStart, locale);
    } else {
      label = `${formatAvailabilityDate(rangeStart, locale)} - ${formatAvailabilityDate(rangeEnd, locale)}`;
    }
  }

  return (
    <div className="space-y-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={`w-full rounded-lg border border-border bg-gray-50 px-3 py-2 text-left text-sm ${parsedDates.length === 0 ? "text-muted-foreground" : "text-foreground"
              }`}
          >
            <span className="inline-flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {label}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="aspect-square w-[26rem] max-w-[calc(100vw-1rem)] p-2">
          <CalendarPicker
            className="h-full w-full"
            mode="range"
            selected={selectedRange}
            onSelect={(range) => onChange(rangeToAvailabilityDates(range))}
            locale={calendarLocale}
            weekStartsOn={1}
            numberOfMonths={1}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{parsedDates.length === 0 ? tr("Aucune date selectionnee") : tr("{count} jour(s) disponible(s)", { count: parsedDates.length })}</span>
        {parsedDates.length > 0 && (
          <button
            type="button"
            className="text-xs underline underline-offset-2 hover:text-foreground"
            onClick={() => onChange("")}
          >
            {tr("Effacer")}
          </button>
        )}
      </div>
      {hasNonConsecutiveDates && (
        <p className="text-xs text-amber-700">
          {tr("Les anciennes disponibilites n'etaient pas continues. Choisissez une nouvelle periode pour les remplacer.")}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("reservations");
  const tabsAnchorRef = useRef<HTMLDivElement | null>(null);
  const myListingsSectionRef = useRef<HTMLDivElement | null>(null);
  const [myListings, setMyListings] = useState<ApiListing[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<ApiListing[]>([]);
  const [myBookings, setMyBookings] = useState<ApiBooking[]>([]);
  const [hostBookings, setHostBookings] = useState<ApiBooking[]>([]);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const [bookingMessages, setBookingMessages] = useState<ApiMessage[]>([]);
  const [selectedConversationBookingId, setSelectedConversationBookingId] = useState<number | null>(null);
  const [messagesView, setMessagesView] = useState<"notifications" | "messages">("messages");
  const [isConversationFocused, setIsConversationFocused] = useState(false);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingHostBookings, setLoadingHostBookings] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [deleteAccountMessage, setDeleteAccountMessage] = useState<string | null>(null);
  const [deleteAccountPassword, setDeleteAccountPassword] = useState("");
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [listingActionMessage, setListingActionMessage] = useState<string | null>(null);
  const [bookingActionMessage, setBookingActionMessage] = useState<string | null>(null);
  const [messageActionMessage, setMessageActionMessage] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingListingImages, setUploadingListingImages] = useState(false);
  const [savingListingUpdate, setSavingListingUpdate] = useState(false);
  const [deletingListingId, setDeletingListingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"confirm" | "password">("confirm");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [listingFiles, setListingFiles] = useState<File[]>([]);
  const [editingListingId, setEditingListingId] = useState<number | null>(null);
  const [editListingForm, setEditListingForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    price: "",
    period: "",
    availability_dates: "",
  });
  const { user, token, refreshMe, logout } = useAuth();

  const [profileForm, setProfileForm] = useState({
    email: "",
    full_name: "",
    avatar_url: "",
    phone_number: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [createForm, setCreateForm] = useState(buildInitialCreateForm);
  const [isLocationMapOpen, setIsLocationMapOpen] = useState(false);
  const [locationSearchCoordinates, setLocationSearchCoordinates] = useState<LocationSuggestion | null>(null);
  const [locationSearchSuggestions, setLocationSearchSuggestions] = useState<LocationSuggestion[]>([]);
  const [locationSearchLoading, setLocationSearchLoading] = useState(false);
  const [locationSearchError, setLocationSearchError] = useState<string | null>(null);

  const isHost = HOST_ROLES.has(user?.role ?? "");
  const { language, locale } = useLanguage();
  const tr = useMemo(() => makeTranslator(language, DASHBOARD_TRANSLATIONS), [language]);
  const calendarLocale = useMemo(() => {
    if (language === "en") return enUS;
    if (language === "ar") return ar;
    return fr;
  }, [language]);
  const userRoleLabel = isHost ? tr("Hote") : tr("Client");
  const formatListingType = (value: string | null | undefined) => {
    if (!value) {
      return "-";
    }
    const key = TYPE_LABEL_BY_VALUE[value.trim().toLowerCase()] ?? toLabelKey(value);
    return tr(key);
  };
  const formatListingCategory = (value: string | null | undefined) => {
    if (!value) {
      return "-";
    }
    const key = CATEGORY_LABEL_BY_VALUE[value.trim().toLowerCase()] ?? toLabelKey(value);
    return tr(key);
  };
  const formatActivityLevel = (value: string) => {
    const key = ACTIVITY_LEVEL_LABEL_BY_VALUE[value.trim().toLowerCase()] ?? toLabelKey(value);
    return tr(key);
  };

  useEffect(() => {
    void refreshMe();
  }, [refreshMe]);

  useEffect(() => {
    setProfileForm({
      email: user?.email ?? "",
      full_name: user?.full_name ?? "",
      avatar_url: user?.avatar_url ?? "",
      phone_number: user?.phone_number ?? "",
    });
  }, [user?.avatar_url, user?.email, user?.full_name, user?.phone_number]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) {
        setLoadingListings(false);
        return;
      }
      setLoadingListings(true);
      try {
        const listings = await getMyListingsApi(token);
        if (mounted) {
          setMyListings(listings);
        }
      } catch {
        if (mounted) {
          setMyListings([]);
        }
      } finally {
        if (mounted) {
          setLoadingListings(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) {
        setLoadingBookings(false);
        return;
      }
      setLoadingBookings(true);
      try {
        const bookings = await getMyBookingsApi(token);
        if (mounted) {
          setMyBookings(bookings);
        }
      } catch {
        if (mounted) {
          setMyBookings([]);
        }
      } finally {
        if (mounted) {
          setLoadingBookings(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token || !isHost) {
        if (mounted) {
          setHostBookings([]);
          setLoadingHostBookings(false);
        }
        return;
      }
      setLoadingHostBookings(true);
      try {
        const bookings = await getReceivedBookingsApi(token);
        if (mounted) {
          setHostBookings(bookings);
        }
      } catch {
        if (mounted) {
          setHostBookings([]);
        }
      } finally {
        if (mounted) {
          setLoadingHostBookings(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isHost, token]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) {
        setLoadingFavorites(false);
        return;
      }
      setLoadingFavorites(true);
      try {
        const listings = await getFavoriteListingsApi(token);
        if (mounted) {
          setFavoriteListings(listings);
        }
      } catch {
        if (mounted) {
          setFavoriteListings([]);
        }
      } finally {
        if (mounted) {
          setLoadingFavorites(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token) {
        if (mounted) {
          setNotifications([]);
          setLoadingNotifications(false);
        }
        return;
      }
      setLoadingNotifications(true);
      try {
        const data = await getNotificationsApi(token, 100);
        if (mounted) {
          setNotifications(data);
        }
      } catch {
        if (mounted) {
          setNotifications([]);
        }
      } finally {
        if (mounted) {
          setLoadingNotifications(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token]);

  const conversationBookings = useMemo(() => {
    const byId = new Map<number, ApiBooking>();
    [...myBookings, ...hostBookings].forEach((booking) => {
      byId.set(booking.id, booking);
    });
    return Array.from(byId.values()).sort(
      (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );
  }, [hostBookings, myBookings]);

  useEffect(() => {
    if (conversationBookings.length === 0) {
      setSelectedConversationBookingId(null);
      setIsConversationFocused(false);
      return;
    }
    setSelectedConversationBookingId((current) => {
      if (current && conversationBookings.some((booking) => booking.id === current)) {
        return current;
      }
      return conversationBookings[0].id;
    });
  }, [conversationBookings]);

  useEffect(() => {
    if (!isConversationFocused) {
      return;
    }
    window.history.pushState({ dashboardMessagesFocused: true }, "", window.location.href);
    const onPopState = () => {
      setIsConversationFocused(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [isConversationFocused]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token || !selectedConversationBookingId) {
        if (mounted) {
          setBookingMessages([]);
          setLoadingMessages(false);
        }
        return;
      }
      setLoadingMessages(true);
      try {
        const data = await getBookingMessagesApi(token, selectedConversationBookingId);
        if (mounted) {
          setBookingMessages(data);
        }
      } catch {
        if (mounted) {
          setBookingMessages([]);
        }
      } finally {
        if (mounted) {
          setLoadingMessages(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [selectedConversationBookingId, token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    const intervalId = window.setInterval(() => {
      void (async () => {
        try {
          const [bookings, freshNotifications] = await Promise.all([
            getMyBookingsApi(token),
            getNotificationsApi(token, 100),
          ]);
          setMyBookings(bookings);
          setNotifications(freshNotifications);
          if (isHost) {
            const received = await getReceivedBookingsApi(token);
            setHostBookings(received);
          }
          if (selectedConversationBookingId) {
            const messages = await getBookingMessagesApi(token, selectedConversationBookingId);
            setBookingMessages(messages);
          }
        } catch {
          // Ignore background refresh errors.
        }
      })();
    }, 15000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [isHost, selectedConversationBookingId, token]);

  const formatDza = (value: number) => `${new Intl.NumberFormat(locale).format(Math.round(value))} DA`;
  const formatDate = (value: string) => new Date(value).toLocaleDateString(locale);
  const formatDateTime = (value: string) =>
    new Date(value).toLocaleString(locale, { dateStyle: "short", timeStyle: "short" });

  const formatBookingStatus = (statusValue: ApiBooking["status"]) => {
    if (statusValue === "pending") return tr("En attente");
    if (statusValue === "confirmed") return tr("Confirmee");
    if (statusValue === "rejected") return tr("Refusee");
    if (statusValue === "cancelled") return tr("Annulee");
    return tr("Terminee");
  };

  const bookingStatusBadgeClass = (statusValue: ApiBooking["status"]) => {
    if (statusValue === "confirmed") return "bg-green-100 text-green-700";
    if (statusValue === "pending") return "bg-amber-100 text-amber-700";
    if (statusValue === "rejected" || statusValue === "cancelled") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  const unreadNotificationsCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const unreadMessageNotificationsCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read && notification.type === "message").length,
    [notifications]
  );

  const notificationTypeSurfaceClass = (type: ApiNotification["type"]) => {
    if (type === "message") {
      return "bg-primary/10 text-primary";
    }
    if (type === "booking_request") {
      return "bg-amber-100 text-amber-700";
    }
    return "bg-slate-100 text-slate-700";
  };

  const renderNotificationTypeIcon = (type: ApiNotification["type"]) => {
    if (type === "message") {
      return <MessageCircle className="h-4 w-4" />;
    }
    if (type === "booking_request") {
      return <Calendar className="h-4 w-4" />;
    }
    return <Bell className="h-4 w-4" />;
  };

  const selectedConversationBooking = useMemo(
    () =>
      selectedConversationBookingId
        ? conversationBookings.find((booking) => booking.id === selectedConversationBookingId) ?? null
        : null,
    [conversationBookings, selectedConversationBookingId]
  );

  const isImmobilier = createForm.type === "immobilier";
  const isVehicule = createForm.type === "vehicule";
  const isActivite = createForm.type === "activite";
  const normalizedCreateCategory = createForm.category.trim().toLowerCase();
  const isHotelCreate = isImmobilier && (normalizedCreateCategory === "hotel" || normalizedCreateCategory === "hôtel");
  const hotelRoomsAvailableValue = createForm.hotel_rooms_available.trim();
  const hotelRoomsAvailableCount = hotelRoomsAvailableValue ? Number(hotelRoomsAvailableValue) : 0;
  const hotelDoubleBedsValue = createForm.hotel_double_beds.trim();
  const hotelSingleBedsValue = createForm.hotel_single_beds.trim();
  const hotelDoubleBedsCount = hotelDoubleBedsValue ? Number(hotelDoubleBedsValue) : 0;
  const hotelSingleBedsCount = hotelSingleBedsValue ? Number(hotelSingleBedsValue) : 0;
  const hotelBedsTotal =
    (Number.isFinite(hotelDoubleBedsCount) && hotelDoubleBedsCount >= 0 ? hotelDoubleBedsCount : 0)
    + (Number.isFinite(hotelSingleBedsCount) && hotelSingleBedsCount >= 0 ? hotelSingleBedsCount : 0);
  const isCarpoolCreate = isVehicule && createForm.category.trim().toLowerCase() === "covoiturage";
  const exactLatitudeRaw = createForm.exact_latitude.trim();
  const exactLongitudeRaw = createForm.exact_longitude.trim();
  const exactLatitudeNumber = exactLatitudeRaw ? Number(exactLatitudeRaw) : NaN;
  const exactLongitudeNumber = exactLongitudeRaw ? Number(exactLongitudeRaw) : NaN;
  const locationSearchQuery = createForm.location.trim();
  const hasExactCoordinates =
    exactLatitudeRaw.length > 0
    && exactLongitudeRaw.length > 0
    && Number.isFinite(exactLatitudeNumber)
    && Number.isFinite(exactLongitudeNumber)
    && exactLatitudeNumber >= -90
    && exactLatitudeNumber <= 90
    && exactLongitudeNumber >= -180
    && exactLongitudeNumber <= 180;
  const mapPreviewLatitude = hasExactCoordinates
    ? exactLatitudeNumber
    : locationSearchCoordinates?.latitude;
  const mapPreviewLongitude = hasExactCoordinates
    ? exactLongitudeNumber
    : locationSearchCoordinates?.longitude;
  const algeriaMapEmbedUrl = buildAlgeriaMapEmbedUrl(mapPreviewLatitude, mapPreviewLongitude);
  const algeriaMapExternalUrl = buildAlgeriaMapExternalUrl(mapPreviewLatitude, mapPreviewLongitude);

  const startEditingListing = (listing: ApiListing) => {
    setListingActionMessage(null);
    setEditingListingId(listing.id);
    setEditListingForm({
      title: listing.title,
      description: listing.description ?? "",
      category: listing.category ?? "",
      location: listing.location,
      price: String(listing.price),
      period: listing.period ?? "",
      availability_dates: listing.availability_dates ?? "",
    });
  };

  const cancelEditingListing = () => {
    setEditingListingId(null);
    setEditListingForm({
      title: "",
      description: "",
      category: "",
      location: "",
      price: "",
      period: "",
      availability_dates: "",
    });
  };

  const onSubmitEditListing = async (event: FormEvent<HTMLFormElement>, listing: ApiListing) => {
    event.preventDefault();
    if (!token) {
      return;
    }
    setListingActionMessage(null);
    setSavingListingUpdate(true);
    try {
      const updated = await updateListingApi(token, listing.id, {
        title: editListingForm.title.trim(),
        description: editListingForm.description.trim() || undefined,
        category: editListingForm.category.trim() || undefined,
        location: editListingForm.location.trim(),
        price: Number(editListingForm.price),
        period: editListingForm.period.trim() || undefined,
        availability_dates: editListingForm.availability_dates.trim() || undefined,
      });
      setMyListings((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setListingActionMessage(tr("Annonce mise a jour."));
      cancelEditingListing();
    } catch (error) {
      setListingActionMessage(error instanceof Error ? error.message : tr("Erreur lors de la mise a jour."));
    } finally {
      setSavingListingUpdate(false);
    }
  };

  const onDeleteListing = async (listingId: number) => {
    if (!token) {
      return;
    }
    const confirmed = window.confirm(tr("Confirmer la suppression de cette annonce ?"));
    if (!confirmed) {
      return;
    }
    setListingActionMessage(null);
    setDeletingListingId(listingId);
    try {
      await deleteListingApi(token, listingId);
      setMyListings((current) => current.filter((item) => item.id !== listingId));
      if (editingListingId === listingId) {
        cancelEditingListing();
      }
      setListingActionMessage(tr("Annonce supprimee."));
    } catch (error) {
      setListingActionMessage(error instanceof Error ? error.message : tr("Erreur lors de la suppression."));
    } finally {
      setDeletingListingId(null);
    }
  };

  const onCreateTypeChange = (nextType: "immobilier" | "vehicule" | "activite") => {
    setCreateForm((current) => ({
      ...current,
      type: nextType,
      category: nextType === "vehicule" ? "location" : nextType === "immobilier" ? "appartement" : nextType === "activite" ? "nature" : "",
      period: nextType === "immobilier" ? "nuit" : "",
      details: "",
      availability_dates: "",
      exact_latitude: "",
      exact_longitude: "",
      travelers: "2",
      bedrooms: "",
      bathrooms: "",
      area: "",
      hotel_rooms_available: "",
      hotel_double_beds: "",
      hotel_single_beds: "",
      amenities: buildDefaultAmenities(),
      vehicle_brand: "",
      vehicle_model: "",
      vehicle_year: "",
      vehicle_mileage: "",
      vehicle_fuel: "",
      vehicle_transmission: "",
      vehicle_seats: "",
      carpool_departure_date: "",
      carpool_departure_time: "",
      carpool_departure_place: "",
      carpool_destination: "",
      carpool_passengers: "",
      carpool_plate: "",
      activity_duration: "",
      activity_level: nextType === "activite" ? "debutant" : "",
      activity_participants_max: "",
      activity_included: "",
    }));
    setLocationSearchSuggestions([]);
    setLocationSearchCoordinates(null);
    setLocationSearchError(null);
  };

  useEffect(() => {
    if (isCarpoolCreate) {
      setLocationSearchSuggestions([]);
      setLocationSearchCoordinates(null);
      setLocationSearchError(null);
      setLocationSearchLoading(false);
      return;
    }
    if (locationSearchQuery.length < 2) {
      setLocationSearchSuggestions([]);
      setLocationSearchCoordinates(null);
      setLocationSearchError(null);
      setLocationSearchLoading(false);
      return;
    }
    if (locationSearchCoordinates && locationSearchQuery === locationSearchCoordinates.label) {
      setLocationSearchSuggestions([]);
      setLocationSearchError(null);
      setLocationSearchLoading(false);
      return;
    }

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        setLocationSearchLoading(true);
        setLocationSearchError(null);
        try {
          const params = new URLSearchParams({
            q: locationSearchQuery,
            format: "jsonv2",
            countrycodes: "dz",
            limit: "5",
          });
          const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
            signal: abortController.signal,
          });
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const data = (await response.json()) as Array<{
            lat: string;
            lon: string;
            display_name?: string;
          }>;
          const matches: LocationSuggestion[] = (Array.isArray(data) ? data : [])
            .map((entry) => {
              const latitude = Number(entry.lat);
              const longitude = Number(entry.lon);
              const label = (entry.display_name ?? "").trim();
              if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || !label) {
                return null;
              }
              return { latitude, longitude, label };
            })
            .filter((entry): entry is LocationSuggestion => entry !== null);
          if (matches.length === 0) {
            setLocationSearchSuggestions([]);
            setLocationSearchCoordinates(null);
            setLocationSearchError(tr("Aucune position trouvee pour cette localisation."));
            return;
          }
          setLocationSearchSuggestions(matches);
          setLocationSearchCoordinates(matches[0]);
          setLocationSearchError(null);
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          setLocationSearchSuggestions([]);
          setLocationSearchCoordinates(null);
          setLocationSearchError(tr("Aucune position trouvee pour cette localisation."));
        } finally {
          setLocationSearchLoading(false);
        }
      })();
    }, 500);

    return () => {
      abortController.abort();
      window.clearTimeout(timeoutId);
    };
  }, [isCarpoolCreate, locationSearchQuery, tr]);

  const onSelectLocationSuggestion = (suggestion: LocationSuggestion) => {
    setCreateForm((current) => ({
      ...current,
      location: suggestion.label,
      exact_latitude: suggestion.latitude.toFixed(6),
      exact_longitude: suggestion.longitude.toFixed(6),
    }));
    setLocationSearchCoordinates(suggestion);
    setLocationSearchSuggestions([]);
    setLocationSearchError(null);
  };

  const onAvatarSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!token) {
      return;
    }
    const selected = event.target.files?.[0];
    if (!selected) {
      return;
    }
    setProfileMessage(null);
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatarApi(token, selected);
      setProfileForm((current) => ({ ...current, avatar_url: url }));
      setProfileMessage(tr("Photo de profil importee. Pensez a enregistrer le profil."));
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : tr("Erreur lors de l'upload de la photo."));
    } finally {
      setUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const onListingFilesSelected = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) {
      return;
    }
    setListingFiles((current) => {
      const next = new Map<string, File>();
      current.forEach((file) => {
        next.set(`${file.name}-${file.size}-${file.lastModified}`, file);
      });
      files.forEach((file) => {
        next.set(`${file.name}-${file.size}-${file.lastModified}`, file);
      });
      return Array.from(next.values());
    });
    event.target.value = "";
  };

  const getGeolocationErrorMessage = (error: unknown): string => {
    const geoError = error as GeolocationPositionError | undefined;
    if (!geoError || typeof geoError.code !== "number") {
      return tr("Impossible de recuperer votre position.");
    }
    if (geoError.code === 1) {
      return tr("Permission de localisation refusee. Autorisez-la dans votre navigateur.");
    }
    if (geoError.code === 2) {
      return tr("Position indisponible. Activez le GPS de votre appareil.");
    }
    if (geoError.code === 3) {
      return tr("Temps d'attente depasse pour la localisation.");
    }
    return tr("Erreur geolocalisation: {message}", { message: geoError.message || "unknown" });
  };

  const getPosition = (options: PositionOptions) =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

  const watchBestPosition = (durationMs = 12000) =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      let best: GeolocationPosition | null = null;
      let finished = false;
      let watchId: number | null = null;
      let timeoutId: number | null = null;

      const finish = (error?: unknown) => {
        if (finished) return;
        finished = true;
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
        }
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
        if (best) {
          resolve(best);
          return;
        }
        reject(error);
      };

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          if (!best || position.coords.accuracy < best.coords.accuracy) {
            best = position;
          }
          if (position.coords.accuracy <= 50) {
            finish();
          }
        },
        (error) => finish(error),
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        }
      );

      timeoutId = window.setTimeout(() => finish(), durationMs);
    });

  const resolveCurrentDeviceLocation = async () => {
    let primary: GeolocationPosition;
    try {
      primary = await watchBestPosition(12000);
    } catch {
      // Fallback: some devices fail with strict high-accuracy mode.
      primary = await getPosition({
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 30000,
      });
    }

    let best = primary;
    if (primary.coords.accuracy > 100) {
      try {
        const retry = await getPosition({
          enableHighAccuracy: true,
          timeout: 25000,
          maximumAge: 0,
        });
        if (retry.coords.accuracy < best.coords.accuracy) {
          best = retry;
        }
      } catch {
        // Keep the primary reading if retry fails.
      }
    }

    const latitude = best.coords.latitude;
    const longitude = best.coords.longitude;
    const accuracyMeters = Math.round(best.coords.accuracy);
    const fallbackLocation = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    let resolvedLocation = fallbackLocation;

    if (accuracyMeters <= 1500) {
      try {
        const params = new URLSearchParams({
          format: "jsonv2",
          lat: String(latitude),
          lon: String(longitude),
          zoom: "18",
          addressdetails: "1",
          "accept-language": locale,
        });
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as { display_name?: string };
        resolvedLocation = (data.display_name ?? "").trim() || fallbackLocation;
      } catch {
        // Keep fallback location if reverse geocoding fails.
      }
    }

    return {
      latitude,
      longitude,
      accuracyMeters,
      fallbackLocation,
      resolvedLocation,
    };
  };

  const resolveApproximateLocationFromIp = async () => {
    const response = await fetch("https://ipwho.is/");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = (await response.json()) as {
      success?: boolean;
      latitude?: number;
      longitude?: number;
      city?: string;
      region?: string;
      country?: string;
    };
    if (data.success === false || typeof data.latitude !== "number" || typeof data.longitude !== "number") {
      throw new Error("IP geolocation failed");
    }

    const label = [data.city, data.region, data.country].filter(Boolean).join(", ");
    const fallbackLocation = label || `${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`;

    return {
      latitude: data.latitude,
      longitude: data.longitude,
      accuracyMeters: 50000,
      fallbackLocation,
      resolvedLocation: fallbackLocation,
    };
  };

  const applyResolvedLocation = (
    data: {
      latitude: number;
      longitude: number;
      accuracyMeters: number;
      fallbackLocation: string;
      resolvedLocation: string;
    },
    options: { messageOverride?: string; skipAccuracyMessage?: boolean } = {}
  ) => {
    const locationLabel = data.accuracyMeters > 1500 ? data.fallbackLocation : data.resolvedLocation;
    setCreateForm((current) => ({
      ...current,
      exact_latitude: data.latitude.toFixed(6),
      exact_longitude: data.longitude.toFixed(6),
      location: data.accuracyMeters > 1500
        ? (current.location.trim() ? current.location : data.fallbackLocation)
        : data.resolvedLocation,
    }));
    setLocationSearchCoordinates({
      latitude: data.latitude,
      longitude: data.longitude,
      label: locationLabel,
    });
    setLocationSearchSuggestions([]);
    setLocationSearchError(null);

    if (options.messageOverride) {
      setCreateMessage(options.messageOverride);
      return;
    }
    if (!options.skipAccuracyMessage && data.accuracyMeters > 1500) {
      setCreateMessage(
        tr("Precision GPS faible ({meters} m). Verifiez votre GPS ou corrigez sur la carte.", {
          meters: data.accuracyMeters,
        })
      );
    }
  };

  const tryApproximateLocation = async (message: string) => {
    try {
      const data = await resolveApproximateLocationFromIp();
      applyResolvedLocation(data, { messageOverride: message, skipAccuracyMessage: true });
      return true;
    } catch {
      return false;
    }
  };

  const onUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      void (async () => {
        const fallbackMessage = tr("Geolocalisation indisponible sur cet appareil.");
        const fallbackOk = await tryApproximateLocation(fallbackMessage);
        if (!fallbackOk) {
          setCreateMessage(fallbackMessage);
        }
      })();
      return;
    }
    if (!window.isSecureContext) {
      void (async () => {
        const fallbackMessage = tr("La geolocalisation precise necessite HTTPS ou localhost.");
        const fallbackOk = await tryApproximateLocation(fallbackMessage);
        if (!fallbackOk) {
          setCreateMessage(fallbackMessage);
        }
      })();
      return;
    }
    setCreateMessage(null);

    void (async () => {
      try {
        const data = await resolveCurrentDeviceLocation();
        applyResolvedLocation(data);
      } catch (error) {
        const fallbackMessage = getGeolocationErrorMessage(error);
        const fallbackOk = await tryApproximateLocation(fallbackMessage);
        if (!fallbackOk) {
          setCreateMessage(fallbackMessage);
        }
      }
    })();
  };

  const onSubmitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }
    setProfileMessage(null);
    try {
      await updateMeApi(token, {
        email: profileForm.email.trim() || undefined,
        full_name: profileForm.full_name.trim() || undefined,
        avatar_url: profileForm.avatar_url.trim() || undefined,
        phone_number: profileForm.phone_number.trim() || undefined,
      });
      await refreshMe();
      setProfileMessage(tr("Profil mis a jour."));
    } catch (error) {
      setProfileMessage(error instanceof Error ? error.message : tr("Erreur de mise a jour du profil."));
    }
  };

  const onSubmitPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }
    setPasswordMessage(null);
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordMessage(tr("La confirmation du nouveau mot de passe ne correspond pas."));
      return;
    }
    try {
      await changePasswordApi(token, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
      setPasswordMessage(tr("Mot de passe modifie."));
    } catch (error) {
      setPasswordMessage(error instanceof Error ? error.message : tr("Erreur lors du changement de mot de passe."));
    }
  };

  const resetDeleteAccountState = () => {
    setDeleteStep("confirm");
    setDeleteAccountPassword("");
    setDeleteAccountMessage(null);
  };

  const openDeleteAccountPanel = () => {
    if (deletingAccount) {
      return;
    }
    setDeleteDialogOpen(true);
    resetDeleteAccountState();
  };

  const closeDeleteAccountPanel = () => {
    if (deletingAccount) {
      return;
    }
    setDeleteDialogOpen(false);
    resetDeleteAccountState();
  };

  const onDeleteAccount = async () => {
    if (!token) {
      return;
    }
    if (!deleteAccountPassword.trim()) {
      setDeleteAccountMessage(tr("Veuillez saisir votre mot de passe."));
      return;
    }
    setDeletingAccount(true);
    setDeleteAccountMessage(null);
    try {
      await deleteMeApi(token, { password: deleteAccountPassword });
      closeDeleteAccountPanel();
      logout();
    } catch (error) {
      if (error instanceof Error) {
        const normalizedMessage = error.message.toLowerCase();
        if (normalizedMessage.includes("mot de passe") || normalizedMessage.includes("password")) {
          setDeleteAccountMessage(tr("Le mot de passe est faux."));
        } else if (normalizedMessage.includes("[object object]") || normalizedMessage.includes("http 422")) {
          setDeleteAccountMessage(tr("Le mot de passe est faux."));
        } else {
          setDeleteAccountMessage(error.message);
        }
      } else {
        setDeleteAccountMessage(tr("Erreur lors de la suppression du compte."));
      }
    } finally {
      setDeletingAccount(false);
    }
  };

  const onSubmitCreateListing = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      return;
    }
    setCreateMessage(null);
    if (isImmobilier) {
      if (isHotelCreate) {
        if (!hotelRoomsAvailableValue || !hotelDoubleBedsValue || !hotelSingleBedsValue || !createForm.bathrooms) {
          setCreateMessage(
            tr("Pour un hotel, les chambres disponibles, les lits doubles, les lits simples et les salles de bain sont obligatoires.")
          );
          return;
        }
        if (!Number.isFinite(hotelRoomsAvailableCount) || hotelRoomsAvailableCount <= 0) {
          setCreateMessage(tr("Pour un hotel, le nombre de chambres disponibles doit etre superieur a 0."));
          return;
        }
        if (hotelBedsTotal <= 0) {
          setCreateMessage(tr("Pour un hotel, le total des lits doit etre superieur a 0."));
          return;
        }
      } else if (!createForm.bedrooms || !createForm.bathrooms || !createForm.area) {
        setCreateMessage(tr("Pour l'immobilier, chambres, salles de bain et surface sont obligatoires."));
        return;
      }
    }
    if (isVehicule && !isCarpoolCreate && (!createForm.vehicle_brand.trim() || !createForm.vehicle_model.trim())) {
      setCreateMessage(tr("Pour un vehicule, la marque et le modele sont obligatoires."));
      return;
    }
    if (
      isCarpoolCreate &&
      (
        !createForm.carpool_departure_date.trim() ||
        !createForm.carpool_departure_time.trim() ||
        !createForm.carpool_departure_place.trim() ||
        !createForm.carpool_destination.trim() ||
        !createForm.carpool_passengers.trim() ||
        !createForm.carpool_plate.trim()
      )
    ) {
      setCreateMessage(
        tr("Pour un covoiturage, renseignez date/heure de depart, lieu de depart, destination, passagers et matricule.")
      );
      return;
    }
    if (isActivite && (!createForm.activity_duration.trim() || !createForm.activity_level.trim())) {
      setCreateMessage(tr("Pour une activite, la duree et le niveau sont obligatoires."));
      return;
    }
    if ((exactLatitudeRaw && !exactLongitudeRaw) || (!exactLatitudeRaw && exactLongitudeRaw)) {
      setCreateMessage(tr("Latitude et longitude doivent etre renseignees ensemble."));
      return;
    }
    if ((exactLatitudeRaw || exactLongitudeRaw) && !hasExactCoordinates) {
      setCreateMessage(tr("Coordonnees invalides."));
      return;
    }
    try {
      let uploadedUrls: string[] = [];
      if (listingFiles.length > 0) {
        setUploadingListingImages(true);
        uploadedUrls = await uploadListingImagesApi(token, listingFiles);
      }
      const geoCoordinates = hasExactCoordinates
        ? {
          latitude: exactLatitudeNumber,
          longitude: exactLongitudeNumber,
        }
        : undefined;
      const selectedAmenities = Object.entries(createForm.amenities)
        .filter(([, enabled]) => enabled)
        .map(([name]) => name);

      let detailsPayload = createForm.details.trim() || undefined;
      if (isImmobilier) {
        const travelersCount = Number(createForm.travelers);
        const immobilierDetails: {
          kind: "immobilier";
          amenities: string[];
          travelers: number;
          hotelRoomsAvailable?: number;
          hotelBeds?: { double: number; single: number; total: number };
          geo?: { latitude: number; longitude: number };
        } = {
          kind: "immobilier",
          amenities: selectedAmenities,
          travelers: Number.isFinite(travelersCount) && travelersCount > 0 ? travelersCount : 2,
        };
        if (geoCoordinates) {
          immobilierDetails.geo = geoCoordinates;
        }
        if (isHotelCreate) {
          immobilierDetails.hotelRoomsAvailable = hotelRoomsAvailableCount;
          immobilierDetails.hotelBeds = {
            double: hotelDoubleBedsCount,
            single: hotelSingleBedsCount,
            total: hotelBedsTotal,
          };
        }
        detailsPayload = JSON.stringify(immobilierDetails);
      } else if (isVehicule) {
        detailsPayload = JSON.stringify(
          isCarpoolCreate
            ? {
              kind: "covoiturage",
              departure_date: createForm.carpool_departure_date.trim(),
              departure_time: createForm.carpool_departure_time.trim(),
              departure_place: createForm.carpool_departure_place.trim(),
              destination: createForm.carpool_destination.trim(),
              passengers_max: createForm.carpool_passengers ? Number(createForm.carpool_passengers) : null,
              seats: createForm.carpool_passengers ? Number(createForm.carpool_passengers) : null,
              plate_number: createForm.carpool_plate.trim(),
              vehicle: [createForm.vehicle_brand.trim(), createForm.vehicle_model.trim()]
                .filter((value) => value.length > 0)
                .join(" ") || null,
              geo: geoCoordinates ?? null,
            }
            : {
              kind: "vehicule",
              brand: createForm.vehicle_brand.trim(),
              model: createForm.vehicle_model.trim(),
              year: createForm.vehicle_year ? Number(createForm.vehicle_year) : null,
              mileage: createForm.vehicle_mileage ? Number(createForm.vehicle_mileage) : null,
              fuel: createForm.vehicle_fuel.trim(),
              transmission: createForm.vehicle_transmission.trim(),
              seats: createForm.vehicle_seats ? Number(createForm.vehicle_seats) : null,
              geo: geoCoordinates ?? null,
            }
        );
      } else if (isActivite) {
        detailsPayload = JSON.stringify({
          kind: "activite",
          duration: createForm.activity_duration.trim(),
          level: createForm.activity_level.trim(),
          participantsMax: createForm.activity_participants_max ? Number(createForm.activity_participants_max) : null,
          included: createForm.activity_included.trim(),
          geo: geoCoordinates ?? null,
        });
      }

      const listing = await createListingApi(token, {
        title: createForm.title.trim(),
        description: createForm.description.trim() || undefined,
        type: createForm.type,
        category: createForm.category.trim() || undefined,
        location: isCarpoolCreate
          ? `${createForm.carpool_departure_place.trim()} -> ${createForm.carpool_destination.trim()}`
          : createForm.location.trim(),
        price: Number(createForm.price),
        period: isCarpoolCreate || isActivite ? undefined : (isHotelCreate ? "nuit" : createForm.period.trim() || undefined),
        details: detailsPayload,
        availability_dates: isCarpoolCreate ? undefined : createForm.availability_dates.trim() || undefined,
        bedrooms: isImmobilier
          ? (isHotelCreate
            ? hotelRoomsAvailableCount
            : (createForm.bedrooms ? Number(createForm.bedrooms) : undefined))
          : undefined,
        bathrooms: isImmobilier && createForm.bathrooms ? Number(createForm.bathrooms) : undefined,
        area: isImmobilier && !isHotelCreate && createForm.area ? Number(createForm.area) : undefined,
        image_urls: uploadedUrls,
      });
      setMyListings((current) => [listing, ...current]);
      setCreateMessage(tr("Annonce creee avec succes."));
      setCreateForm(buildInitialCreateForm());
      setListingFiles([]);
      setLocationSearchSuggestions([]);
      setLocationSearchCoordinates(null);
      setLocationSearchError(null);
    } catch (error) {
      setCreateMessage(error instanceof Error ? error.message : tr("Erreur lors de la creation de l'annonce."));
    } finally {
      setUploadingListingImages(false);
    }
  };

  const applyBookingUpdate = (updatedBooking: ApiBooking) => {
    setHostBookings((current) =>
      current.map((booking) => (booking.id === updatedBooking.id ? updatedBooking : booking))
    );
    setMyBookings((current) =>
      current.map((booking) => (booking.id === updatedBooking.id ? updatedBooking : booking))
    );
  };

  const onConfirmBooking = async (bookingId: number) => {
    if (!token) {
      return;
    }
    setBookingActionMessage(null);
    try {
      const updatedBooking = await confirmBookingApi(token, bookingId);
      applyBookingUpdate(updatedBooking);
      setBookingActionMessage(tr("Reservation confirmee."));
      const freshNotifications = await getNotificationsApi(token, 100);
      setNotifications(freshNotifications);
    } catch (error) {
      setBookingActionMessage(error instanceof Error ? error.message : tr("Erreur lors de la confirmation."));
    }
  };

  const onCancelBooking = async (bookingId: number) => {
    if (!token) {
      return;
    }
    setBookingActionMessage(null);
    setCancellingBookingId(bookingId);
    try {
      const updatedBooking = await cancelBookingApi(token, bookingId);
      applyBookingUpdate(updatedBooking);
      setBookingActionMessage(tr("Reservation annulee."));
      const freshNotifications = await getNotificationsApi(token, 100);
      setNotifications(freshNotifications);
    } catch (error) {
      setBookingActionMessage(error instanceof Error ? error.message : tr("Erreur lors de l'annulation."));
    } finally {
      setCancellingBookingId(null);
    }
  };

  const onRejectBooking = async (bookingId: number) => {
    if (!token) {
      return;
    }
    const reason = window.prompt(tr("Motif du refus (optionnel):"), "") ?? "";
    setBookingActionMessage(null);
    try {
      const updatedBooking = await rejectBookingApi(token, bookingId, reason.trim() || undefined);
      applyBookingUpdate(updatedBooking);
      setBookingActionMessage(tr("Reservation refusee."));
      const freshNotifications = await getNotificationsApi(token, 100);
      setNotifications(freshNotifications);
    } catch (error) {
      setBookingActionMessage(error instanceof Error ? error.message : tr("Erreur lors du refus."));
    }
  };

  const onMarkNotificationRead = async (notificationId: number) => {
    if (!token) {
      return;
    }
    try {
      const updated = await markNotificationReadApi(token, notificationId);
      setNotifications((current) =>
        current.map((notification) => (notification.id === updated.id ? updated : notification))
      );
    } catch {
      // Keep local state unchanged on API failure.
    }
  };

  const onMarkAllNotificationsRead = async () => {
    if (!token) {
      return;
    }
    try {
      await markAllNotificationsReadApi(token);
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, is_read: true }))
      );
    } catch {
      // Keep local state unchanged on API failure.
    }
  };

  const onSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !selectedConversationBookingId) {
      return;
    }
    const content = messageDraft.trim();
    if (!content) {
      setMessageActionMessage(tr("Ecrivez un message avant l'envoi."));
      return;
    }
    setMessageActionMessage(null);
    setSendingMessage(true);
    try {
      const sent = await sendBookingMessageApi(token, selectedConversationBookingId, content);
      setBookingMessages((current) => [...current, sent]);
      setMessageDraft("");
      setMessageActionMessage(tr("Message envoye."));
      const freshNotifications = await getNotificationsApi(token, 100);
      setNotifications(freshNotifications);
    } catch (error) {
      setMessageActionMessage(error instanceof Error ? error.message : tr("Erreur lors de l'envoi du message."));
    } finally {
      setSendingMessage(false);
    }
  };

  const onQuickAccess = (tab: string) => {
    setActiveTab(tab);
    window.requestAnimationFrame(() => {
      tabsAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const onOpenMyListings = () => {
    setActiveTab("annonces");
    window.requestAnimationFrame(() => {
      myListingsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Dashboard Header */}
        <div
          className="relative mb-8 overflow-hidden rounded-3xl p-6 sm:p-8 text-white"
          style={{ background: "linear-gradient(135deg, rgb(34,45,49) 0%, rgb(60,75,80) 50%, rgb(96,98,93) 100%)", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}
        >
          {/* Decorative background pattern */}
          <div className="pointer-events-none absolute inset-0" style={{ opacity: 0.1 }}>
            <div className="absolute rounded-full" style={{ right: "-3rem", top: "-3rem", width: "16rem", height: "16rem", background: "rgba(255,255,255,0.3)", filter: "blur(60px)" }} />
            <div className="absolute rounded-full" style={{ bottom: "-4rem", left: "-4rem", width: "20rem", height: "20rem", background: "rgba(0,166,166,0.4)", filter: "blur(60px)" }} />
          </div>
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5" style={{ zIndex: 10 }}>
            <div className="relative">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24" style={{ border: "4px solid rgba(255,255,255,0.25)", boxShadow: "0 0 0 4px rgba(255,255,255,0.1), 0 20px 25px -5px rgba(0,0,0,0.3)" }}>
                <AvatarImage src={profileForm.avatar_url || user?.avatar_url || undefined} />
                <AvatarFallback className="text-white text-2xl font-bold" style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}>
                  {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <span className="absolute rounded-full" style={{ bottom: "4px", right: "4px", width: "20px", height: "20px", background: "#34d399", border: "3px solid rgb(34,45,49)", boxShadow: "0 2px 4px rgba(0,0,0,0.3)" }} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ letterSpacing: "-0.025em", color: "white" }}>{user?.full_name || tr("Utilisateur 3ich")}</h1>
              <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>{user?.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.9)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                  {tr("Statut: {role}", { role: userRoleLabel })}
                </span>
                {!isHost && (
                  <Link to="/devenir-hote">
                    <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white cursor-pointer" style={{ background: "rgba(0,166,166,0.8)", transition: "background 0.2s" }}>
                      <Plus className="w-3 h-3" />
                      {tr("Devenir hote")}
                    </span>
                  </Link>
                )}
              </div>
            </div>
          </div>
          {/* Quick Stats Row */}
          <div className="relative mt-6 grid grid-cols-3 gap-3 sm:gap-4" style={{ zIndex: 10 }}>
            <button
              type="button"
              onClick={onOpenMyListings}
              className="rounded-2xl p-3 sm:p-4 text-center transition-colors hover:bg-white/15"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
            >
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: "white" }}>{loadingListings ? "—" : myListings.length}</p>
              <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{tr("Mes annonces")}</p>
            </button>
            <button
              type="button"
              onClick={() => onQuickAccess("reservations")}
              className="rounded-2xl p-3 sm:p-4 text-center transition-colors hover:bg-white/15"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
            >
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: "white" }}>{loadingBookings ? "—" : myBookings.length}</p>
              <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{tr("Reservations")}</p>
            </button>
            <button
              type="button"
              onClick={() => onQuickAccess("favoris")}
              className="rounded-2xl p-3 sm:p-4 text-center transition-colors hover:bg-white/15"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}
            >
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: "white" }}>{loadingFavorites ? "—" : favoriteListings.length}</p>
              <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>{tr("Favoris")}</p>
            </button>
          </div>
        </div>

        <div ref={tabsAnchorRef}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className="w-full mb-8 rounded-2xl p-1 flex-wrap h-auto border border-border"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.08)"
              }}
            >
              <TabsTrigger
                value="reservations"
                className="rounded-xl flex items-center gap-2 flex-1 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(153,163,168)] data-[state=active]:to-[rgb(153,163,168)] data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">{tr("Reservations")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="annonces"
                className="rounded-xl flex items-center gap-2 flex-1 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(153,163,168)] data-[state=active]:to-[rgb(153,163,168)] data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">{tr("Ajouter une annonce")}</span>
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="rounded-xl flex items-center gap-2 flex-1 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(153,163,168)] data-[state=active]:to-[rgb(153,163,168)] data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">{tr("Messages")}</span>
                {unreadNotificationsCount > 0 && (
                  <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="profil"
                className="rounded-xl flex items-center gap-2 flex-1 transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-[rgb(153,163,168)] data-[state=active]:to-[rgb(153,163,168)] data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">{tr("Parametre")}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="reservations">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-bold mb-4">{tr("Mes reservations (client)")}</h2>
                  {bookingActionMessage && (
                    <p className="mb-4 rounded-xl border border-border bg-white px-4 py-3 text-sm text-muted-foreground">
                      {bookingActionMessage}
                    </p>
                  )}
                  {loadingBookings ? (
                    <div className="py-8 text-center text-muted-foreground">{tr("Chargement des reservations...")}</div>
                  ) : myBookings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md border border-border overflow-hidden p-12 text-center">
                      <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                      <h3 className="text-lg font-medium text-muted-foreground">{tr("Aucune reservation pour le moment.")}</h3>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {myBookings.map((booking) => (
                        <div key={booking.id} className="bg-white rounded-2xl border border-border p-5 space-y-3 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                          <h3 className="font-semibold text-lg">
                            {booking.listing_title ?? tr("Annonce #{id}", { id: booking.listing_id })}
                          </h3>
                          <p className="text-sm text-muted-foreground">{booking.listing_location ?? "-"}</p>
                          <div className="text-sm text-muted-foreground">
                            {tr("Du {start} au {end}", { start: formatDate(booking.start_date), end: formatDate(booking.end_date) })}
                          </div>
                          {booking.seats_reserved && (
                            <div className="text-sm text-muted-foreground">{tr("Quantite reservee: {count}", { count: booking.seats_reserved })}</div>
                          )}
                          <div className="flex items-center justify-between pt-3 border-t border-border">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${bookingStatusBadgeClass(
                                booking.status
                              )}`}
                            >
                              {formatBookingStatus(booking.status)}
                            </span>
                            <span className="font-bold">{formatDza(booking.total_price)}</span>
                          </div>
                          {(booking.status === "pending" || booking.status === "confirmed") && (
                            <div className="pt-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="rounded-full"
                                onClick={() => void onCancelBooking(booking.id)}
                                disabled={cancellingBookingId === booking.id}
                              >
                                {cancellingBookingId === booking.id ? tr("Annulation...") : tr("Annuler la reservation")}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isHost && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">{tr("Demandes recues (hote)")}</h2>
                    {loadingHostBookings ? (
                      <div className="py-8 text-center text-muted-foreground">{tr("Chargement des demandes recues...")}</div>
                    ) : hostBookings.length === 0 ? (
                      <div className="bg-white rounded-2xl shadow-md border border-border overflow-hidden p-12 text-center">
                        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-muted-foreground">{tr("Aucune demande recue pour le moment.")}</h3>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {hostBookings.map((booking) => (
                          <div key={booking.id} className="bg-white rounded-2xl border border-border p-5 space-y-3 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                            <h3 className="font-semibold text-lg">
                              {booking.listing_title ?? tr("Annonce #{id}", { id: booking.listing_id })}
                            </h3>
                            <p className="text-sm text-muted-foreground">{booking.listing_location ?? "-"}</p>
                            <p className="text-sm text-muted-foreground">
                              {tr("Client: {name}", {
                                name: booking.requester_full_name ?? booking.requester_email ?? tr("Utilisateur #{id}", { id: booking.user_id }),
                              })}
                            </p>
                            <div className="text-sm text-muted-foreground">
                              {tr("Du {start} au {end}", { start: formatDate(booking.start_date), end: formatDate(booking.end_date) })}
                            </div>
                            {booking.seats_reserved && (
                              <div className="text-sm text-muted-foreground">{tr("Quantite reservee: {count}", { count: booking.seats_reserved })}</div>
                            )}
                            <div className="flex items-center justify-between pt-3 border-t border-border">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-semibold ${bookingStatusBadgeClass(
                                  booking.status
                                )}`}
                              >
                                {formatBookingStatus(booking.status)}
                              </span>
                              <span className="font-bold">{formatDza(booking.total_price)}</span>
                            </div>
                            {booking.status === "pending" && (
                              <div className="flex gap-2 pt-2">
                                <Button
                                  type="button"
                                  size="sm"
                                  className="rounded-full"
                                  onClick={() => void onConfirmBooking(booking.id)}
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  {tr("Confirmer")}
                                </Button>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full"
                                  onClick={() => void onRejectBooking(booking.id)}
                                >
                                  <X className="mr-1 h-4 w-4" />
                                  {tr("Refuser")}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="annonces">
              <div className="space-y-6">
                {!isHost ? (
                  <div className="bg-white rounded-2xl border border-border p-6 text-muted-foreground">
                    {tr("Activez votre compte hote pour publier des annonces avec photos et details.")}
                    <div className="mt-4">
                      <Link to="/devenir-hote">
                        <Button className="rounded-full">{tr("Activer le mode hote")}</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={onSubmitCreateListing} className="bg-white rounded-2xl border border-border p-6 space-y-4">
                    <h2 className="text-xl font-bold">{tr("Ajouter une nouvelle annonce")}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        required
                        value={createForm.title}
                        onChange={(event) => setCreateForm((current) => ({ ...current, title: event.target.value }))}
                        placeholder={tr("Titre")}
                        className="w-full p-2 rounded-lg border border-border bg-gray-50"
                      />
                      <select
                        value={createForm.type}
                        onChange={(event) => onCreateTypeChange(event.target.value as "immobilier" | "vehicule" | "activite")}
                        className="w-full p-2 rounded-lg border border-border bg-gray-50"
                      >
                        <option value="immobilier">{tr("Immobilier")}</option>
                        <option value="vehicule">{tr("Vehicule")}</option>
                        <option value="activite">{tr("Activite")}</option>
                      </select>
                      {isVehicule ? (
                        <select
                          value={createForm.category}
                          onChange={(event) => setCreateForm((current) => ({ ...current, category: event.target.value }))}
                          className="w-full p-2 rounded-lg border border-border bg-gray-50"
                        >
                          <option value="location">{tr("Location")}</option>
                          <option value="covoiturage">{tr("Covoiturage")}</option>
                        </select>
                      ) : isImmobilier ? (
                        <select
                          value={createForm.category}
                          onChange={(event) => {
                            const nextCategory = event.target.value;
                            const normalizedNextCategory = nextCategory.trim().toLowerCase();
                            const nextIsHotel = normalizedNextCategory === "hotel" || normalizedNextCategory === "hôtel";
                            setCreateForm((current) => ({
                              ...current,
                              category: nextCategory,
                              period: nextIsHotel ? "nuit" : current.period,
                              bedrooms: nextIsHotel ? "" : current.bedrooms,
                              area: nextIsHotel ? "" : current.area,
                              hotel_rooms_available: nextIsHotel ? current.hotel_rooms_available : "",
                              hotel_double_beds: nextIsHotel ? current.hotel_double_beds : "",
                              hotel_single_beds: nextIsHotel ? current.hotel_single_beds : "",
                            }));
                          }}
                          className="w-full p-2 rounded-lg border border-border bg-gray-50"
                        >
                          {IMMOBILIER_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {formatListingCategory(category)}
                            </option>
                          ))}
                        </select>
                      ) : isActivite ? (
                        <select
                          value={createForm.category}
                          onChange={(event) => setCreateForm((current) => ({ ...current, category: event.target.value }))}
                          className="w-full p-2 rounded-lg border border-border bg-gray-50"
                        >
                          {ACTIVITY_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {formatListingCategory(category)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={createForm.category}
                          onChange={(event) => setCreateForm((current) => ({ ...current, category: event.target.value }))}
                          placeholder={tr("Categorie")}
                          className="w-full p-2 rounded-lg border border-border bg-gray-50"
                        />
                      )}
                      {!isCarpoolCreate && (
                        <div className="sm:col-span-2 space-y-2">
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                              required
                              value={createForm.location}
                              onChange={(event) =>
                                setCreateForm((current) => ({
                                  ...current,
                                  location: event.target.value,
                                  exact_latitude: "",
                                  exact_longitude: "",
                                }))
                              }
                              placeholder={tr("Localisation")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50 sm:flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsLocationMapOpen((current) => !current)}
                            >
                              <MapPin className="mr-1 h-4 w-4" />
                              {isLocationMapOpen ? tr("Fermer la carte") : tr("Carte")}
                            </Button>
                          </div>
                          {!locationSearchLoading && locationSearchSuggestions.length > 0 && locationSearchQuery.length > 1 && (
                            <div className="max-h-52 overflow-y-auto rounded-lg border border-border bg-white shadow-sm">
                              <ul className="divide-y divide-border">
                                {locationSearchSuggestions.map((suggestion, index) => (
                                  <li key={`${suggestion.label}-${index}`}>
                                    <button
                                      type="button"
                                      onClick={() => onSelectLocationSuggestion(suggestion)}
                                      className="w-full px-3 py-2 text-left text-sm text-foreground hover:bg-muted/60"
                                    >
                                      {suggestion.label}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {locationSearchLoading && (
                            <p className="text-xs text-muted-foreground">{tr("Recherche sur la carte...")}</p>
                          )}
                          {!locationSearchLoading && locationSearchError && locationSearchQuery.length > 1 && (
                            <p className="text-xs text-muted-foreground">{locationSearchError}</p>
                          )}
                          {locationSearchCoordinates && !hasExactCoordinates && (
                            <p className="text-xs text-muted-foreground">
                              {tr("Localisation trouvee: {label}", { label: locationSearchCoordinates.label })}
                            </p>
                          )}
                          {isLocationMapOpen && (
                            <div className="space-y-3 rounded-xl border border-border bg-white p-3">
                              <div>
                                <p className="text-sm font-semibold">{tr("Carte de localisation")}</p>
                                <p className="text-xs text-muted-foreground">
                                  {tr("Saisissez une ville ou un lieu dans localisation pour centrer la carte.")}
                                </p>
                              </div>
                              <div className="h-[50vh] min-h-[320px] overflow-hidden rounded-lg border border-border bg-white">
                                <iframe
                                  title={tr("Carte Algerie")}
                                  src={algeriaMapEmbedUrl}
                                  className="h-full w-full"
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Button type="button" size="sm" variant="outline" onClick={onUseCurrentLocation}>
                                  {tr("Utiliser ma position")}
                                </Button>
                                <a
                                  href={algeriaMapExternalUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs font-medium text-primary underline underline-offset-2"
                                >
                                  {tr("Ouvrir OpenStreetMap")}
                                </a>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <input
                                  type="number"
                                  step="0.000001"
                                  min="-90"
                                  max="90"
                                  value={createForm.exact_latitude}
                                  onChange={(event) =>
                                    setCreateForm((current) => ({ ...current, exact_latitude: event.target.value }))
                                  }
                                  placeholder={tr("Latitude (optionnel)")}
                                  className="w-full p-2 rounded-lg border border-border bg-white"
                                />
                                <input
                                  type="number"
                                  step="0.000001"
                                  min="-180"
                                  max="180"
                                  value={createForm.exact_longitude}
                                  onChange={(event) =>
                                    setCreateForm((current) => ({ ...current, exact_longitude: event.target.value }))
                                  }
                                  placeholder={tr("Longitude (optionnel)")}
                                  className="w-full p-2 rounded-lg border border-border bg-white"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      <input
                        required
                        type="number"
                        min="1"
                        value={createForm.price}
                        onChange={(event) => setCreateForm((current) => ({ ...current, price: event.target.value }))}
                        placeholder={tr("Prix")}
                        className="w-full p-2 rounded-lg border border-border bg-gray-50"
                      />
                      {!isCarpoolCreate && !isActivite && (
                        isImmobilier ? (
                          !isHotelCreate ? (
                            <select
                              value={createForm.period}
                              onChange={(event) => setCreateForm((current) => ({ ...current, period: event.target.value }))}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            >
                              <option value="nuit">{tr("Par nuit")}</option>
                              <option value="mois">{tr("Par mois")}</option>
                            </select>
                          ) : null
                        ) : (
                          <input
                            value={createForm.period}
                            onChange={(event) => setCreateForm((current) => ({ ...current, period: event.target.value }))}
                            placeholder={tr("Periode (jour, semaine...)")}
                            className="w-full p-2 rounded-lg border border-border bg-gray-50"
                          />
                        )
                      )}
                      {!isCarpoolCreate && (
                        <AvailabilityDatePicker
                          value={createForm.availability_dates}
                          onChange={(nextValue) => setCreateForm((current) => ({ ...current, availability_dates: nextValue }))}
                          locale={locale}
                          calendarLocale={calendarLocale}
                          tr={tr}
                        />
                      )}
                      {isImmobilier && (
                        <>
                          {isHotelCreate ? (
                            <>
                              <input
                                required
                                type="number"
                                min="1"
                                value={createForm.hotel_rooms_available}
                                onChange={(event) =>
                                  setCreateForm((current) => ({ ...current, hotel_rooms_available: event.target.value }))
                                }
                                placeholder={tr("Nombre de chambres disponibles")}
                                className="w-full p-2 rounded-lg border border-border bg-gray-50"
                              />
                              <input
                                required
                                type="number"
                                min="0"
                                value={createForm.hotel_double_beds}
                                onChange={(event) =>
                                  setCreateForm((current) => ({ ...current, hotel_double_beds: event.target.value }))
                                }
                                placeholder={tr("Nombre de lits doubles")}
                                className="w-full p-2 rounded-lg border border-border bg-gray-50"
                              />
                              <input
                                required
                                type="number"
                                min="0"
                                value={createForm.hotel_single_beds}
                                onChange={(event) =>
                                  setCreateForm((current) => ({ ...current, hotel_single_beds: event.target.value }))
                                }
                                placeholder={tr("Nombre de lits simples")}
                                className="w-full p-2 rounded-lg border border-border bg-gray-50"
                              />
                              <input
                                type="number"
                                readOnly
                                value={hotelBedsTotal}
                                placeholder={tr("Total des lits")}
                                className="w-full p-2 rounded-lg border border-border bg-gray-100 text-muted-foreground"
                              />
                            </>
                          ) : (
                            <input
                              required
                              type="number"
                              min="0"
                              value={createForm.bedrooms}
                              onChange={(event) => setCreateForm((current) => ({ ...current, bedrooms: event.target.value }))}
                              placeholder={tr("Chambres")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                          )}
                          <input
                            required
                            type="number"
                            min="0"
                            value={createForm.bathrooms}
                            onChange={(event) => setCreateForm((current) => ({ ...current, bathrooms: event.target.value }))}
                            placeholder={tr("Salles de bain")}
                            className="w-full p-2 rounded-lg border border-border bg-gray-50"
                          />
                          {!isHotelCreate && (
                            <input
                              required
                              type="number"
                              min="0"
                              value={createForm.area}
                              onChange={(event) => setCreateForm((current) => ({ ...current, area: event.target.value }))}
                              placeholder={tr("Surface (m2)")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                          )}
                        </>
                      )}
                    </div>
                    <textarea
                      value={createForm.description}
                      onChange={(event) => setCreateForm((current) => ({ ...current, description: event.target.value }))}
                      placeholder={tr("Description")}
                      className="w-full p-2 rounded-lg border border-border bg-gray-50 min-h-24"
                    />
                    {isImmobilier && (
                      <div className="space-y-3">
                        <label className="text-sm font-medium">{tr("Voyageurs")}</label>
                        <input
                          type="number"
                          min="1"
                          value={createForm.travelers}
                          onChange={(event) => setCreateForm((current) => ({ ...current, travelers: event.target.value }))}
                          placeholder={tr("Nombre de voyageurs")}
                          className="w-full p-2 rounded-lg border border-border bg-gray-50"
                        />
                        <label className="text-sm font-medium">{tr("Equipements")}</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {IMMOBILIER_AMENITIES.map((amenity) => (
                            <label key={amenity} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={createForm.amenities[amenity]}
                                onChange={(event) =>
                                  setCreateForm((current) => ({
                                    ...current,
                                    amenities: { ...current.amenities, [amenity]: event.target.checked },
                                  }))
                                }
                              />
                              <span>{tr(amenity)}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    {isVehicule && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {isCarpoolCreate ? (
                          <>
                            <input
                              required
                              value={createForm.carpool_departure_date}
                              type="date"
                              onChange={(event) =>
                                setCreateForm((current) => ({ ...current, carpool_departure_date: event.target.value }))
                              }
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                            <input
                              required
                              value={createForm.carpool_departure_time}
                              type="time"
                              onChange={(event) =>
                                setCreateForm((current) => ({ ...current, carpool_departure_time: event.target.value }))
                              }
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                            <input
                              required
                              value={createForm.carpool_departure_place}
                              onChange={(event) =>
                                setCreateForm((current) => ({ ...current, carpool_departure_place: event.target.value }))
                              }
                              placeholder={tr("Lieu de depart")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                            <input
                              required
                              value={createForm.carpool_destination}
                              onChange={(event) =>
                                setCreateForm((current) => ({ ...current, carpool_destination: event.target.value }))
                              }
                              placeholder={tr("Destination")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                            <input
                              required
                              type="number"
                              min="1"
                              value={createForm.carpool_passengers}
                              onChange={(event) =>
                                setCreateForm((current) => ({ ...current, carpool_passengers: event.target.value }))
                              }
                              placeholder={tr("Nombre de passagers")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                            <input
                              required
                              value={createForm.carpool_plate}
                              onChange={(event) =>
                                setCreateForm((current) => ({ ...current, carpool_plate: event.target.value }))
                              }
                              placeholder={tr("Matricule")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                            <input
                              value={createForm.vehicle_brand}
                              onChange={(event) => setCreateForm((current) => ({ ...current, vehicle_brand: event.target.value }))}
                              placeholder={tr("Marque vehicule (optionnel)")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                            <input
                              value={createForm.vehicle_model}
                              onChange={(event) => setCreateForm((current) => ({ ...current, vehicle_model: event.target.value }))}
                              placeholder={tr("Modele vehicule (optionnel)")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                          </>
                        ) : (
                          <>
                            <input
                              required
                              value={createForm.vehicle_brand}
                              onChange={(event) => setCreateForm((current) => ({ ...current, vehicle_brand: event.target.value }))}
                              placeholder={tr("Marque")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                            <input
                              required
                              value={createForm.vehicle_model}
                              onChange={(event) => setCreateForm((current) => ({ ...current, vehicle_model: event.target.value }))}
                              placeholder={tr("Modele")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                            <input
                              type="number"
                              min="1900"
                              value={createForm.vehicle_year}
                              onChange={(event) => setCreateForm((current) => ({ ...current, vehicle_year: event.target.value }))}
                              placeholder={tr("Annee")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                            <input
                              type="number"
                              min="0"
                              value={createForm.vehicle_mileage}
                              onChange={(event) => setCreateForm((current) => ({ ...current, vehicle_mileage: event.target.value }))}
                              placeholder={tr("Kilometrage")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                            <input
                              value={createForm.vehicle_fuel}
                              onChange={(event) => setCreateForm((current) => ({ ...current, vehicle_fuel: event.target.value }))}
                              placeholder={tr("Carburant")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                            <input
                              value={createForm.vehicle_transmission}
                              onChange={(event) => setCreateForm((current) => ({ ...current, vehicle_transmission: event.target.value }))}
                              placeholder={tr("Transmission")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                            <input
                              type="number"
                              min="1"
                              value={createForm.vehicle_seats}
                              onChange={(event) => setCreateForm((current) => ({ ...current, vehicle_seats: event.target.value }))}
                              placeholder={tr("Places")}
                              className="w-full p-2 rounded-lg border border-border bg-gray-50"
                            />
                          </>
                        )}
                      </div>
                    )}
                    {isActivite && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          required
                          value={createForm.activity_duration}
                          onChange={(event) => setCreateForm((current) => ({ ...current, activity_duration: event.target.value }))}
                          placeholder={tr("Duree (ex: 2h)")}
                          className="w-full p-2 rounded-lg border border-border bg-gray-50"
                        />
                        <select
                          required
                          value={createForm.activity_level}
                          onChange={(event) => setCreateForm((current) => ({ ...current, activity_level: event.target.value }))}
                          className="w-full p-2 rounded-lg border border-border bg-gray-50"
                        >
                          {ACTIVITY_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              {formatActivityLevel(level)}
                            </option>
                          ))}
                        </select>
                        <input
                          type="number"
                          min="1"
                          value={createForm.activity_participants_max}
                          onChange={(event) => setCreateForm((current) => ({ ...current, activity_participants_max: event.target.value }))}
                          placeholder={tr("Participants max")}
                          className="w-full p-2 rounded-lg border border-border bg-gray-50"
                        />
                        <textarea
                          value={createForm.activity_included}
                          onChange={(event) => setCreateForm((current) => ({ ...current, activity_included: event.target.value }))}
                          placeholder={tr("Inclus (materiel, guide, transport...)")}
                          className="w-full p-2 rounded-lg border border-border bg-gray-50 min-h-24 sm:col-span-2"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{tr("Photos de l'annonce")}</label>
                      <input type="file" accept="image/*" multiple onChange={onListingFilesSelected} className="w-full p-2 rounded-lg border border-border bg-gray-50" />
                      {listingFiles.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs text-muted-foreground">{tr("{count} image(s) selectionnee(s)", { count: listingFiles.length })}</p>
                            <Button type="button" size="sm" variant="outline" onClick={() => setListingFiles([])}>
                              {tr("Effacer")}
                            </Button>
                          </div>
                          <div className="max-h-24 overflow-y-auto rounded-lg border border-border bg-white p-2">
                            <ul className="space-y-1 text-xs text-muted-foreground">
                              {listingFiles.map((file) => (
                                <li key={`${file.name}-${file.lastModified}`}>{file.name}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                    {createMessage && <p className="text-sm text-muted-foreground">{createMessage}</p>}
                    <Button type="submit" className="rounded-full px-8" disabled={uploadingListingImages}>
                      {uploadingListingImages ? tr("Upload des photos...") : tr("Publier l'annonce")}
                    </Button>
                  </form>
                )}

                <div ref={myListingsSectionRef} className="space-y-4">
                  <h2 className="text-xl font-bold">{tr("Mes annonces")}</h2>
                  {listingActionMessage && <p className="text-sm text-muted-foreground">{listingActionMessage}</p>}
                  {loadingListings ? (
                    <div className="py-8 text-center text-muted-foreground">{tr("Chargement des annonces...")}</div>
                  ) : myListings.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md border border-border overflow-hidden p-12 text-center text-muted-foreground">
                      {tr("Vous n'avez pas encore publie d'annonce.")}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {myListings.map((listing) => (
                        <div key={listing.id} className="bg-white rounded-2xl overflow-hidden shadow-md border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
                          <div className="relative">
                            {listing.images.length <= 1 ? (
                              <div className="relative h-48">
                                <ImageWithFallback
                                  src={listing.images[0]?.url ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400"}
                                  alt={listing.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="flex h-48 snap-x snap-mandatory overflow-x-auto">
                                {listing.images.map((image) => (
                                  <div key={image.id} className="h-48 min-w-full snap-start">
                                    <ImageWithFallback
                                      src={image.url}
                                      alt={listing.title}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            {listing.images.length > 1 && (
                              <span className="absolute right-2 top-2 rounded-full bg-black/65 px-2 py-1 text-[11px] font-medium text-white">
                                {tr("{count} image(s) selectionnee(s)", { count: listing.images.length })}
                              </span>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
                            <div className="flex items-center gap-1 text-muted-foreground text-sm mb-4">
                              <MapPin className="w-4 h-4" />
                              <span>{listing.location}</span>
                            </div>
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-lg font-bold">{formatDza(listing.price)}</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{tr("N/A")}</span>
                              </div>
                            </div>
                            <div className="flex gap-4 text-sm text-muted-foreground pt-4 border-t border-border">
                              <div>
                                {tr("Type:")} <span className="font-medium text-foreground">{formatListingType(listing.type)}</span>
                              </div>
                              <div>
                                {tr("Categorie:")} <span className="font-medium text-foreground">{formatListingCategory(listing.category)}</span>
                              </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                              <Button type="button" size="sm" variant="outline" onClick={() => startEditingListing(listing)}>
                                {tr("Modifier")}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => void onDeleteListing(listing.id)}
                                disabled={deletingListingId === listing.id}
                              >
                                {deletingListingId === listing.id ? tr("Suppression...") : tr("Supprimer")}
                              </Button>
                              <Link to={`/detail/${listing.id}`} className="ml-auto">
                                <Button type="button" size="sm" variant="outline">
                                  {tr("Voir")}
                                </Button>
                              </Link>
                            </div>
                            {editingListingId === listing.id && (
                              <form className="mt-4 space-y-3 border-t border-border pt-4" onSubmit={(event) => void onSubmitEditListing(event, listing)}>
                                <input
                                  required
                                  value={editListingForm.title}
                                  onChange={(event) => setEditListingForm((current) => ({ ...current, title: event.target.value }))}
                                  className="w-full p-2 rounded-lg border border-border bg-gray-50"
                                  placeholder={tr("Titre")}
                                />
                                <textarea
                                  value={editListingForm.description}
                                  onChange={(event) => setEditListingForm((current) => ({ ...current, description: event.target.value }))}
                                  className="w-full p-2 rounded-lg border border-border bg-gray-50 min-h-20"
                                  placeholder={tr("Description")}
                                />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  <input
                                    value={editListingForm.category}
                                    onChange={(event) => setEditListingForm((current) => ({ ...current, category: event.target.value }))}
                                    className="w-full p-2 rounded-lg border border-border bg-gray-50"
                                    placeholder={tr("Categorie")}
                                  />
                                  <input
                                    required
                                    value={editListingForm.location}
                                    onChange={(event) => setEditListingForm((current) => ({ ...current, location: event.target.value }))}
                                    className="w-full p-2 rounded-lg border border-border bg-gray-50"
                                    placeholder={tr("Localisation")}
                                  />
                                  <input
                                    required
                                    type="number"
                                    min="1"
                                    value={editListingForm.price}
                                    onChange={(event) => setEditListingForm((current) => ({ ...current, price: event.target.value }))}
                                    className="w-full p-2 rounded-lg border border-border bg-gray-50"
                                    placeholder={tr("Prix")}
                                  />
                                  <input
                                    value={editListingForm.period}
                                    onChange={(event) => setEditListingForm((current) => ({ ...current, period: event.target.value }))}
                                    className="w-full p-2 rounded-lg border border-border bg-gray-50"
                                    placeholder={tr("Periode")}
                                  />
                                </div>
                                <AvailabilityDatePicker
                                  value={editListingForm.availability_dates}
                                  onChange={(nextValue) =>
                                    setEditListingForm((current) => ({ ...current, availability_dates: nextValue }))
                                  }
                                  locale={locale}
                                  calendarLocale={calendarLocale}
                                  tr={tr}
                                />
                                <div className="flex gap-2">
                                  <Button type="submit" size="sm" disabled={savingListingUpdate}>
                                    {savingListingUpdate ? tr("Enregistrement...") : tr("Enregistrer")}
                                  </Button>
                                  <Button type="button" size="sm" variant="outline" onClick={cancelEditingListing}>
                                    {tr("Annuler")}
                                  </Button>
                                </div>
                              </form>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-white/90 p-3 shadow-sm backdrop-blur">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="inline-flex w-full rounded-2xl border border-border bg-slate-50 p-1 sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setMessagesView("notifications");
                          setIsConversationFocused(false);
                        }}
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors sm:flex-none ${messagesView === "notifications"
                          ? "bg-white text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        <Bell className="h-4 w-4" />
                        {tr("Notifications")}
                        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-semibold text-primary">
                          {unreadNotificationsCount}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessagesView("messages")}
                        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors sm:flex-none ${messagesView === "messages"
                          ? "bg-white text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        <MessageCircle className="h-4 w-4" />
                        {tr("Messages")}
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-700">
                          {unreadMessageNotificationsCount}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {messagesView === "notifications" ? (
                  <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-md">
                    <div
                      className="flex items-center justify-between border-b border-border px-4 py-3"
                      style={{ background: "linear-gradient(180deg, rgba(0,166,166,0.08) 0%, rgba(255,255,255,0) 100%)" }}
                    >
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{tr("Notifications")}</h3>
                        {unreadNotificationsCount > 0 && (
                          <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                            {unreadNotificationsCount}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => void onMarkAllNotificationsRead()}
                        disabled={notifications.length === 0 || unreadNotificationsCount === 0}
                      >
                        {tr("Tout lire")}
                      </Button>
                    </div>
                    <div className="max-h-[620px] space-y-2 overflow-y-auto bg-slate-50/40 p-3">
                      {loadingNotifications ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">{tr("Chargement des notifications...")}</p>
                      ) : notifications.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-border bg-white/90 p-6 text-center text-sm text-muted-foreground">
                          {tr("Aucune notification.")}
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`rounded-2xl border p-3 shadow-sm transition-colors ${notification.is_read
                              ? "border-border bg-white"
                              : "border-primary/30 bg-gradient-to-r from-primary/10 to-white"
                              }`}
                          >
                            <div className="flex items-start gap-3">
                              <span
                                className={`mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${notificationTypeSurfaceClass(notification.type)}`}
                              >
                                {renderNotificationTypeIcon(notification.type)}
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p className="text-sm font-semibold leading-5">{notification.title}</p>
                                  {!notification.is_read && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="h-7 rounded-full px-2 text-xs"
                                      onClick={() => void onMarkNotificationRead(notification.id)}
                                    >
                                      {tr("Lu")}
                                    </Button>
                                  )}
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{notification.body}</p>
                                <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(notification.created_at)}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-md">
                    {!isConversationFocused ? (
                      <div className="min-h-[620px] bg-slate-50/40">
                        <div className="border-b border-border px-4 py-3">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold">{tr("Messagerie reservation")}</h3>
                            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
                              {conversationBookings.length}
                            </span>
                          </div>
                        </div>
                        <div className="max-h-[560px] space-y-2 overflow-y-auto p-3">
                          {conversationBookings.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-border bg-white p-4 text-sm text-muted-foreground">
                              {tr("Aucune conversation")}
                            </div>
                          ) : (
                            conversationBookings.map((booking) => {
                              const isSelected = booking.id === selectedConversationBookingId;
                              return (
                                <button
                                  key={booking.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedConversationBookingId(booking.id);
                                    setIsConversationFocused(true);
                                  }}
                                  className={`w-full rounded-2xl border px-3 py-3 text-left transition-all ${isSelected
                                    ? "border-primary/40 bg-primary/10 shadow-sm"
                                    : "border-border bg-white hover:border-primary/30 hover:bg-primary/5"
                                    }`}
                                >
                                  <p className="line-clamp-1 text-sm font-semibold">
                                    {booking.listing_title ?? tr("Annonce #{id}", { id: booking.listing_id })}
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {tr("Du {start} au {end}", {
                                      start: formatDate(booking.start_date),
                                      end: formatDate(booking.end_date),
                                    })}
                                  </p>
                                  <div className="mt-2 flex items-center justify-between gap-2">
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${bookingStatusBadgeClass(
                                        booking.status
                                      )}`}
                                    >
                                      {formatBookingStatus(booking.status)}
                                    </span>
                                    <span className="text-xs font-semibold text-muted-foreground">
                                      {formatDza(booking.total_price)}
                                    </span>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ) : (
                      <section className="flex min-h-[620px] flex-col">
                        <div className="border-b border-border px-4 py-3">
                          <h3 className="mb-2 text-sm font-semibold">{tr("Messagerie reservation")}</h3>
                          {selectedConversationBooking ? (
                            <div className="flex flex-col gap-2">
                              <p className="text-sm font-semibold">
                                {tr("Reservation #{id} - {title}", {
                                  id: selectedConversationBooking.id,
                                  title:
                                    selectedConversationBooking.listing_title
                                    ?? tr("Annonce #{id}", { id: selectedConversationBooking.listing_id }),
                                })}
                              </p>
                              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${bookingStatusBadgeClass(
                                    selectedConversationBooking.status
                                  )}`}
                                >
                                  {formatBookingStatus(selectedConversationBooking.status)}
                                </span>
                                <span>{formatDate(selectedConversationBooking.start_date)}</span>
                                <span className="h-1 w-1 rounded-full bg-slate-300" />
                                <span>{selectedConversationBooking.listing_location ?? "-"}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">{tr("Aucune conversation")}</p>
                          )}
                        </div>

                        <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50/70 via-white to-slate-100/60 p-4 sm:p-5">
                          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
                            {loadingMessages ? (
                              <p className="py-6 text-center text-sm text-muted-foreground">{tr("Chargement des messages...")}</p>
                            ) : bookingMessages.length === 0 ? (
                              <div className="rounded-2xl border border-dashed border-border bg-white p-6 text-center text-sm text-muted-foreground">
                                {tr("Aucun message pour cette reservation. Envoyez le premier message.")}
                              </div>
                            ) : (
                              bookingMessages.map((message) => {
                                const isMine = message.sender_id === user?.id;
                                return (
                                  <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                                    <div
                                      className={`max-w-[92%] rounded-3xl border px-4 py-3 text-sm shadow-sm sm:max-w-[80%] ${isMine
                                        ? "border-[rgb(34,45,49)]/30 bg-gradient-to-br from-[rgb(34,45,49)] to-[rgb(60,75,80)] text-white"
                                        : "border-slate-200 bg-white text-foreground"
                                        }`}
                                    >
                                      <div className={`mb-2 flex items-center gap-2 text-[11px] ${isMine ? "text-white/80" : "text-muted-foreground"}`}>
                                        <span className="font-semibold">
                                          {isMine ? tr("Vous") : message.sender_name ?? tr("Interlocuteur")}
                                        </span>
                                        <span className={`h-1 w-1 rounded-full ${isMine ? "bg-white/70" : "bg-slate-300"}`} />
                                        <span>{formatDateTime(message.created_at)}</span>
                                      </div>
                                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                        <form onSubmit={onSendMessage} className="border-t border-border bg-white/90 p-3 backdrop-blur sm:p-4">
                          <div className="flex gap-2">
                            <input
                              value={messageDraft}
                              onChange={(event) => setMessageDraft(event.target.value)}
                              placeholder={tr("Ecrire un message...")}
                              className="flex-1 rounded-2xl border border-border bg-slate-50 px-3 py-2 text-sm outline-none transition-colors focus:border-primary/40"
                              disabled={!selectedConversationBookingId || sendingMessage}
                            />
                            <Button
                              type="submit"
                              className="rounded-2xl px-4"
                              disabled={!selectedConversationBookingId || sendingMessage}
                            >
                              <SendHorizontal className="mr-1 h-4 w-4" />
                              {sendingMessage ? tr("Envoi...") : tr("Envoyer")}
                            </Button>
                          </div>
                          {messageActionMessage && (
                            <p className="mt-2 text-sm text-muted-foreground">{messageActionMessage}</p>
                          )}
                        </form>
                      </section>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="favoris">
              {loadingFavorites ? (
                <div className="py-8 text-center text-muted-foreground">{tr("Chargement des favoris...")}</div>
              ) : favoriteListings.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-md border border-border overflow-hidden p-12 text-center">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium text-muted-foreground">{tr("Vous n'avez pas encore de favoris")}</h3>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {favoriteListings.map((listing) => (
                    <Link
                      key={listing.id}
                      to={`/detail/${listing.id}`}
                      className="bg-white rounded-2xl overflow-hidden shadow-md border border-border hover:shadow-lg transition-shadow"
                    >
                      <div className="relative h-48">
                        <ImageWithFallback
                          src={listing.images[0]?.url ?? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400"}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
                        <p className="text-muted-foreground text-sm">{listing.location}</p>
                        <p className="font-bold mt-2">{formatDza(listing.price)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="profil">
              <div className="bg-white rounded-2xl shadow-md border border-border p-6 max-w-3xl space-y-8">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="w-24 h-24" style={{ border: "4px solid var(--primary)", boxShadow: "0 0 0 4px rgba(0,166,166,0.1), 0 10px 15px -3px rgba(0,0,0,0.1)" }}>
                      <AvatarImage src={profileForm.avatar_url || undefined} />
                      <AvatarFallback className="text-white text-2xl font-bold" style={{ background: "linear-gradient(135deg, var(--primary), rgb(34,45,49))" }}>
                        {user?.full_name?.charAt(0).toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute rounded-full" style={{ bottom: "4px", right: "4px", width: "20px", height: "20px", background: "#34d399", border: "3px solid white", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{user?.full_name || tr("Utilisateur 3ich")}</h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                    <p className="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold text-primary" style={{ background: "rgba(0,166,166,0.1)" }}>
                      {tr("Statut: {role}", { role: userRoleLabel })}
                    </p>
                  </div>
                </div>

                <form onSubmit={onSubmitProfile} className="space-y-4">
                  <h4 className="font-semibold">{tr("Informations du profil")}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">{tr("Email")}</label>
                      <input
                        type="email"
                        className="w-full p-2 rounded-lg border border-border bg-gray-50"
                        value={profileForm.email}
                        onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">{tr("Nom complet")}</label>
                      <input
                        className="w-full p-2 rounded-lg border border-border bg-gray-50"
                        value={profileForm.full_name}
                        onChange={(event) => setProfileForm((current) => ({ ...current, full_name: event.target.value }))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">{tr("Telephone")}</label>
                      <input
                        className="w-full p-2 rounded-lg border border-border bg-gray-50"
                        value={profileForm.phone_number}
                        onChange={(event) => setProfileForm((current) => ({ ...current, phone_number: event.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">{tr("Ou importer une photo")}</label>
                    <input type="file" accept="image/*" capture="environment" onChange={onAvatarSelected} className="w-full p-2 rounded-lg border border-border bg-gray-50" />
                    {uploadingAvatar && <p className="text-xs text-muted-foreground">{tr("Upload en cours...")}</p>}
                  </div>
                  {profileMessage && <p className="text-sm text-muted-foreground">{profileMessage}</p>}
                  <Button type="submit" className="rounded-full px-8">{tr("Enregistrer les modifications")}</Button>
                </form>

                <form onSubmit={onSubmitPassword} className="space-y-4 border-t border-border pt-6">
                  <h4 className="font-semibold">{tr("Changer le mot de passe")}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      required
                      type="password"
                      minLength={8}
                      placeholder={tr("Mot de passe actuel")}
                      className="w-full p-2 rounded-lg border border-border bg-gray-50"
                      value={passwordForm.current_password}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, current_password: event.target.value }))}
                    />
                    <input
                      required
                      type="password"
                      minLength={8}
                      placeholder={tr("Nouveau mot de passe")}
                      className="w-full p-2 rounded-lg border border-border bg-gray-50"
                      value={passwordForm.new_password}
                      onChange={(event) => setPasswordForm((current) => ({ ...current, new_password: event.target.value }))}
                    />
                  </div>
                  <input
                    required
                    type="password"
                    minLength={8}
                    placeholder={tr("Confirmer le nouveau mot de passe")}
                    className="w-full p-2 rounded-lg border border-border bg-gray-50"
                    value={passwordForm.confirm_password}
                    onChange={(event) => setPasswordForm((current) => ({ ...current, confirm_password: event.target.value }))}
                  />
                  {passwordMessage && <p className="text-sm text-muted-foreground">{passwordMessage}</p>}
                  <Button type="submit" variant="outline" className="rounded-full px-8">{tr("Mettre a jour le mot de passe")}</Button>
                </form>

                <div className="space-y-4 border-t border-border pt-6">
                  <h4 className="font-semibold">{tr("Supprimer mon compte")}</h4>
                  {!deleteDialogOpen ? (
                    <Button
                      type="button"
                      variant="destructive"
                      className="rounded-full"
                      disabled={deletingAccount}
                      onClick={openDeleteAccountPanel}
                    >
                      {tr("Supprimer mon compte")}
                    </Button>
                  ) : (
                    <div className="space-y-4 rounded-2xl border border-destructive/20 bg-destructive/5 p-4">
                      {deleteStep === "confirm" ? (
                        <>
                          <p className="text-sm font-medium">{tr("Vous etes sur de supprimer votre compte ?")}</p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              disabled={deletingAccount}
                              onClick={closeDeleteAccountPanel}
                            >
                              {tr("Non")}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              className="rounded-full"
                              disabled={deletingAccount}
                              onClick={() => {
                                setDeleteAccountMessage(null);
                                setDeleteAccountPassword("");
                                setDeleteStep("password");
                              }}
                            >
                              {tr("Oui")}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{tr("Mot de passe actuel")}</label>
                            <input
                              type="password"
                              minLength={8}
                              autoComplete="current-password"
                              className="w-full rounded-lg border border-border bg-gray-50 p-2"
                              value={deleteAccountPassword}
                              onChange={(event) => {
                                setDeleteAccountPassword(event.target.value);
                                if (deleteAccountMessage) {
                                  setDeleteAccountMessage(null);
                                }
                              }}
                            />
                            {deleteAccountMessage && (
                              <p className="text-sm text-destructive">{deleteAccountMessage}</p>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-full"
                              disabled={deletingAccount}
                              onClick={() => setDeleteStep("confirm")}
                            >
                              {tr("Non")}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              className="rounded-full"
                              disabled={deletingAccount}
                              onClick={() => void onDeleteAccount()}
                            >
                              {deletingAccount ? tr("Suppression...") : tr("Confirmer")}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
