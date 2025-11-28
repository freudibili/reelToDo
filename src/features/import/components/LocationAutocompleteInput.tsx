import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, TextInput, Pressable, Text, StyleSheet, ScrollView } from "react-native";
import {
  fetchPlaceSuggestions,
  fetchPlaceDetails,
  type GooglePrediction,
  type PlaceDetails,
} from "../services/locationService";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";

interface LocationAutocompleteInputProps {
  initialValue?: string;
  onSelectPlace: (place: PlaceDetails) => void;
  placeholder?: string;
}

const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

const LocationAutocompleteInput: React.FC<LocationAutocompleteInputProps> = ({
  initialValue,
  onSelectPlace,
  placeholder,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [value, setValue] = useState(initialValue ?? "");
  const [suggestions, setSuggestions] = useState<GooglePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasConfirmedSelection, setHasConfirmedSelection] = useState(false);
  const resolvedPlaceholder =
    placeholder ?? t("import:autocomplete.placeholder");

  const shouldShowSuggestions =
    suggestions.length > 0 && value.length > 0 && !hasConfirmedSelection;

  useEffect(() => {
    setValue(initialValue ?? "");
    setHasConfirmedSelection(false);
  }, [initialValue]);

  const fetchSuggestions = useCallback(
    async (search: string) => {
      const trimmed = search.trim();
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
    },
    []
  );

  const debouncedFetchSuggestions = useMemo(
    () => debounce(fetchSuggestions, 300),
    [fetchSuggestions]
  );

  useEffect(() => {
    if (hasConfirmedSelection) {
      return;
    }

    debouncedFetchSuggestions(value);
  }, [debouncedFetchSuggestions, hasConfirmedSelection, value]);

  const handleSelect = async (prediction: GooglePrediction) => {
    try {
      setLoading(true);
      setSuggestions([]);

      const place = await fetchPlaceDetails(prediction);
      if (!place) {
        return;
      }

      setValue(place.formattedAddress);
      setHasConfirmedSelection(true);
      onSelectPlace(place);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={(text) => {
          setValue(text);
          setHasConfirmedSelection(false);
        }}
        placeholder={resolvedPlaceholder}
        placeholderTextColor={colors.secondaryText}
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            color: colors.text,
          },
        ]}
        autoCorrect={false}
      />

      {loading && value.length > 0 && (
        <Text style={[styles.helperText, { color: colors.secondaryText }]}>
          {t("import:autocomplete.searching")}
        </Text>
      )}

      {shouldShowSuggestions && (
        <View
          style={[
            styles.suggestionsContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {suggestions.map((item) => (
              <Pressable
                key={item.place_id}
                style={styles.suggestionItem}
                onPress={() => handleSelect(item)}
              >
                <Text style={[styles.suggestionText, { color: colors.text }]}>
                  {item.description}
                </Text>
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
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
  },
  helperText: {
    marginTop: 4,
    fontSize: 12,
    minHeight: 20,
  },
  suggestionsContainer: {
    marginTop: 4,
    borderRadius: 10,
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
