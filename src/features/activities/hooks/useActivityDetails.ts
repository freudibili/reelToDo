import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { ActivitiesService } from "@features/activities/services/activitiesService";
import { activityInserted, activityUpdated } from "@features/activities/store/activitiesSlice";
import type { Activity, ActivityProcessingStatus } from "@features/activities/utils/types";
import { supabase } from "@config/supabase";

export const useActivityDetails = (activityId: string | null) => {
  const dispatch = useAppDispatch();
  const activityFromStore = useAppSelector((state) =>
    activityId
      ? state.activities.items.find((item) => item.id === activityId) ?? null
      : null
  );
  const [fetched, setFetched] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(false);

  const activity = useMemo(
    () => activityFromStore ?? fetched,
    [activityFromStore, fetched]
  );

  useEffect(() => {
    if (!activityId || activityFromStore) return;
    setLoading(true);
    ActivitiesService.fetchActivityById(activityId)
      .then((result) => {
        if (result) {
          dispatch(activityInserted(result));
          setFetched(result);
        }
      })
      .finally(() => setLoading(false));
  }, [activityFromStore, activityId, dispatch]);

  useEffect(() => {
    const processingStatus = (activity?.processing_status ?? "complete") as ActivityProcessingStatus;
    if (!activityId || processingStatus !== "processing") return undefined;

    const channel = supabase
      .channel(`activity:detail:${activityId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "activities",
          filter: `id=eq.${activityId}`,
        },
        (payload) => {
          const next = payload.new as Activity;
          dispatch(activityUpdated(next));
          setFetched(next);
        },
      )
      .subscribe();

    const poll = async () => {
      try {
        const next = await ActivitiesService.fetchActivityById(activityId);
        if (next) {
          dispatch(activityUpdated(next));
          setFetched(next);
        }
      } catch (err) {
        console.log("[activity] poll failed", err);
      }
    };

    const interval = setInterval(poll, 4000);
    poll();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [activity?.processing_status, activityId, dispatch]);

  return { activity, loading } as const;
};
