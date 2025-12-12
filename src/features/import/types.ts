export interface GooglePrediction {
  description: string;
  place_id: string;
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
import type { ShareIntent } from "expo-share-intent";

import type {
  Activity,
  ActivityProcessingStatus,
} from "@features/activities/types";

import type { PlaceDetails } from "./services/locationService";

export type ParsedSharedIntent = {
  raw: string | null;
  data: ShareIntent | null;
  sharedUrl: string | null;
};

export type ImportProcessingState = {
  displayActivity: Activity | null;
  processingStatus: ActivityProcessingStatus;
  isProcessing: boolean;
  isFailed: boolean;
  processingErrorMessage: string | null;
  showAnalyzingCard: boolean;
  showManualCard: boolean;
};

export type ImportDraftDetails = {
  location: PlaceDetails | null;
  date: Date | null;
};

export type UpdateActivityPayload = {
  location: PlaceDetails | null;
  dateIso?: string | null;
};
