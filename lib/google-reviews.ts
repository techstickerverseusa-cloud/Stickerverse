export type GoogleReview = {
  author_name: string;
  author_url: string;
  profile_photo_url: string;
  rating: number;
  relative_time_description: string;
  text: string;
};

export type PlaceDetails = {
  name: string;
  rating: number;
  user_ratings_total: number;
  reviews: GoogleReview[];
  url: string;
};

const API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";
const PLACE_NAME = "Stickerverse USA";

async function findPlaceId(): Promise<string | null> {
  if (!API_KEY) return null;
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(PLACE_NAME)}&inputtype=textquery&fields=place_id&key=${API_KEY}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  const data = await res.json();
  return data.candidates?.[0]?.place_id ?? null;
}

export async function getGoogleReviews(): Promise<PlaceDetails | null> {
  if (!API_KEY) return null;
  try {
    const placeId = await findPlaceId();
    if (!placeId) return null;
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,reviews,url&reviews_sort=newest&key=${API_KEY}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.status !== "OK") return null;
    return data.result as PlaceDetails;
  } catch {
    return null;
  }
}
