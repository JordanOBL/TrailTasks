import { StyleSheet, Text, View } from "react-native";

import React from "react";
import { SessionSnapshot } from "../../sessionEngine/sessionEngine";
import formatCountdown from "../../helpers/Timer/formatCountdown";

// Keep transient/invalid runtime values out of the visible countdown.
const formatSafeTime = (seconds: number): string =>
  formatCountdown(Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0);

const SessionTimer = React.memo(({ snapshot }: { snapshot: SessionSnapshot }) => {
  const timerDisplay = (): string => {
    if (snapshot.phase === "FOCUS")
      return formatSafeTime(snapshot.focusTimeSec - snapshot.elapsedInPhaseSec);
    else if (snapshot.phase === "SHORT_BREAK")
      return formatSafeTime(snapshot.shortBreakSec - snapshot.elapsedInPhaseSec);
    else if (snapshot.phase === "LONG_BREAK")
      return formatSafeTime(snapshot.longBreakSec - snapshot.elapsedInPhaseSec);
    else if (snapshot.phase === "Paused") return "Paused";
    else return "Completed";
  };

  return (
    <View style={styles.timerContainer} testID="timer-display">
      <Text
        style={[
          styles.timerText,
          (snapshot.isPaused || snapshot.phase.includes("BREAK")) && styles.pausedText,
        ]}>
        {timerDisplay()}
      </Text>
      <Text style={styles.elapsedText}>{formatSafeTime(snapshot.totalElapsedSec)}</Text>
    </View>
  );
});

export default SessionTimer;
const styles = StyleSheet.create({
  timerContainer: {
    alignItems: "center",
    minWidth: 170,
  },
  timerText: {
    color: "rgb(7,254,213)",
    fontSize: 52,
    fontVariant: ["tabular-nums"],
    fontWeight: "500",
    letterSpacing: 0.5,
    lineHeight: 62,
    marginBottom: 4,
    textAlign: "center",
    width: 170,
  },
  pausedText: {
    color: "#D3E5EB",
  },
  elapsedText: {
    color: "#8EA7AE",
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    fontWeight: "500",
    letterSpacing: 0.4,
  },
});
