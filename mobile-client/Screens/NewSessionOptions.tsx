import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Badge, Button } from "react-native-paper";
import { Addon, Park, Trail } from "../watermelon/models";
import React, { useEffect, useState } from "react";

import BackpackModal from "../components/Session/BackpackModal";
import EnhancedDistanceProgressBar from "../components/DistanceProgressBar";
import { Q } from "@nozbe/watermelondb";
import { SessionCfg } from "../types/session";
import { Session_Category } from "../watermelon/models";
import SettingsModal from "../components/Session/SettingsModal";
import formatCountdown from "../helpers/Timer/formatCountdown";
import handleError from "../helpers/ErrorHandler";
import { useAuthContext } from "../services/AuthContext";
import { useDatabase } from "@nozbe/watermelondb/react";
import { useServices } from "../contexts/ServiceProvider";

const DEFAULT_BACKPACK = [
  { addon: null, minimumTotalMiles: 0.0 },
  { addon: null, minimumTotalMiles: 75.0 },
  { addon: null, minimumTotalMiles: 175.0 },
  { addon: null, minimumTotalMiles: 375.0 },
];

const baseAddonConfig = {
  totalSets: 3,
  completedTrails: 0,
  currentPaceMph: 2,
  minPaceMph: 2,
  maxPaceMph: 5.5,
  paceIncreaseValueMph: 0.25,
  paceIncreaseIntervalSec: 900,
  tokenBonusFlat: 0,
  tokenBonusPercent: 0,
};

