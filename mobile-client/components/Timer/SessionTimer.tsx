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
      <Text style={{ color: "#D3E5EB" }}>{formatCountdown(snapshot.totalElapsedSec)}</Text>
    </View>
  );
});

export default SessionTimer;
const styles = StyleSheet.create({
  timerContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 60,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 10,
    color: "rgb(7,254,213)",
  },
  pausedText: {
    color: "#D3E5EB",
  },
});
