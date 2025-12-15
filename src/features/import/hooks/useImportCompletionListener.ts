import { usePathname, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

import { showToast as showToastAction } from "@common/store/appSlice";
import { supabase } from "@config/supabase";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { ActivitiesService } from "@features/activities/services/activitiesService";
import { activityUpdated } from "@features/activities/store/activitiesSlice";
import type { ActivityProcessingStatus } from "@features/activities/types";
import { selectImportedActivity } from "@features/import/store/importSelectors";
import { setImportActivity } from "@features/import/store/importSlice";

const POLL_INTERVAL = 4000;
const buildCreatedActivityHref = (activityId: string) =>
  `/activity/${activityId}?created=1`;

export const useImportCompletionListener = () => {
  const activity = useAppSelector(selectImportedActivity);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const lastStatusRef = useRef<{
    id: string;
    status: ActivityProcessingStatus | null;
  } | null>(null);
  const pathname = usePathname();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const activityId = activity?.id;
    const status = (activity?.processing_status ??
      "complete") as ActivityProcessingStatus | null;

    const handleStatusChange = (
      nextStatus: ActivityProcessingStatus | "deleted"
    ) => {
      if (!activityId) return;

      const prev =
        lastStatusRef.current?.id === activityId
          ? lastStatusRef.current.status
          : null;
      const onImportScreen = pathname?.includes("/import");

      if (nextStatus === "complete" && prev !== "complete") {
        const action = {
          label: t("import:toast.view"),
          href: buildCreatedActivityHref(activityId),
        };

        dispatch(
          showToastAction({
            message: t("import:toast.success"),
            type: "success",
            action,
          })
        );

        if (onImportScreen) {
          // Delay redirect slightly so the toast is visible even when coming from import screen.
          setTimeout(() => {
            router.replace(buildCreatedActivityHref(activityId) as never);
          }, 50);
        }
      }

      if (nextStatus === "failed" || nextStatus === "deleted") {
        if (!onImportScreen) {
          const action =
            nextStatus === "failed"
              ? {
                  label: t("import:toast.view"),
                  href: `/import`,
                }
              : null;

          dispatch(
            showToastAction({
              message: t("import:toast.failed"),
              type: "error",
              action,
            })
          );
        }
        dispatch(setImportActivity(null));
      }

      lastStatusRef.current = {
        id: activityId,
        status: nextStatus as ActivityProcessingStatus,
      };
    };

    if (!activityId || status !== "processing") {
      if (status === "complete") {
        handleStatusChange("complete");
      }

      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    const channel = supabase
      .channel(`import-completion:${activityId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "activities",
          filter: `id=eq.${activityId}`,
        },
        (payload) => {
          const next = payload.new as any;
          const nextStatus = (next.processing_status ??
            "complete") as ActivityProcessingStatus;
          dispatch(activityUpdated(next));
          dispatch(setImportActivity(next));
          if (nextStatus !== "processing") {
            handleStatusChange(nextStatus);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "activities",
          filter: `id=eq.${activityId}`,
        },
        () => handleStatusChange("deleted")
      )
      .subscribe();

    channelRef.current = channel;

    const poll = async () => {
      try {
        const latest = await ActivitiesService.fetchActivityById(activityId);
        if (latest) {
          const nextStatus = (latest.processing_status ??
            "complete") as ActivityProcessingStatus;
          dispatch(activityUpdated(latest));
          dispatch(setImportActivity(latest));
          if (nextStatus !== "processing") {
            handleStatusChange(nextStatus);
          }
        } else {
          handleStatusChange("deleted");
        }
      } catch (err) {
        console.log("[import-listener] poll failed", err);
      }
    };

    pollRef.current = setInterval(poll, POLL_INTERVAL);
    poll();

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [
    activity?.id,
    activity?.processing_status,
    dispatch,
    pathname,
    router,
    t,
  ]);

  useEffect(() => {
    if (!activity) {
      lastStatusRef.current = null;
    }
  }, [activity]);
};
