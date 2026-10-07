import { StyleSheet, Text, View } from "react-native";

import React from "react";
import { SessionSnapshot } from "../../sessionEngine/sessionEngine";
import formatCountdown from "../../helpers/Timer/formatCountdown";

const SessionTimer = React.memo(({ snapshot }: { snapshot: SessionSnapshot }) => {
  const isCompleted = snapshot.phase === "COMPLETED";

  const timerDisplay = (): string => {
    if (snapshot.phase === "FOCUS")
      return formatCountdown(snapshot.focusTimeSec - snapshot.elapsedInPhaseSec);
    else if (snapshot.phase === "SHORT_BREAK")
      return formatCountdown(snapshot.shortBreakSec - snapshot.elapsedInPhaseSec);
    else if (snapshot.phase === "LONG_BREAK")
      return formatCountdown(snapshot.longBreakSec - snapshot.elapsedInPhaseSec);
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
      <Text style={styles.elapsedText}>{formatCountdown(snapshot.totalElapsedSec)}</Text>
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
