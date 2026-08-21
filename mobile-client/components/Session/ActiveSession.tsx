import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { SessionEngine, SessionSnapshot } from "../../sessionEngine/sessionEngine";
import { useNavigation, usePreventRemove } from "@react-navigation/native"; // You can choose any icon set like FontAwesome, MaterialIcons, etc.
import EnhancedDistanceProgressBar from "../DistanceProgressBar";
import Icon from "react-native-vector-icons/Ionicons";
import QuitSessionModal from "./QuitSessionModal";
import { SessionSnapshotPayload } from "../../EventBus/EventBus";
import SessionTimer from "../Timer/SessionTimer";
import useBusEvent from "../../EventBus/useBusEvent";
import { useServices } from "../../contexts/ServiceProvider";
import { withObservables } from "@nozbe/watermelondb/react";

const ActiveSession = ({ user, currentTrail }: any) => {
  const navigation = useNavigation();
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

  console.log(snapshot);

  return (
    <SafeAreaView style={styles.container} testID="active-session-screen">
      <ScrollView style={{ paddingBottom: 80 }}>
        <QuitSessionModal
          isVisible={showQuitSessionModal}
          cancel={() => {
            let next = !snapshot.isPaused;
            setSnapshot(prev => ({ ...prev!, isPaused: next }));
            bus.emit("UI_RESUME_REQUESTED");
            setShowQuitSessionModal(false);
          }}
          quit={() => {
            bus.emit("UI_QUIT_REQUESTED");
          }}
          sessionDetails={snapshot}
        />
        {/* <ContinueSessionModal
					isVisible={timer.isCompleted}
					showResultsScreen={showResultsScreen}
					onAddSession={onAddSession}
					onAddSet={onAddSet}
					focusTime={timer.focusTime}
					endSession={endSession}
				/> */}

        <SessionTimer snapshot={snapshot} />
        <View style={styles.buttonsContainer}>
          {/* Stop Button */}
          <Pressable
            testID="stop-button"
            style={[styles.button, styles.endSessionButton]}
            onPress={() => {
              let next = !snapshot.isPaused;
              setShowQuitSessionModal(true);
              setSnapshot(prev => ({ ...prev!, isPaused: next }));
              bus.emit("UI_PAUSE_REQUESTED");
            }}>
            <Icon name="square" size={28} color="white" />
          </Pressable>

          {/* Pause/Resume Button (conditionally rendered icon) */}
          <Pressable
            testID="pause-resume-button"
            onPress={() => {
              let next = !snapshot.isPaused;
              setSnapshot(prev => ({ ...prev!, isPaused: next }));
              snapshot.isPaused ? bus.emit("UI_RESUME_REQUESTED") : bus.emit("UI_PAUSE_REQUESTED");
            }}
            style={[styles.button, styles.pauseResumeButton]}>
            <Icon name={snapshot.isPaused ? "play" : "pause"} size={28} color="white" />
          </Pressable>
          {/* Skip Break Button (conditionally rendered) */}
          {snapshot.phase.includes("BREAK") && (
            <Pressable
              testID="skip-break-button"
              onPress={() => {
                bus.emit("UI_BREAK_SKIP_REQUESTED");
              }}
              style={[styles.button, styles.skipBreakButton]}>
              <Icon name="play-skip-forward" size={28} color="white" />
            </Pressable>
          )}
        </View>
        <View style={styles.trailNameContainer}>
          <Text style={styles.trailName} testID="current-trail-name">
            {currentTrail.trailName}
          </Text>
          <EnhancedDistanceProgressBar user={user} trail={currentTrail} />
        </View>
        {/* <ActiveSessionBackpack sessionDetails={sessionDetails} user={user} /> */}
        <View style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <StatBox label="Pace" value={`${snapshot.currentPaceMph} mph`} />
            <StatBox label="Sets" value={`${snapshot.completedSets} / ${snapshot.totalSets}`} />
            <StatBox label="Strikes" value={snapshot.totalStrikes} />
            <StatBox label="Total-Dist." value={`${snapshot.totalDistanceMiles.toFixed(2)} mi.`} />
            {/* <StatBox label="Reward" value={Number( session.totalTokensEarned)} /> */}
            {/* <StatBox  label="Achievements" value={earnedAchievements.length} /> */}
            <StatBox label="Trails" value={snapshot.completedTrails.length} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatBox = React.memo(({ label, value }: { label: string; value: string | number }) => (
  <View key={`${label}:${value}`} style={styles.infoBox}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text testID={label.toLowerCase()} style={styles.infoValue}>
      {value}
    </Text>
  </View>
));

const ActionButton = ({ onPress, label, buttonStyle }: any) => (
  <Pressable onPress={onPress} style={[styles.button, buttonStyle]}>
    <Text style={styles.buttonText}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    padding: 20,
  },
  trailNameContainer: {
    marginBottom: 10,
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
  },
  trailName: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 10,
  },
  statsContainer: {
    backgroundColor: "rgba(255,255,255,.1)",
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoBox: {
    width: "30%",
    marginBottom: 20,
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#aaa",
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#ffffff",
  },
  buttonsContainer: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
  },
  endSessionButton: {
    backgroundColor: "transparent",
  },
  skipBreakButton: {
    backgroundColor: "transparent",
  },
  pauseResumeButton: {
    backgroundColor: "transparent",
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
  ],
  ({ user }) => ({
    user: user.observe(),
    currentTrail: user.trail.observe(),
    completedTrails: user.usersCompletedTrails.observe(),
    queuedTrails: user.usersQueuedTrails.observe(),
    userAchievements: user.usersAchievements.observe(),
    userPurchasedTrails: user.usersPurchasedTrails.observe(),
  }),
);

const EnhancedActiveSession = enhance(ActiveSession);
export default EnhancedActiveSession;
