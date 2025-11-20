import { GOOGLE_MAPS_API_KEY } from "@common/types/constants";

export interface GooglePrediction {
  description: string;
  place_id: string;
}

interface GoogleAutocompleteResponse {
  status: string;
  predictions: GooglePrediction[];
}

interface GoogleAddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GooglePlaceDetailsResult {
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  address_components: GoogleAddressComponent[];
}

interface GooglePlaceDetailsResponse {
  status: string;
  result: GooglePlaceDetailsResult;
}

export interface PlaceDetails {
  placeId: string;
  description: string;
  formattedAddress: string;
  name: string;
  city: string | null;
  country: string | null;
  latitude: number;
  longitude: number;
}

const AUTOCOMPLETE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

const extractComponent = (
  components: GoogleAddressComponent[],
  type: string
) => {
  const component = components.find((c) => c.types.includes(type));
  return component?.long_name ?? null;
};

export const fetchPlaceSuggestions = async (
  input: string
): Promise<GooglePrediction[]> => {
  const trimmed = input.trim();
  if (!trimmed) return [];

  const params = new URLSearchParams({
    input: trimmed,
    key: GOOGLE_MAPS_API_KEY,
  });

  const res = await fetch(`${AUTOCOMPLETE_URL}?${params.toString()}`);

  if (!res.ok) {
    return [];
  }

  const json = (await res.json()) as GoogleAutocompleteResponse;
  if (json.status !== "OK") {
    return [];
  }

  return json.predictions;
};

export const fetchPlaceDetails = async (
  prediction: GooglePrediction
): Promise<PlaceDetails | null> => {
  const params = new URLSearchParams({
    place_id: prediction.place_id,
    key: GOOGLE_MAPS_API_KEY,
    fields: "name,formatted_address,geometry,address_components",
  });

  const res = await fetch(`${DETAILS_URL}?${params.toString()}`);

  if (!res.ok) {
    return null;
  }

  const json = (await res.json()) as GooglePlaceDetailsResponse;
  if (json.status !== "OK") {
    return null;
  }

  const result = json.result;

  const city = extractComponent(result.address_components, "locality");
  const country = extractComponent(result.address_components, "country");

  return {
    placeId: prediction.place_id,
    description: prediction.description,
    formattedAddress: result.formatted_address,
    name: result.name,
    city,
    country,
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
  };
};
