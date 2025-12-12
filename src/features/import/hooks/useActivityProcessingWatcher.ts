import { useEffect, useRef } from "react";
import { supabase } from "@config/supabase";
import { useAppDispatch } from "@core/store/hook";
import {
  activityDeleted,
  activityUpdated,
} from "@features/activities/store/activitiesSlice";
import { ActivitiesService } from "@features/activities/services/activitiesService";
import { setImportActivity } from "../store/importSlice";
import type { Activity } from "@features/activities/utils/types";

const POLL_INTERVAL = 4000;

export const useActivityProcessingWatcher = (
  activityId: string | null | undefined,
  enabled: boolean,
  onDeleted?: () => void,
): void => {
  const dispatch = useAppDispatch();
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!activityId || !enabled) return undefined;

    const channel = supabase
      .channel(`activities:processing:${activityId}`)
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
          dispatch(setImportActivity(next));
          if (next.processing_status && next.processing_status !== "processing") {
            if (pollRef.current) {
              clearInterval(pollRef.current);
              pollRef.current = null;
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "activities",
          filter: `id=eq.${activityId}`,
        },
        (payload) => {
          const oldRow = payload.old as Activity;
          dispatch(activityDeleted(oldRow.id));
          dispatch(setImportActivity(null));
          onDeleted?.();
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        },
      )
      .subscribe();

    const poll = async () => {
      try {
        const latest = await ActivitiesService.fetchActivityById(activityId);
        if (latest) {
          dispatch(activityUpdated(latest));
          dispatch(setImportActivity(latest));
          if (
            latest.processing_status &&
            latest.processing_status !== "processing" &&
            pollRef.current
          ) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        } else {
          dispatch(activityDeleted(activityId));
          dispatch(setImportActivity(null));
          onDeleted?.();
          if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }
      } catch (err) {
        console.log("[processing] poll failed", err);
      }
    };

    pollRef.current = setInterval(poll, POLL_INTERVAL);
    poll();

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      supabase.removeChannel(channel);
    };
  }, [activityId, enabled, dispatch, onDeleted]);
};
