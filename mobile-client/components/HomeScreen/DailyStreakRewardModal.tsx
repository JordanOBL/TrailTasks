import React from "react";
import type { DailyStreakAward } from "../../hooks/useDailyStreakReward";
import CelebrationModal from "./CelebrationModal";

/** Compatibility wrapper; daily streaks use the same accessible celebration card. */
export default function DailyStreakRewardModal({ award, onDismiss }: {
  award: DailyStreakAward;
  onDismiss: () => void;
}) {
  return <CelebrationModal award={{ ...award, kind: "daily_streak", id: `streak:${award.transactionId}` }} onDismiss={onDismiss} />;
}
