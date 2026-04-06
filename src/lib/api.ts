const RAW_API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api/v1";

const resolveApiBaseUrl = (raw: string) => {
  try {
    return new URL(raw).toString();
  } catch {
    if (typeof window === "undefined") {
      return raw;
    }
    return new URL(raw, window.location.origin).toString();
  }
};

export const API_BASE_URL = resolveApiBaseUrl(RAW_API_BASE_URL);
export const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return API_BASE_URL.replace(/\/api\/v1\/?$/, "");
  }
})();

const LOCAL_API_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;

function normalizeMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return url;
  }
  if (trimmed.startsWith("/media/")) {
    return `${API_ORIGIN}${trimmed}`;
  }
  if (LOCAL_API_ORIGIN.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return `${API_ORIGIN}${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return trimmed.replace(LOCAL_API_ORIGIN, API_ORIGIN);
    }
  }
  return trimmed;
}

function normalizeListing(listing: ApiListing): ApiListing {
  if (!listing.images?.length) {
    return listing;
  }
  return {
    ...listing,
    images: listing.images.map((image) => ({
      ...image,
      url: normalizeMediaUrl(image.url),
    })),
  };
}

function normalizeUser(user: ApiUser): ApiUser {
  if (!user.avatar_url) {
    return user;
  }
  return {
    ...user,
    avatar_url: normalizeMediaUrl(user.avatar_url),
  };
}

export type ApiUser = {
  id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
};

export type VerificationChannel = "email" | "phone";

export type RegisterCodeRequestPayload = {
  email?: string;
  password: string;
  full_name?: string;
  avatar_url?: string;
  phone_number: string;
  become_host?: boolean;
  channel: VerificationChannel;
};

export type RegisterCodeResponse = {
  verification_id: number;
  message: string;
  channel: VerificationChannel;
  target: string;
  expires_at: string;
  debug_code: string | null;
};

export type ApiImage = {
  id: number;
  url: string;
};

export type ApiListing = {
  id: number;
  title: string;
  description: string | null;
  type: "immobilier" | "vehicule" | "activite";
  category: string | null;
  location: string;
  price: number;
  period: string | null;
  details: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  availability_dates: string | null;
  owner_id: number | null;
  owner_full_name: string | null;
  owner_phone_number: string | null;
  images: ApiImage[];
};

export type CreateListingPayload = {
  title: string;
  description?: string;
  type: "immobilier" | "vehicule" | "activite";
  category?: string;
  location: string;
  price: number;
  period?: string;
  details?: string;
  availability_dates?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  image_urls?: string[];
};

export type UpdateListingPayload = {
  title?: string;
  description?: string;
  type?: "immobilier" | "vehicule" | "activite";
  category?: string;
  location?: string;
  price?: number;
  period?: string;
  details?: string;
  availability_dates?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  image_urls?: string[];
};

export type ApiBooking = {
  id: number;
  start_date: string;
  end_date: string;
  listing_id: number;
  user_id: number;
  total_price: number;
  seats_reserved?: number | null;
  rooms_reserved?: number | null;
  guests_reserved?: number | null;
  status: "pending" | "confirmed" | "rejected" | "cancelled" | "completed";
  listing_title: string | null;
  listing_location: string | null;
  requester_full_name: string | null;
  requester_email: string | null;
  host_id: number | null;
  host_full_name: string | null;
};

export type CreateBookingPayload = {
  listing_id: number;
  start_date: string;
  end_date: string;
  seats_reserved?: number;
  rooms_reserved?: number;
  guests_reserved?: number;
};

export type ApiNotification = {
  id: number;
  user_id: number;
  type: "booking_request" | "booking_status" | "message";
  title: string;
  body: string;
  is_read: boolean;
  booking_id: number | null;
  message_id: number | null;
  created_at: string;
};

export type ApiMessage = {
  id: number;
  booking_id: number;
  sender_id: number;
  recipient_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name: string | null;
  recipient_name: string | null;
  listing_id: number | null;
  listing_title: string | null;
};

export type ApiReview = {
  id: number;
  user_id: number;
  user_full_name?: string | null;
  listing_id: number;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type CreateReviewPayload = {
  listing_id: number;
  rating: number;
  comment?: string;
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...options.headers,
  };
  if (options.body !== undefined && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Impossible de joindre l'API (${API_BASE_URL}). Verifiez que le backend est demarre.`);
    }
    throw error;
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const data = (await response.json()) as { detail?: string };
      if (data?.detail) {
        detail = data.detail;
      }
    } catch {
      // Ignore invalid JSON and keep fallback message.
    }
    throw new Error(detail);
  }

  return (await response.json()) as T;
}