const NewSessionOptions = () => {
  const db = useDatabase();
  const { user } = useAuthContext();
  const { sessionEngineMgr, persistenceService } = useServices();
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(true);
  const [isBackpackModalVisible, setIsBackpackModalVisible] = useState(false);
  const [sessionCfg, setSessionCfg] = useState<SessionCfg>({
    session: null,
    sessionId: "",
    type: "solo",
    userId: user?.id || "",
    sessionName: "",
    sessionDescription: "",
    sessionCategory: ["", ""],
    totalSets: 3,
    distanceNeeded: Infinity,
    completedTrails: 0,
    currentPaceMph: 2,
    minPaceMph: 2,
    maxPaceMph: 5.5,
    paceIncreaseValueMph: 0.25,
    paceIncreaseIntervalSec: 900,
    autoContinue: false,
    focusTimeSec: 1500,
    shortBreakSec: 300,
    longBreakSec: 2700,
    tokenBonusFlat: 0,
    tokenBonusPercent: 0,
    backpack: DEFAULT_BACKPACK,
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [categories, setCategories] = useState<Session_Category[]>([]);
  const [currentTrail, setCurrentTrail] = useState<Trail | null>(null);
  const [currentPark, setCurrentPark] = useState<Park | null>(null);
  const [usersAddonSelection, setUsersAddonSelection] = useState<Addon[]>([]);

  if (!user)
  {
    setLoading(false);
    setError(true);
  }

  const closeBackpackModal = () =>
  {
    const sessionCfgWithAddons: SessionCfg = { ...sessionCfg, ...baseAddonConfig };

    sessionCfgWithAddons.backpack.forEach(slot => {
      if (slot.addon) {
        switch (slot.addon.effectType) {
          case "min_pace_increase":
            sessionCfgWithAddons.minPaceMph = slot.addon.effectValue;
            break;
          case "max_pace_increase":
            sessionCfgWithAddons.maxPaceMph = slot.addon.effectValue;
            break;
          case "pace_increase_interval":
            sessionCfgWithAddons.paceIncreaseIntervalSec = slot.addon.effectValue;
            break;
          case "pace_increase_value":
            sessionCfgWithAddons.paceIncreaseValueMph = slot.addon.effectValue;
            break;
          //  case "penalty_reduction":
          //    sessionCfgWithAddons.penaltyValue -= slot.addon.effectValue;
          //    break;
          case "trail_token_bonus":
            sessionCfgWithAddons.tokenBonusFlat += slot.addon.effectValue;
            break;
          default:
            break;
        }
      }
    });

    setSessionCfg(sessionCfgWithAddons);
    setIsBackpackModalVisible(false);
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!user) {
          throw Error("No User Detected");
        }
        const [sc, [ct]] = await Promise.all([
          db.get<Session_Category>("session_categories").query().fetch(),
          db.get<Trail>("trails").query(Q.where("id", user?.trailId)).fetch(),
        ]);
        const usersAddons = await user.usersAddons;
        if (!sc) {
          throw Error("Error getting session categories");
        }
        if (!ct) {
          throw Error("Error Getting users current Trail");
        }
        const park = await ct.park;
        if (!park) {
          throw Error("Error getting the park the current trail belongs to");
        }
        if (alive) {
          setCurrentTrail(ct);
          setCurrentPark(park);
          setCategories(sc);
          setUsersAddonSelection(usersAddons);
          setLoading(false);
        }
      } catch (e) {
        handleError(e, "Error in NewSessionOptions");
        if (alive)
        {
          setLoading(false);
          setError(true);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [user, db]);


  if (loading) {
    return <ActivityIndicator />;
  }

  if (!user || !sessionEngineMgr || !persistenceService || error) {
    return (
      <View>
        <Text>Cannot Create New Session</Text>
        <Text>Try Restarting App</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} testID="new-session-options">
      <View style={styles.header}>
        <Text testID="session-name-display" style={styles.sessionName}>
          {sessionCfg.sessionName}
        </Text>
        <Text testID="session-category-display" style={styles.sessionCategory}>
          {categories.filter(item => item.id === sessionCfg.sessionCategory[0])[0]
            ?.sessionCategoryName || "Select a Category"}
        </Text>
      </View>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatCountdown(sessionCfg.focusTimeSec)}</Text>
      </View>
      {/* Trail Info and Progress Bar */}
      <View style={styles.middleContainer}>
        <Text style={styles.trailName}>{currentTrail?.trailName || ""}</Text>
        <Text style={styles.parkName}>{currentPark?.parkName || ""} National Park</Text>
        <EnhancedDistanceProgressBar user={user} />
      </View>
      {/* Buttons */}
      <View style={styles.buttonsContainer}>
        <Button
          icon="cog-outline"
          mode="contained"
          onPress={() => setIsSettingsModalVisible(true)}
          style={styles.button}
          testID="settings-modal-button">
          <Text>Settings</Text>
        </Button>

        <View style={styles.buttonWrapper}>
          <Button
            icon="bag-personal-outline"
            mode="contained"
            onPress={() => setIsBackpackModalVisible(true)}
            style={styles.button}>
            <Text>Backpack</Text>
          </Button>
          {sessionCfg.backpack.filter(item => item.addon != null).length > 0 && (
            <Badge style={styles.badge}>
              {sessionCfg.backpack.filter(item => item.addon != null).length}
            </Badge>
          )}
        </View>

        <Pressable
          testID="start-session-button"
          onPress={async () => {
            try {
              //start manager and create new user in persistance service
              if (!user) {
                throw new Error("No User please login");
              }
              if (!db) {
                throw new Error("Database not found");
              }

              const createdSession = await sessionEngineMgr.requestNewSession(sessionCfg);
              if (!createdSession) {
                throw new Error("Session Manager didnt return a valid User Session ");
              }

              const sEngine = await sessionEngineMgr.createSessionEngine(
                sessionCfg,
                createdSession,
              );
              if (!sEngine) {
                throw new Error("Session Manager didnt return a valid Session Engine");
              }

              sEngine.start();
            } catch (e) {
              handleError(e, "NewSessionOptions start session press");
            }
          }}
          style={[
            styles.startBtn,
            {
              backgroundColor:
                sessionCfg.sessionName === "" ||
                sessionCfg.sessionCategory.every(item => !item) == true
                  ? "#444"
                  : "rgb(7,254,213)",
            },
          ]}
          disabled={!sessionCfg.sessionCategory[0] || !sessionCfg.sessionName}>
          <Text style={styles.startBtnText}>Start Session</Text>
        </Pressable>
      </View>
      {/* Settings Modal */}
      <SettingsModal
        visible={isSettingsModalVisible}
        sessionCfg={sessionCfg}
        setSessionCfg={setSessionCfg}
        setVisible={setIsSettingsModalVisible}
        sessionCategories={categories}
      />
      {/* Backpack Modal */}
      <BackpackModal
                isVisible={isBackpackModalVisible}
                onClose={closeBackpackModal}
                sessionCfg={sessionCfg}
                setSessionCfg={setSessionCfg}
                user={user}
                usersAddons={usersAddonSelection}
            />
    </SafeAreaView>
  );
};

export default NewSessionOptions;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c1c1c",
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 20,
    backgroundColor: "#292929",
    alignItems: "center",
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    textAlign: "center",
  },
  sessionName: {
    color: "rgb(7,254,213)",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  sessionCategory: {
    color: "rgb(7,254,213)",
    fontSize: 14,
    fontWeight: "semibold",
    textAlign: "center",
  },
  middleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  trailName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  parkName: {
    color: "white",
    opacity: 0.5,
    fontSize: 14,
    marginBottom: 15,
    letterSpacing: 1,
    fontWeight: "thin",
    textAlign: "center",
  },
  buttonsContainer: {
    bottom: 0,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#292929",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  button: {
    borderRadius: 8,
    backgroundColor: "#017371",
    marginBottom: 10,
  },
  buttonWrapper: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "rgb(128, 0, 128)",
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 10,
  },
  startBtn: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  startBtnText: {
    color: "#1c1c1c",
    fontSize: 18,
    fontWeight: "800",
  },
  timerContainer: {
    alignItems: "center",
    margin: 12,
  },
  timerText: {
    fontSize: 60,
    fontWeight: "bold",
    textAlign: "center",
    color: "rgb(7,254,213)",
  },
});
