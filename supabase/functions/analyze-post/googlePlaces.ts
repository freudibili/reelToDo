const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");

type GeocodedPlace = {
  location_name: string | null;
  address: string | null;
  city: string | null;
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
  url.searchParams.set("key", GOOGLE_PLACES_API_KEY as string);
  const res = await fetch(url.toString());
  if (!res.ok) {
    console.log("[google] request failed", res.status);
    return null;
  }
  const data = await res.json();
  return data;
};

export const geocodePlace = async (
  name: string,
  context?: string | null
): Promise<GeocodedPlace | null> => {
  if (!GOOGLE_PLACES_API_KEY) {
    console.log("[google] missing GOOGLE_PLACES_API_KEY");
    return null;
  }

  const queries: string[] = [];
  const trimmedName = name.trim();

  if (context && context.trim().length > 0) {
    queries.push(`${trimmedName} ${context.trim()}`);
  }
  queries.push(trimmedName);

  const asciiName = toAscii(trimmedName);
  if (context && context.trim().length > 0) {
    queries.push(`${asciiName} ${context.trim()}`);
  }
  if (asciiName !== trimmedName) {
    queries.push(asciiName);
  }

  for (const q of queries) {
    const data = await fetchTextSearch(q);
    if (!data || !data.results || data.results.length === 0) {
      continue;
    }

    const first = data.results[0];
    const location = first.geometry?.location;
    const address = first.formatted_address ?? null;
    const cityComponent =
      first.address_components?.find(
        (c: any) => Array.isArray(c.types) && c.types.includes("locality")
      ) ?? null;

    return {
      location_name: first.name ?? name,
      address,
      city: cityComponent ? cityComponent.long_name : null,
      latitude: location ? Number(location.lat) : null,
      longitude: location ? Number(location.lng) : null,
    };
  }

  console.log("[google] no result for", name, "context:", context);
  return null;
};
