import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { Celebration } from "../../EventBus/EventBus";
import WildAvatar from "../Wilds/WildAvatar";
import { useTheme } from "../../contexts/ThemeProvider";

const colors = ["#E6B94C", "#55B49A", "#81A9DE", "#D78CA7"];
const particles = Array.from({ length: 16 }, (_, index) => ({
  x: (index % 8) * 36 - 126,
  drift: index % 2 === 0 ? -24 : 24,
  delay: (index % 4) * 0.08,
  color: colors[index % colors.length],
}));

export default function CelebrationModal({
  award,
  onDismiss,
}: {
  award: Celebration;
  onDismiss: () => void;
}) {
  const { theme } = useTheme();
  // Be conservative until the accessibility preference is known.
  const [reduceMotion, setReduceMotion] = useState(true);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then(value => {
        if (active) setReduceMotion(value);
      })
      .catch(() => {
        /* Keep the non-animated celebration on preference errors. */
      });
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    progress.setValue(0);
    if (reduceMotion) return;
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 1800,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, reduceMotion, award.id]);

  return (
    <Modal
      transparent
      visible
      animationType={reduceMotion ? "none" : "fade"}
      onRequestClose={onDismiss}>
      <View style={styles.backdrop}>
        <View
          style={[styles.card, { backgroundColor: theme.background }]}
          accessibilityViewIsModal
          testID={award.kind === "daily_streak" ? "daily-streak-reward-modal" : "celebration-modal"}>
          {!reduceMotion && (
            <View
              testID={award.kind === "daily_streak" ? "streak-confetti" : "celebration-confetti"}
              style={styles.confetti}
              pointerEvents="none"
              accessible={false}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants">
              {particles.map((particle, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.particle,
                    {
                      backgroundColor: particle.color,
                      opacity: progress.interpolate({
                        inputRange: [0, 0.1, 0.8, 1],
                        outputRange: [0, 1, 1, 0],
                      }),
                      transform: [
                        {
                          translateX: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [particle.x, particle.x + particle.drift],
                          }),
                        },
                        {
                          translateY: progress.interpolate({
                            inputRange: [0, particle.delay + 0.1, 1],
                            outputRange: [-20, -20, 250],
                          }),
                        },
                        {
                          rotate: progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: ["0deg", index % 2 === 0 ? "240deg" : "-240deg"],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          )}
          {award.kind === "park" && award.newWild && (
            <WildAvatar id={award.newWild.wildId} pose="still" animated={false} size={120} />
          )}
          {award.kind === "wild_level" && (
            <WildAvatar id={award.wildId} pose="still" animated={false} size={120} />
          )}
          <Text style={[styles.title, { color: theme.text }]} accessibilityRole="header">
            {award.kind === "daily_streak" ? "Daily streak reward!"
              : award.kind === "park" ? "Park complete!" : `${award.wildName} leveled up!`}
          </Text>
          {award.kind === "daily_streak" ? <>
            <Text style={[styles.streak, { color: theme.text }]}>Day {award.dailyStreak} streak</Text>
            <Text style={[styles.amount, { color: theme.text }]}>+{award.amount} Trail Tokens</Text>
            <Text style={[styles.description, { color: theme.text }]}>Added to your token balance.</Text>
          </> : award.kind === "park" ? <>
            <Text style={[styles.streak, { color: theme.text }]}>{award.parkName} · Pass level {award.parkLevel}</Text>
            <Text style={[styles.amount, { color: theme.text }]}>+{award.amount} Trail Tokens</Text>
            {award.newWild && <Text style={[styles.description, { color: theme.text }]}>{award.newWild.wildName} unlocked!</Text>}
          </> : <>
            <Text style={[styles.amount, { color: theme.text }]}>Level {award.fromLevel} → {award.toLevel}</Text>
            <Text style={[styles.description, { color: theme.text }]}>Your companion is growing with you.</Text>
          </>}
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Continue"
            onPress={onDismiss}
            style={[styles.button, { backgroundColor: theme.button }]}>
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    padding: 28,
    borderRadius: 24,
    alignItems: "center",
    overflow: "hidden",
  },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center" },
  streak: { fontSize: 16, marginTop: 12 },
  amount: { fontSize: 28, fontWeight: "700", marginTop: 20, textAlign: "center" },
  description: { fontSize: 14, marginTop: 8, textAlign: "center" },
  button: {
    alignSelf: "stretch",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    marginTop: 28,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  confetti: { ...StyleSheet.absoluteFillObject, alignItems: "center" },
  particle: { position: "absolute", width: 7, height: 12, borderRadius: 2 },
});
