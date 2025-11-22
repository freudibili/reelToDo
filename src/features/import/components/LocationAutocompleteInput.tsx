import React, { useEffect, useMemo, useState } from "react";
import { View, TextInput, Pressable, Text, StyleSheet, ScrollView } from "react-native";
import {
  fetchPlaceSuggestions,
  fetchPlaceDetails,
  type GooglePrediction,
  type PlaceDetails,
} from "../services/locationService";
import { useTranslation } from "react-i18next";

interface LocationAutocompleteInputProps {
  initialValue?: string;
  onSelectPlace: (place: PlaceDetails) => void;
  placeholder?: string;
}

const debounce = (fn: () => void, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
};

const LocationAutocompleteInput: React.FC<LocationAutocompleteInputProps> = ({
  initialValue,
  onSelectPlace,
  placeholder,
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState(initialValue ?? "");
  const [suggestions, setSuggestions] = useState<GooglePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const resolvedPlaceholder =
    placeholder ?? t("import:autocomplete.placeholder");

  const shouldShowSuggestions = suggestions.length > 0 && value.length > 0;

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  const debouncedFetchSuggestions = useMemo(
    () =>
      debounce(async () => {
        const trimmed = value.trim();
        if (!trimmed) {
          setSuggestions([]);
          return;
        }

        try {
          setLoading(true);
          const results = await fetchPlaceSuggestions(trimmed);
          setSuggestions(results);
        } catch {
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }, 300),
    [value]
  );

  useEffect(() => {
    debouncedFetchSuggestions();
  }, [debouncedFetchSuggestions]);

  const handleSelect = async (prediction: GooglePrediction) => {
    try {
      setLoading(true);
      setSuggestions([]);

      const place = await fetchPlaceDetails(prediction);
      if (!place) {
        return;
      }

      setValue(place.formattedAddress);
      onSelectPlace(place);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder={resolvedPlaceholder}
        style={styles.input}
        autoCorrect={false}
      />

      {loading && value.length > 0 && (
        <Text style={styles.helperText}>{t("import:autocomplete.searching")}</Text>
      )}

      {shouldShowSuggestions && (
        <View style={styles.suggestionsContainer}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {suggestions.map((item) => (
              <Pressable
                key={item.place_id}
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.suggestionText}>{item.description}</Text>
              </Pressable>
            ))}
          </ScrollView>
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
    minHeight: 20,
  },
  suggestionsContainer: {
    marginTop: 4,
    borderRadius: 10,
    borderColor: "#eee",
    backgroundColor: "#ddd",
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
