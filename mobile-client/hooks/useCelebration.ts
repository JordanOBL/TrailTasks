import { useCallback, useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useServices } from "../contexts/ServiceProvider";

import type { Celebration } from "../EventBus/EventBus";

/** The service owns pending awards; a screen subscription is not the event history. */
export function useCelebration(userId?: string) {
  const { rewardService: service, bus } = useServices();
  const isFocused = useIsFocused();
  const [snapshot, setSnapshot] = useState<{
    service: typeof service;
    awards: readonly Celebration[];
  }>({ service: null, awards: [] });

  useEffect(() => {
    if (!service || !userId) {
      setSnapshot({ service: null, awards: [] });
      return;
    }
    const refresh = () => setSnapshot({ service, awards: service.getCelebrations() });
    // Subscribe first, then read to cover awards emitted while Home was unmounted.
    const subscription = bus.on("CELEBRATION_QUEUED", refresh);
    refresh();
    return () => subscription.unregister();
  }, [service, userId, bus]);

  const award =
    isFocused && snapshot.service === service && userId
      ? snapshot.awards.find(item => item.userId === userId) ?? null
      : null;
  const dismiss = useCallback(() => {
    if (award && service) {
      service.acknowledgeCelebration(award.id);
      setSnapshot({ service, awards: service.getCelebrations() });
    }
  }, [award, service]);

  return { award, dismiss };
}
