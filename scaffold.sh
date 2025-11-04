#!/bin/bash

# filepath: scaffold.sh

mkdir -p src/app
mkdir -p src/common/components
mkdir -p src/common/hooks
mkdir -p src/common/i18n
mkdir -p src/common/theme
mkdir -p src/common/utils
mkdir -p src/common/types
mkdir -p src/core/store/slices
mkdir -p src/core/services
mkdir -p src/features/auth/components
mkdir -p src/features/auth/screens
mkdir -p src/features/auth/store
mkdir -p src/features/auth/types
mkdir -p src/features/auth/utils
mkdir -p src/features/child/components
mkdir -p src/features/child/screens
mkdir -p src/features/child/store
mkdir -p src/features/child/types
mkdir -p src/features/child/utils
mkdir -p src/features/child/services
mkdir -p src/features/sharing/components
mkdir -p src/features/sharing/screens
mkdir -p src/features/sharing/store
mkdir -p src/features/sharing/types
mkdir -p src/features/sharing/utils
mkdir -p src/features/documents/components
mkdir -p src/features/documents/screens
mkdir -p src/features/documents/store
mkdir -p src/features/documents/utils
mkdir -p src/features/appointments/components
mkdir -p src/features/appointments/screens
mkdir -p src/features/appointments/store
mkdir -p src/features/appointments/utils
mkdir -p assets

touch src/app/navigation.tsx
touch src/app/index.tsx
touch src/common/components/Button.tsx
touch src/common/components/Screen.tsx
touch src/common/components/EmptyState.tsx
touch src/common/hooks/.keep
touch src/common/i18n/en.json
touch src/common/i18n/fr.json
touch src/common/i18n/i18n.ts
touch src/common/theme/index.ts
touch src/common/utils/dates.ts
touch src/common/utils/units.ts
touch src/common/utils/validation.ts
touch src/common/types/base.ts
touch src/core/store/index.ts
touch src/core/store/slices/authSlice.ts
touch src/core/store/slices/childSlice.ts
touch src/core/store/slices/measurementsSlice.ts
touch src/core/store/slices/vaccinesSlice.ts
touch src/core/store/slices/appointmentsSlice.ts
touch src/core/store/slices/documentsSlice.ts
touch src/core/store/slices/sharingSlice.ts
touch src/core/store/slices/settingsSlice.ts
touch src/core/services/storageService.ts
touch src/core/services/cryptoService.ts
touch src/core/services/sharingService.ts
touch src/core/services/notificationsService.ts
touch src/features/auth/components/.keep
touch src/features/auth/screens/OnboardingScreen.tsx
touch src/features/auth/screens/SettingsScreen.tsx
touch src/features/auth/store/.keep
touch src/features/auth/types/.keep
touch src/features/auth/utils/.keep
touch src/features/child/components/.keep
touch src/features/child/screens/ChildrenScreen.tsx
touch src/features/child/screens/DashboardScreen.tsx
touch src/features/child/store/.keep
touch src/features/child/types/index.ts
touch src/features/child/utils/.keep
touch src/features/child/services/measurementsRepo.ts
touch src/features/child/services/vaccinesRepo.ts
touch src/features/sharing/components/.keep
touch src/features/sharing/screens/SharingScreen.tsx
touch src/features/sharing/store/.keep
touch src/features/sharing/types/.keep
touch src/features/sharing/utils/.keep
touch src/features/documents/components/.keep
touch src/features/documents/screens/DocumentsScreen.tsx
touch src/features/documents/store/.keep
touch src/features/documents/utils/.keep
touch src/features/appointments/components/.keep
touch src/features/appointments/screens/AppointmentsScreen.tsx
touch src/features/appointments/store/.keep
touch src/features/appointments/utils/.keep

echo "Arborescence et fichiers créés !"