export async function loginApi(identifier: string, password: string): Promise<{ access_token: string; token_type: string }> {
  const body = new URLSearchParams();
  body.append("username", identifier);
  body.append("password", password);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login/access-token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Impossible de joindre l'API (${API_BASE_URL}). Verifiez que le backend est demarre.`);
    }
    throw error;
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const data = (await response.json()) as { detail?: string };
      if (data?.detail) {
        detail = data.detail;
      }
    } catch {
      // Ignore invalid JSON and keep fallback message.
    }
    throw new Error(detail);
  }

  return (await response.json()) as { access_token: string; token_type: string };
}

export function loginWithGoogleApi(idToken: string): Promise<{ access_token: string; token_type: string }> {
  return request<{ access_token: string; token_type: string }>("/auth/login/google", {
    method: "POST",
    body: {
      id_token: idToken,
    },
  });
}

export function requestRegisterCodeApi(payload: RegisterCodeRequestPayload) {
  return request<RegisterCodeResponse>("/auth/register", {
    method: "POST",
    body: payload,
  });
}

export function verifyRegisterCodeApi(payload: { verification_id: number; code: string }) {
  return request<ApiUser>("/auth/register/verify-code", {
    method: "POST",
    body: payload,
  }).then(normalizeUser);
}

export function getMeApi(token: string) {
  return request<ApiUser>("/auth/me", { token }).then(normalizeUser);
}

export function becomeHostApi(token: string) {
  return request<ApiUser>("/auth/become-host", {
    method: "POST",
    token,
  }).then(normalizeUser);
}

export function getListingsApi(params: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.append(key, String(value));
    }
  });
  return request<ApiListing[]>(`/listings/?${query.toString()}`).then((listings) =>
    listings.map(normalizeListing)
  );
}

export function getListingByIdApi(id: number) {
  return request<ApiListing>(`/listings/${id}`).then(normalizeListing);
}

export function getMyListingsApi(token: string) {
  return request<ApiListing[]>("/listings/me", { token }).then((listings) =>
    listings.map(normalizeListing)
  );
}

export function createListingApi(token: string, payload: CreateListingPayload) {
  return request<ApiListing>("/listings/", {
    method: "POST",
    token,
    body: payload,
  }).then(normalizeListing);
}

export function updateListingApi(token: string, listingId: number, payload: UpdateListingPayload) {
  return request<ApiListing>(`/listings/${listingId}`, {
    method: "PATCH",
    token,
    body: payload,
  }).then(normalizeListing);
}

export function deleteListingApi(token: string, listingId: number) {
  return request<{ message: string }>(`/listings/${listingId}`, {
    method: "DELETE",
    token,
  });
}

export function updateMeApi(
  token: string,
  payload: { email?: string; full_name?: string; avatar_url?: string; phone_number?: string }
) {
  return request<ApiUser>("/auth/me", {
    method: "PATCH",
    token,
    body: payload,
  }).then(normalizeUser);
}

export function deleteMeApi(token: string, payload: { password: string }) {
  return request<{ message: string }>("/auth/me", {
    method: "DELETE",
    token,
    body: payload,
  });
}

