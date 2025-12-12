import type { User } from "@supabase/supabase-js";

import type { ProfileSettings } from "./types";

type UserMetadata = {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  address?: string;
};

const getUserMetadata = (user: User | null | undefined): UserMetadata =>
  (user?.user_metadata as UserMetadata) ?? {};

export const deriveProfileName = (
  profile: ProfileSettings,
  user: User | null,
  guestLabel: string
) => {
  const metadata = getUserMetadata(user);

  const profileName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (profileName) {
    return profileName;
  }

  const metadataName = [metadata.first_name, metadata.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (metadataName) {
    return metadataName;
  }

  const fullName = metadata.full_name?.trim();
  if (fullName) {
    return fullName;
  }

  return user?.email ?? guestLabel;
};

export const deriveProfileAddress = (
  profile: ProfileSettings,
  user: User | null,
  placeholder: string
) => {
  const metadata = getUserMetadata(user);
  return profile.address || metadata.address || placeholder;
};

export const deriveProfileEmail = (
  profile: ProfileSettings,
  user: User | null
) => profile.email || user?.email || "";
