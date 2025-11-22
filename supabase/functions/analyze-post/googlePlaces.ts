const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY");

type GeocodedPlace = {
  location_name: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
};

const toAscii = (value: string) =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const fetchTextSearch = async (query: string) => {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/textsearch/json"
  );
  url.searchParams.set("query", query);
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY ?? "");
  const res = await fetch(url);
  if (!res.ok) {
    console.log("[google] textsearch failed", res.status);
    return null;
  }
  return res.json();
};

const fetchPlaceDetails = async (placeId: string) => {
  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "name,formatted_address,geometry,address_component"
  );
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY ?? "");
  const res = await fetch(url);
  if (!res.ok) {
    console.log("[google] details failed", res.status);
    return null;
  }
  return res.json();
};

// NEW: reverse geocode to get country from lat/lng
const reverseGeocode = async (
  lat: number,
  lng: number
): Promise<{
  country: string | null;
  city: string | null;
  address: string | null;
}> => {
  if (!GOOGLE_MAPS_API_KEY) {
    return { country: null, city: null, address: null };
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("latlng", `${lat},${lng}`);
  url.searchParams.set("key", GOOGLE_MAPS_API_KEY);

  const res = await fetch(url);
  if (!res.ok) {
    console.log("[google] reverse geocode failed", res.status);
    return { country: null, city: null, address: null };
  }

  const json = await res.json();
  if (!Array.isArray(json.results) || json.results.length === 0) {
    return { country: null, city: null, address: null };
  }

  const first = json.results[0];
  const components: Array<{ long_name: string; types: string[] }> =
    first.address_components ?? [];

  const country =
    components.find((c) => c.types.includes("country"))?.long_name ?? null;
  const city =
    components.find((c) => c.types.includes("locality"))?.long_name ??
    components.find((c) => c.types.includes("postal_town"))?.long_name ??
    null;

  return {
    country,
    city,
    address: first.formatted_address ?? null,
  };
};

const normalizeToken = (value: string | null | undefined) =>
  (value ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

export const geocodePlace = async (
  name: string,
  context?: string | null,
  opts?: { cityHint?: string | null; countryHint?: string | null }
): Promise<GeocodedPlace | null> => {
  if (!GOOGLE_MAPS_API_KEY) {
    console.log("[google] no api key, skipping");
    return null;
  }

  const queryParts = [name];
  if (context) queryParts.push(context);
  if (opts?.cityHint) queryParts.push(opts.cityHint);
  if (opts?.countryHint) queryParts.push(opts.countryHint);

  const query = queryParts.filter(Boolean).join(" ").trim();
  const asciiQuery = toAscii(query);

  const json = await fetchTextSearch(asciiQuery);
  if (!json || !Array.isArray(json.results) || json.results.length === 0) {
    console.log("[google] no textsearch results for", asciiQuery);
    return null;
  }

  const first = json.results[0];
  const location = first.geometry?.location ?? null;
  const address = first.formatted_address ?? null;

  // try to get city + country from address_components
  const cityComponent =
    first.address_components?.find(
      (c: any) => Array.isArray(c.types) && c.types.includes("locality")
    ) ?? null;
  const countryComponent =
    first.address_components?.find(
      (c: any) => Array.isArray(c.types) && c.types.includes("country")
    ) ?? null;

  let place: GeocodedPlace = {
    location_name: first.name ?? name,
    address,
    city: cityComponent ? cityComponent.long_name : null,
    country: countryComponent ? countryComponent.long_name : null,
    latitude: location ? Number(location.lat) : null,
    longitude: location ? Number(location.lng) : null,
  };

  // reject clearly mismatching results when we have hints
  if (opts?.cityHint) {
    const hint = normalizeToken(opts.cityHint);
    const got = normalizeToken(place.city);
    if (hint && got && hint !== got) {
      console.log("[google] city mismatch, discarding result", {
        hint: opts.cityHint,
        got: place.city,
      });
      return null;
    }
  }

  if (opts?.countryHint) {
    const hint = normalizeToken(opts.countryHint);
    const got = normalizeToken(place.country);
    if (hint && got && hint !== got) {
      console.log("[google] country mismatch, discarding result", {
        hint: opts.countryHint,
        got: place.country,
      });
      return null;
    }
  }

  // 👇 NEW: if we have coords but still no country, try reverse geocoding
  if (place.latitude && place.longitude && !place.country) {
    const reverse = await reverseGeocode(place.latitude, place.longitude);
    place = {
      ...place,
      country: place.country ?? reverse.country ?? null,
      city: place.city ?? reverse.city ?? null,
      address: place.address ?? reverse.address ?? null,
    };
  }

  return place;
};