async function uploadFilesApi(
  token: string,
  path: string,
  files: File[],
  fieldName: "file" | "files" = "files"
) {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append(fieldName, file);
  });

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Impossible de joindre l'API (${API_BASE_URL}). Verifiez que le backend est demarre.`);
    }
    throw error;
  }

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const data = (await response.json()) as { detail?: string };
      if (data?.detail) {
        detail = data.detail;
      }
    } catch {
      // Ignore invalid JSON and keep fallback message.
    }
    throw new Error(detail);
  }

  return response.json() as Promise<{ url?: string; urls?: string[] }>;
}

export async function uploadAvatarApi(token: string, file: File) {
  const data = await uploadFilesApi(token, "/uploads/avatar", [file], "file");
  if (!data.url) {
    throw new Error("URL d'avatar manquante dans la reponse.");
  }
  return normalizeMediaUrl(data.url);
}

export async function uploadListingImagesApi(token: string, files: File[]) {
  const data = await uploadFilesApi(token, "/uploads/listing-images", files, "files");
  return data.urls ?? [];
}

export function changePasswordApi(token: string, payload: { current_password: string; new_password: string }) {
  return request<{ message: string }>("/auth/change-password", {
    method: "POST",
    token,
    body: payload,
  });
}

export function getFavoriteIdsApi(token: string) {
  return request<number[]>("/favorites/ids", { token });
}

export function getFavoriteListingsApi(token: string) {
  return request<ApiListing[]>("/favorites/me", { token }).then((listings) =>
    listings.map(normalizeListing)
  );
}

export function addFavoriteApi(token: string, listingId: number) {
  return request<{ id: number; listing_id: number }>(`/favorites/${listingId}`, {
    method: "POST",
    token,
  });
}

export function removeFavoriteApi(token: string, listingId: number) {
  return request<{ message: string }>(`/favorites/${listingId}`, {
    method: "DELETE",
    token,
  });
}

export function getListingReviewsApi(listingId: number) {
  return request<ApiReview[]>(`/reviews/listings/${listingId}`);
}

export function createReviewApi(token: string, payload: CreateReviewPayload) {
  return request<ApiReview>("/reviews/", {
    method: "POST",
    token,
    body: payload,
  });
}

export function getMyBookingsApi(token: string) {
  return request<ApiBooking[]>("/bookings/me", { token });
}

export function createBookingApi(token: string, payload: CreateBookingPayload) {
  return request<ApiBooking>("/bookings/", {
    method: "POST",
    token,
    body: payload,
  });
}

export function getReceivedBookingsApi(token: string) {
  return request<ApiBooking[]>("/bookings/received", { token });
}

export function confirmBookingApi(token: string, bookingId: number) {
  return request<ApiBooking>(`/bookings/${bookingId}/confirm`, {
    method: "POST",
    token,
  });
}

export function rejectBookingApi(token: string, bookingId: number, reason?: string) {
  return request<ApiBooking>(`/bookings/${bookingId}/reject`, {
    method: "POST",
    token,
    body: reason ? { reason } : {},
  });
}

export function cancelBookingApi(token: string, bookingId: number) {
  return request<ApiBooking>(`/bookings/${bookingId}/cancel`, {
    method: "POST",
    token,
  });
}

export function getNotificationsApi(token: string, limit = 50) {
  return request<ApiNotification[]>(`/notifications/me?limit=${limit}`, { token });
}

export function markNotificationReadApi(token: string, notificationId: number) {
  return request<ApiNotification>(`/notifications/${notificationId}/read`, {
    method: "POST",
    token,
  });
}

export function markAllNotificationsReadApi(token: string) {
  return request<{ updated: number }>("/notifications/read-all", {
    method: "POST",
    token,
  });
}

export function getBookingMessagesApi(token: string, bookingId: number) {
  return request<ApiMessage[]>(`/messages/bookings/${bookingId}`, { token });
}

export function sendBookingMessageApi(token: string, bookingId: number, content: string) {
  return request<ApiMessage>(`/messages/bookings/${bookingId}`, {
    method: "POST",
    token,
    body: { content },
  });
}
