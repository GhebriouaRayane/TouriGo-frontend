import type { ApiListing } from "./api";

export function formatListingRating(listing: ApiListing, fallbackLabel: string): string {
  if (listing.rating_average === null || listing.rating_count === 0) {
    return fallbackLabel;
  }
  return `${listing.rating_average.toFixed(1)} (${listing.rating_count})`;
}

export function compareListingsByRating(a: ApiListing, b: ApiListing): number {
  const averageA = a.rating_average ?? -1;
  const averageB = b.rating_average ?? -1;

  if (averageA !== averageB) {
    return averageB - averageA;
  }

  return b.rating_count - a.rating_count;
}
