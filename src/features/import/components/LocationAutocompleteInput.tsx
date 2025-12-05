import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  StyleSheet,
  ScrollView,
  type StyleProp,
  type ViewStyle,
} from "react-native";
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
  value?: string;
  onSelectPlace: (place: PlaceDetails) => void;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  style?: StyleProp<ViewStyle>;
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
  value,
  onSelectPlace,
  placeholder,
  onChangeText,
  style,
}) => {
  const { t } = useTranslation();
  const { colors } = useAppTheme();
  const [inputValue, setInputValue] = useState(initialValue ?? "");
  const [suggestions, setSuggestions] = useState<GooglePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasConfirmedSelection, setHasConfirmedSelection] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const resolvedPlaceholder =
    placeholder ?? t("import:autocomplete.placeholder");

  const shouldShowSuggestions =
    suggestions.length > 0 &&
    inputValue.length > 0 &&
    !hasConfirmedSelection &&
    hasInteracted;

  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
      setHasConfirmedSelection(false);
    }
  }, [inputValue, value]);

  useEffect(() => {
    if (value === undefined && initialValue !== inputValue) {
      setInputValue(initialValue ?? "");
      setHasConfirmedSelection(false);
    }
  }, [initialValue, inputValue, value]);

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

    if (!hasInteracted) {
      setSuggestions([]);
      return;
    }

    debouncedFetchSuggestions(inputValue);
  }, [debouncedFetchSuggestions, hasConfirmedSelection, hasInteracted, inputValue]);

  const handleChangeText = (text: string) => {
    setInputValue(text);
    setHasConfirmedSelection(false);
    setHasInteracted(true);
    onChangeText?.(text);
  };

  const handleSelect = async (prediction: GooglePrediction) => {
    try {
      setLoading(true);
      setSuggestions([]);

      const place = await fetchPlaceDetails(prediction);
      if (!place) {
        return;
      }

      setInputValue(place.formattedAddress);
      setHasConfirmedSelection(true);
      setHasInteracted(false);
      onSelectPlace(place);
      onChangeText?.(place.formattedAddress);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        value={inputValue}
        onChangeText={handleChangeText}
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

      {loading && inputValue.length > 0 && (
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
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  helperText: {
    marginTop: 4,
    fontSize: 12,
    minHeight: 20,
  },
  suggestionsContainer: {
    marginTop: 4,
    borderRadius: 14,
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
