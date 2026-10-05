import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SessionEngine, SessionSnapshot } from "../../sessionEngine/sessionEngine";
import { useNavigation, usePreventRemove } from "@react-navigation/native"; // You can choose any icon set like FontAwesome, MaterialIcons, etc.
import { darkTheme, lightTheme } from "../../theme";

import EnhancedDistanceProgressBar from "../DistanceProgressBar";
import Icon from "react-native-vector-icons/Ionicons";
import { Q } from "@nozbe/watermelondb";
import QuitSessionModal from "./QuitSessionModal";
import { SessionSnapshotPayload } from "../../EventBus/EventBus";
import SessionTimer from "../Timer/SessionTimer";
import WildAvatar from "../Wilds/WildAvatar";
import useBusEvent from "../../EventBus/useBusEvent";
import { useServices } from "../../contexts/ServiceProvider";
import { useTheme } from "../../contexts/ThemeProvider";
import { withObservables } from "@nozbe/watermelondb/react";

const ActiveSession = ({ user, currentTrail, activeWilds = [] }: any) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { bus, sessionEngineMgr } = useServices();
  const sEngineRef = useRef<SessionEngine | null>(null);
  const [showQuitSessionModal, setShowQuitSessionModal] = useState(false);
  const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null);

  useEffect(() => {
    if (sessionEngineMgr?.getCurrent()) {
      sEngineRef.current = sessionEngineMgr.getCurrent()!;
      const snapshot = sEngineRef.current.buildSnapshot();
      setSnapshot(snapshot);
    }
  }, []);
  useBusEvent("SESSION_TICK", (payload: SessionSnapshotPayload) => setSnapshot(payload.snapshot));
  useBusEvent("SESSION_PAUSED", (payload: SessionSnapshotPayload) => {
    setSnapshot(payload.snapshot);
  });
  useBusEvent("SESSION_PACE_INCREASED", (payload: SessionSnapshotPayload) => {
    setSnapshot(payload.snapshot);
  });
  useBusEvent("SESSION_BREAK_SKIPPED", (payload: SessionSnapshotPayload) => {
    setSnapshot(payload.snapshot);
  });

  // const onAchievementEarned = useCallback(
  // 	(achievements: Achievement[]) => {
  // 		setEarnedAchievements((prevAchievements) => [
  // 			...prevAchievements,
  // 			...achievements,
  // 		]);
  // 	},
  // 	[]
  // );

  // const checkUserSessionAchievements = async () => {
  // 	const results = await achievementManagerInstance.checkUserSessionAchievements(
  // 		user,
  // 		sessionDetails,
  // 		currentSessionCategory,
  // 		achievementsWithCompletion
  // 	);
  // 	if (results) {onAchievementEarned(results);}
  // };

  // useEffect(() => {
  // 	if (user && sessionDetails && currentSessionCategory && achievementsWithCompletion) {
  // 		checkUserSessionAchievements();
  // 	}
  // }, [achievementsWithCompletion]);

  // const onAddSession = async () => {
  // 	try {
  // 		const sessionTokenReward = await Rewards.calculateSessionTokens({
  // 			setSessionDetails,
  // 			sessionDetails,
  // 			timer,
  // 		});

  // 		setSessionDetails((prev) => ({
  // 			...prev,
  // 			totalSessionTokens: sessionTokenReward,
  // 		}));

  // 		setTimer((prev: { focusTime: any; sets: number; }) => ({
  // 			...prev,
  // 			time: prev.focusTime,
  // 			sets: prev.sets + 3,
  // 			isBreak: false,
  // 			isCompleted: false,
  // 		}));
  // 	} catch (err) {
  // 		handleError(err, 'onAddSession');
  // 	}
  // };

  // const onAddSet = async () => {
  // 	try {
  // 		const sessionTokenReward = await Rewards.calculateSessionTokens({
  // 			setSessionDetails,
  // 			sessionDetails,
  // 			timer,
  // 		});

  // 		setSessionDetails((prev) => ({
  // 			...prev,
  // 			totalSessionTokens: sessionTokenReward,
  // 		}));

  // 		setTimer((prev: { focusTime: any; sets: number; }) => ({
  // 			...prev,
  // 			time: prev.focusTime,
  // 			sets: prev.sets + 1,
  // 			isBreak: false,
  // 			isCompleted: false,
  // 		}));
  // 	} catch (err) {
  // 		handleError(err, 'onAddSet');
  // 	}
  // };

  const shouldPreventRemove = snapshot && snapshot.phase !== "COMPLETED" ? true : false;
  //This disallows an active session to leave
  //leaving kills the session.
  usePreventRemove(shouldPreventRemove, ({ data }) => {
    //@ts-ignore
    setSnapshot(prev => ({ ...prev, isPaused: true }));
    bus.emit("UI_PAUSE_REQUESTED");
    Alert.alert("Quit Session?", "Miles stay, Rewards dont!", [
      {
        text: "Don't Quit",
        style: "cancel",
        onPress: () => {
          setSnapshot(prev => ({ ...prev!, isPaused: false }));
          bus.emit("UI_RESUME_REQUESTED");
        },
      },
      {
        text: "I'm a quitter",
        style: "destructive",
        onPress: () => navigation.dispatch(data.action),
      },
    ]);
  });

  if (!snapshot) {
    return <Text>No Session</Text>;
  }

  const activeWildId = activeWilds[0]?.wildId ?? "scout";
  const phaseLabel = snapshot.phase.includes("BREAK")
    ? "Recovery Break"
    : snapshot.phase === "COMPLETED"
    ? "Session Complete"
    : snapshot.isPaused
    ? "Paused Trek"
    : "Focus Trek";
  const companionCopy = snapshot.phase.includes("BREAK")
    ? "Your wild is catching its breath with you."
    : snapshot.isPaused
    ? "Paused beside the trail. Ready when you are."
    : "Your wild is pacing this trail with you.";

  return (
    <SafeAreaView style={styles.container} testID="active-session-screen">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <QuitSessionModal
          isVisible={showQuitSessionModal}
          cancel={() => {
            let next = !snapshot.isPaused;
            setSnapshot(prev => ({ ...prev!, isPaused: next }));
            bus.emit("UI_RESUME_REQUESTED");
            setShowQuitSessionModal(false);
          }}
          quit={() => {
            setShowQuitSessionModal(false);
            setTimeout(() => {
              bus.emit("UI_QUIT_REQUESTED");
            }, 0);
          }}
          sessionDetails={snapshot}
        />

        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View>
              <Text style={styles.eyebrow}>Active Session</Text>
              <Text style={styles.heroTitle}>{snapshot.sessionName || "Trail Focus"}</Text>
            </View>
            <View style={[styles.phasePill, snapshot.isPaused && styles.pausedPill]}>
              <Text style={styles.phasePillText}>{phaseLabel}</Text>
            </View>
          </View>

          <View style={styles.timerPanel}>
            <SessionTimer snapshot={snapshot} />
          </View>

          <View style={styles.companionCard}>
            <View style={styles.wildBadge}>
              <WildAvatar
                id={activeWildId}
                pose={snapshot.isPaused ? "still" : "wave"}
                size={96}
                animated
              />
            </View>
            <View style={styles.companionTextBlock}>
              <Text style={styles.companionLabel}>Trail companion</Text>
              <Text style={styles.companionCopy}>{companionCopy}</Text>
            </View>
          </View>
        </View>

        <View style={styles.controlsCard}>
          <Pressable
            testID="stop-button"
            accessibilityLabel="Quit session"
            style={({ pressed }) => [
              styles.controlButton,
              styles.stopButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              let next = !snapshot.isPaused;
              setShowQuitSessionModal(true);
              setSnapshot(prev => ({ ...prev!, isPaused: next }));
              bus.emit("UI_PAUSE_REQUESTED");
            }}>
            <Icon name="square" size={24} color="#ffffff" />
            <Text style={styles.controlButtonText}>Quit</Text>
          </Pressable>

          <Pressable
            testID="pause-resume-button"
            accessibilityLabel={snapshot.isPaused ? "Resume session" : "Pause session"}
            onPress={() => {
              let next = !snapshot.isPaused;
              setSnapshot(prev => ({ ...prev!, isPaused: next }));
              snapshot.isPaused ? bus.emit("UI_RESUME_REQUESTED") : bus.emit("UI_PAUSE_REQUESTED");
            }}
            style={({ pressed }) => [
              styles.controlButton,
              styles.primaryControlButton,
              pressed && styles.buttonPressed,
            ]}>
            <Icon name={snapshot.isPaused ? "play" : "pause"} size={26} color={theme.buttonText} />
            <Text style={[styles.controlButtonText, styles.primaryControlButtonText]}>
              {snapshot.isPaused ? "Resume" : "Pause"}
            </Text>
          </Pressable>

          {snapshot.phase.includes("BREAK") && (
            <Pressable
              testID="skip-break-button"
              accessibilityLabel="Skip break"
              onPress={() => {
                bus.emit("UI_BREAK_SKIP_REQUESTED");
              }}
              style={({ pressed }) => [
                styles.controlButton,
                styles.skipButton,
                pressed && styles.buttonPressed,
              ]}>
              <Icon name="play-skip-forward" size={24} color="#ffffff" />
              <Text style={styles.controlButtonText}>Skip</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.trailCard}>
          <View style={styles.trailHeaderRow}>
            <Text style={styles.eyebrow}>Current Trail</Text>
            <Text style={styles.trailDistance}>
              {snapshot.totalDistanceMiles.toFixed(2)} mi today
            </Text>
          </View>
          <Text style={styles.trailName} testID="current-trail-name" numberOfLines={2}>
            {currentTrail?.trailName ?? "Current trail"}
          </Text>
          <EnhancedDistanceProgressBar user={user} trail={currentTrail} />
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Trek stats</Text>
          <View style={styles.statsGrid}>
            <StatBox styles={styles} label="Pace" value={`${snapshot.currentPaceMph} mph`} />
            <StatBox
              styles={styles}
              label="Sets"
              value={`${snapshot.completedSets} / ${snapshot.totalSets}`}
            />
            <StatBox styles={styles} label="Strikes" value={snapshot.totalStrikes} />
            <StatBox
              styles={styles}
              label="Total-Dist."
              value={`${snapshot.totalDistanceMiles.toFixed(2)} mi.`}
            />
            <StatBox styles={styles} label="Trails" value={snapshot.completedTrails.length} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatBox = React.memo(
  ({
    label,
    value,
    styles,
  }: {
    label: string;
    value: string | number;
    styles: ReturnType<typeof getStyles>;
  }) => (
    <View key={`${label}:${value}`} style={styles.infoBox}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text testID={label.toLowerCase()} style={styles.infoValue}>
        {value}
      </Text>
    </View>
  ),
);

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
      gap: 12,
    },
    heroCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 26,
      borderWidth: 1,
      overflow: "hidden",
      padding: 18,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
      elevation: 5,
    },
    heroHeader: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
      marginBottom: 12,
    },
    eyebrow: {
      color: theme.button,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    heroTitle: {
      color: theme.text,
      fontSize: 23,
      fontWeight: "700",
      letterSpacing: -0.3,
      marginTop: 4,
    },
    phasePill: {
      backgroundColor: "rgba(19, 179, 172, 0.18)",
      borderColor: theme.button,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    pausedPill: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderColor: theme.border,
    },
    phasePillText: {
      color: theme.text,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    timerPanel: {
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      marginTop: 2,
    },
    companionCard: {
      alignItems: "center",
      alignSelf: "center",
      backgroundColor: theme.progressBarBackground,
      borderColor: theme.border,
      borderRadius: 20,
      borderWidth: 1,
      flexDirection: "row",
      gap: 12,
      justifyContent: "center",
      maxWidth: 360,
      paddingHorizontal: 14,
      paddingVertical: 10,
      width: "100%",
    },
    wildBadge: {
      alignItems: "center",
      flexShrink: 0,
      height: 104,
      justifyContent: "center",
      width: 104,
    },
    companionTextBlock: {
      flex: 1,
      minWidth: 0,
    },
    companionLabel: {
      color: theme.button,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.9,
      marginBottom: 4,
      textTransform: "uppercase",
    },
    companionCopy: {
      color: theme.secondaryText,
      fontSize: 13,
      fontWeight: "500",
      lineHeight: 18,
    },
    controlsCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 22,
      borderWidth: 1,
      flexDirection: "row",
      gap: 10,
      padding: 12,
    },
    controlButton: {
      alignItems: "center",
      borderRadius: 16,
      flex: 1,
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
      paddingHorizontal: 10,
      paddingVertical: 14,
    },
    primaryControlButton: {
      backgroundColor: theme.button,
    },
    stopButton: {
      backgroundColor: "rgba(198, 40, 40, 0.9)",
    },
    skipButton: {
      backgroundColor: "rgba(255, 255, 255, 0.12)",
      borderColor: theme.border,
      borderWidth: 1,
    },
    buttonPressed: {
      opacity: 0.78,
      transform: [{ scale: 0.98 }],
    },
    controlButtonText: {
      color: "#ffffff",
      fontSize: 14,
      fontWeight: "700",
    },
    primaryControlButtonText: {
      color: theme.buttonText,
    },
    trailCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
    },
    trailHeaderRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    trailDistance: {
      color: theme.secondaryText,
      fontSize: 12,
      fontWeight: "500",
    },
    trailName: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 12,
    },
    statsCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 22,
      borderWidth: 1,
      padding: 16,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    infoBox: {
      backgroundColor: theme.inputBackground,
      borderColor: theme.border,
      borderRadius: 16,
      borderWidth: 1,
      flexGrow: 1,
      minWidth: "30%",
      paddingHorizontal: 10,
      paddingVertical: 12,
    },
    infoLabel: {
      color: theme.secondaryText,
      fontSize: 11,
      fontWeight: "700",
      marginBottom: 5,
      textTransform: "uppercase",
    },
    infoValue: {
      color: theme.text,
      fontSize: 14,
      fontWeight: "600",
    },
  });

const enhance = withObservables(
  [
    "user",
    "currentTrail",
    "completedTrails",
    "queuedTrails",
    "usersAchievements",
    "userPurchasedTrails",
    "activeWilds",
  ],
  ({ user }) => ({
    user: user.observe(),
    currentTrail: user.trail.observe(),
    completedTrails: user.usersCompletedTrails.observe(),
    queuedTrails: user.usersQueuedTrails.observe(),
    userAchievements: user.usersAchievements.observe(),
    userPurchasedTrails: user.usersPurchasedTrails.observe(),
    activeWilds: user.usersWilds.extend(Q.where("is_active", true), Q.take(1)).observe(),
  }),
);

const EnhancedActiveSession = enhance(ActiveSession);
export default EnhancedActiveSession;
