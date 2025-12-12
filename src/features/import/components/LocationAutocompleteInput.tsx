import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";

import { Card, Input, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

import {
  fetchPlaceSuggestions,
  fetchPlaceDetails,
} from "../services/locationService";
import type { GooglePrediction, PlaceDetails } from "../types";
import { debounce } from "../utils/debounce";

type LocationAutocompleteInputProps = {
  initialValue?: string;
  value?: string;
  onSelectPlace: (place: PlaceDetails) => void;
  placeholder?: string;
  onChangeText?: (text: string) => void;
  style?: React.ComponentProps<typeof Stack>["style"];
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
    if (value !== undefined) {
      setInputValue(value);
      setHasConfirmedSelection(false);
      return;
    }

    if (initialValue !== undefined) {
      setInputValue(initialValue);
      setHasConfirmedSelection(false);
    }
  }, [initialValue, value]);

  const fetchSuggestions = useCallback(async (search: string) => {
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
  }, []);

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
  }, [
    debouncedFetchSuggestions,
    hasConfirmedSelection,
    hasInteracted,
    inputValue,
  ]);

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
    <Stack style={[styles.container, style]} gap="xs">
      <Input
        value={inputValue}
        onChangeText={handleChangeText}
        placeholder={resolvedPlaceholder}
        autoCorrect={false}
        rightIcon={
          loading && inputValue.length > 0 ? (
            <ActivityIndicator size="small" color={colors.secondaryText} />
          ) : undefined
        }
      />

      {loading && inputValue.length > 0 ? (
        <Text variant="caption" tone="muted">
          {t("import:autocomplete.searching")}
        </Text>
      ) : null}

      {shouldShowSuggestions ? (
        <Card
          padding="xs"
          radius="md"
          variant="outlined"
          shadow="sm"
          style={styles.suggestionsContainer}
        >
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
            <Stack gap="xxs">
              {suggestions.map((item) => (
                <Pressable
                  key={item.place_id}
                  style={({ pressed }) => [
                    styles.suggestionItem,
                    pressed ? { backgroundColor: colors.overlay } : undefined,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text variant="bodySmall">{item.description}</Text>
                </Pressable>
              ))}
            </Stack>
          </ScrollView>
        </Card>
      ) : null}
    </Stack>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 10,
  },
  suggestionsContainer: {
    marginTop: 4,
    maxHeight: 180,
    overflow: "hidden",
  },
  suggestionItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});

export default LocationAutocompleteInput;
