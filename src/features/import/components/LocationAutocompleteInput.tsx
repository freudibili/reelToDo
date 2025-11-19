import { GOOGLE_MAPS_API_KEY } from "@common/types/constants";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  Text,
  StyleSheet,
} from "react-native";

interface GooglePrediction {
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

interface LocationAutocompleteInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  onSelectPlace: (place: PlaceDetails) => void;
  placeholder?: string;
}

const AUTOCOMPLETE_URL =
  "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const DETAILS_URL = "https://maps.googleapis.com/maps/api/place/details/json";

const debounce = (fn: () => void, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
};

const extractComponent = (
  components: GoogleAddressComponent[],
  type: string
) => {
  const component = components.find((c) => c.types.includes(type));
  return component?.long_name ?? null;
};

const LocationAutocompleteInput: React.FC<LocationAutocompleteInputProps> = ({
  value,
  onChangeValue,
  onSelectPlace,
}) => {
  const apiKey = GOOGLE_MAPS_API_KEY;
  const placeholder = "Address";
  const [suggestions, setSuggestions] = useState<GooglePrediction[]>([]);
  const [loading, setLoading] = useState(false);

  console.log("API Key:", apiKey);

  const shouldShowSuggestions = suggestions.length > 0 && value.length > 0;

  const fetchSuggestions = useMemo(
    () =>
      debounce(async () => {
        const trimmed = value.trim();
        if (!trimmed) {
          setSuggestions([]);
          return;
        }

        try {
          setLoading(true);
          const params = new URLSearchParams({
            input: trimmed,
            key: apiKey,
          });

          const res = await fetch(`${AUTOCOMPLETE_URL}?${params.toString()}`);
          console.log("Autocomplete response status:", res);
          if (!res.ok) {
            setSuggestions([]);
            return;
          }

          const json = (await res.json()) as GoogleAutocompleteResponse;
          if (json.status !== "OK") {
            setSuggestions([]);
            return;
          }

          setSuggestions(json.predictions);
        } catch {
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 300),
    [apiKey, value]
  );

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleSelect = async (prediction: GooglePrediction) => {
    try {
      setLoading(true);
      setSuggestions([]);

      const params = new URLSearchParams({
        place_id: prediction.place_id,
        key: apiKey,
        fields: "name,formatted_address,geometry,address_components",
      });

      const res = await fetch(`${DETAILS_URL}?${params.toString()}`);

      console.log("Place details response status:", res);
      if (!res.ok) {
        return;
      }

      const json = (await res.json()) as GooglePlaceDetailsResponse;
      if (json.status !== "OK") {
        return;
      }

      const result = json.result;

      const city = extractComponent(result.address_components, "locality");
      const country = extractComponent(result.address_components, "country");

      const place: PlaceDetails = {
        placeId: prediction.place_id,
        description: prediction.description,
        formattedAddress: result.formatted_address,
        name: result.name,
        city,
        country,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
      };

      onChangeValue(result.formatted_address);
      onSelectPlace(place);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeValue}
        placeholder={placeholder}
        style={styles.input}
        autoCorrect={false}
      />

      {loading && value.length > 0 && (
        <Text style={styles.helperText}>Searching…</Text>
      )}

      {shouldShowSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            keyboardShouldPersistTaps="handled"
            data={suggestions}
            keyExtractor={(item) => item.place_id}
            renderItem={({ item }) => (
              <Pressable
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.suggestionText}>{item.description}</Text>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  helperText: {
    marginTop: 4,
    fontSize: 12,
    color: "#777",
  },
  suggestionsContainer: {
    marginTop: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    maxHeight: 180,
    overflow: "hidden",
  },
  suggestionItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  suggestionText: {
    fontSize: 14,
  },
});

export default LocationAutocompleteInput;
