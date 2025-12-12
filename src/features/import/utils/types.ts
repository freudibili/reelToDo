import { PlaceDetails } from "../services/locationService";

export type ImportDraftDetails = {
  location: PlaceDetails | null;
  date: Date | null;
};

export type UpdateActivityPayload = {
  location: PlaceDetails | null;
  dateIso?: string | null;
};
