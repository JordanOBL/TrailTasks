import { useCallback, useEffect, useState } from "react";
import { useIsFocused } from "@react-navigation/native";
import { useServices } from "../contexts/ServiceProvider";

export type { DailyStreakRewardCommittedPayload as DailyStreakAward } from "../EventBus/EventBus";
import type { DailyStreakRewardCommittedPayload as DailyStreakAward } from "../EventBus/EventBus";

/** The service owns pending awards; a screen subscription is not the event history. */
export function useDailyStreakReward(userId?: string) {
  const { rewardService: service, bus } = useServices();
  const isFocused = useIsFocused();
  const [snapshot, setSnapshot] = useState<{
    service: typeof service;
    awards: readonly DailyStreakAward[];
  }>({ service: null, awards: [] });

  useEffect(() => {
    if (!service || !userId) {
      setSnapshot({ service: null, awards: [] });
      return;
    }
    const refresh = () => setSnapshot({ service, awards: service.getPending() });
    // Subscribe first, then read to cover awards emitted while Home was unmounted.
    const subscription = bus.on("DAILY_STREAK_REWARD_COMMITTED", refresh);
    refresh();
    return () => subscription.unregister();
  }, [service, userId, bus]);

  const award =
    isFocused && snapshot.service === service && userId
      ? snapshot.awards.find(item => item.userId === userId) ?? null
      : null;
  const dismiss = useCallback(() => {
    if (award && service) {
      service.acknowledge(award.transactionId);
      setSnapshot({ service, awards: service.getPending() });
    }
  }, [award, service]);

  return { award, dismiss };
}
