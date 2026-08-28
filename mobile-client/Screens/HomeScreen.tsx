import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { User, User_Wild } from "../watermelon/models";
import { darkTheme, lightTheme } from "../theme";

import DistanceProgressBar from "../components/DistanceProgressBar";
import HomeScreenLinks from "../components/HomeScreen/HomeScreenLinks";
import { Q } from "@nozbe/watermelondb";
import { Rank } from "../helpers/Ranks/ranksData";
/* eslint-disable react-native/no-inline-styles */
import React from "react";
import SyncButton from "../components/syncButton";
import TutorialModal from "../components/HomeScreen/tutorialModal";
import WildAvatar from "../components/Wilds/WildAvatar";
import XpRing from "../components/HomeScreen/XpRing";
import checkDailyStreak from "../helpers/Session/checkDailyStreak";
import getUserRank from "../helpers/Ranks/getUserRank";
import handleError from "../helpers/ErrorHandler";
import { hasUnsyncedChanges } from "@nozbe/watermelondb/sync";
import { sync } from "../watermelon/sync";
import { useDatabase } from "@nozbe/watermelondb/react";
import { useFocusEffect } from "@react-navigation/native";
import { useInternetConnection } from "../contexts/InternetConnectionProvider";
import { useTheme } from "../contexts/ThemeProvider";
import { withObservables } from "@nozbe/watermelondb/react";

interface Props {
  user: User;
  currentTrail?: any;
  navigation: any;
  setUser: any;
  userWilds: any;
  activeWilds: User_Wild[];
}

export const HomeScreen: React.FC<Props> = ({
  user,
  navigation,
  currentTrail,
  userWilds,
  activeWilds,
}) => {
  const watermelonDatabase = useDatabase();
  const { theme } = useTheme();

  const userRankRef = React.useRef<Rank | undefined>({
    level: "loading",
    group: "loading",
    image: null,
    range: [],
    title: "loading",
  });
  const { isConnected } = useInternetConnection();
  const [showTutorial, setShowTutorial] = React.useState(false);
  const styles = getStyles(theme); // dynamically generate styles based on theme
  userRankRef.current = React.useMemo(() => getUserRank(user?.totalMiles), [user?.totalMiles]);
  const [activeWild] = activeWilds;

  const handleTutorialClose = () => {
    setShowTutorial(false); // Close the tutorial modal
  };
  //this useEffect checks daily streak and resets if needed
  React.useEffect(() => {
    if (user) {
      checkDailyStreak(user);
    }
    //Check to see if user is new to the app by checking if theyve hiked any miles
    //if not, show the tutorial Modal
    // Check if the user has any miles hiked

    if (user?.totalMiles <= 0.0) {
      setShowTutorial(true); // Show the tutorial if the user has no miles hiked
    } else {
      setShowTutorial(false);
    }
  }, [user, userWilds]);
  //this useEffect gets the correct Rank based on  the users miles
  useFocusEffect(
    React.useCallback(() => {
      async function checkUnsyncedChanges() {
        const results = await hasUnsyncedChanges({
          database: watermelonDatabase,
        });
        return results;
      }
      if (!user) {
        return;
      }

      checkUnsyncedChanges().then(result => {
        if (result) {
          sync(watermelonDatabase, isConnected, user.id).catch(err =>
            handleError(err, "useCallback sync HomeScreen"),
          );
        }
      });

      return async () => {
        console.log("Home Screen was unfocused");
      };
    }, [user, watermelonDatabase, isConnected]),
  );
  return !user || !currentTrail ? (
    <View testID="homescreen-loading" style={styles.loadingContainer}>
      <Text style={styles.loadingText}>Loading Your Data...</Text>
    </View>
  ) : (
    <SafeAreaView testID="homescreen" style={styles.container}>
      {/* <SyncIndicator delay={3000} /> */}
      {showTutorial && <TutorialModal onClose={handleTutorialClose} />}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.statusRow}>
          <View style={styles.statPill}>
            <Text testID="trail-tokens" style={styles.statValue}>{user?.trailTokens}</Text>
            <Text style={styles.statLabel}>Tokens</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue} testID="daily-streak">{user?.dailyStreak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.syncStatus}>
            <Text style={[styles.onlineStatus, { color: isConnected ? "#2ecc71" : "#ff6b6b" }]}>
              {isConnected ? "Online" : "Offline"}
            </Text>
            <SyncButton />
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.wildColumn}>
            {activeWild ? (
              <>
                <XpRing
                  size={110}
                  xp={activeWild.xp}
                  xpToLevel={activeWild.xpToNext}
                  ringColor={"#00998aff"}>
                  <WildAvatar id={activeWild.wildId} pose={"wave"} size={92} animated={true} />
                </XpRing>
                <Text testID="current-wild" style={styles.wildInfo}>
                  Current Wild: {activeWild.wildId}
                </Text>
                <Text testID="wild-xp" style={styles.wildMeta}>
                  Wild XP: {activeWild.xp} / {activeWild.xpToNext}
                </Text>
              </>
            ) : (
              <Text style={styles.wildInfo}>No Active Wild</Text>
            )}
          </View>

          <View style={styles.trailColumn}>
            <Text style={styles.trailText}>Current Trail</Text>
            <Text testID="current-trail" style={styles.trailName}>{currentTrail.trailName}</Text>
            <DistanceProgressBar
              user={user}
              currentTrail={currentTrail}
              height={12}
              borderRadius={999}
              barColor={"#00998aff"}
            />
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.ctaButton}
              onPress={() => navigation.navigate("Timer")}>
              <Text style={styles.ctaText}>Start a Session</Text>
            </TouchableOpacity>
          </View>
        </View>

        <HomeScreenLinks user={user} navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
};

const enhance = withObservables(["user"], ({ user }) => ({
  user: user.observe(),
  currentTrail: user.trail.observe(),
  userSessions: user.usersSessions.observe(),
  userWilds: user.usersWilds.observe(),
  activeWilds: user.usersWilds.extend(Q.where("is_active", true), Q.take(1)).observe(),
}));

const EnhancedHomeScreen = enhance(HomeScreen);
export default EnhancedHomeScreen;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      padding: 12,
      paddingBottom: 36,
      gap: 12,
    },
    statusRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "stretch",
    },
    statPill: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 12,
      justifyContent: "center",
    },
    statValue: {
      color: theme.button,
      fontSize: 20,
      fontWeight: "800",
      lineHeight: 24,
    },
    statLabel: {
      color: theme.secondaryText,
      fontSize: 11,
      fontWeight: "600",
      marginTop: 2,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    syncStatus: {
      minWidth: 82,
      backgroundColor: theme.card,
      borderRadius: 14,
      paddingVertical: 8,
      paddingHorizontal: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    heroCard: {
      flexDirection: "row",
      gap: 14,
      padding: 14,
      borderRadius: 18,
      backgroundColor: theme.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
    wildColumn: {
      width: 122,
      alignItems: "center",
      justifyContent: "center",
    },
    trailColumn: {
      flex: 1,
      justifyContent: "center",
    },
    ctaButton: {
      backgroundColor: theme.progressBar,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "stretch",
      marginTop: 8,
      shadowColor: theme.progressBar,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.28,
      shadowRadius: 10,
      elevation: 4,
    },
    ctaText: {
      color: "#000",
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      color: theme.text,
      fontSize: 18,
    },
    dailyStreak: {
      fontSize: 13,
      color: theme.button, // accent color
      fontWeight: "600",
      textAlign: "center",
    },
    onlineStatus: {
      fontSize: 12,
      fontWeight: "600",
      marginBottom: 4,
    },
    username: {
      color: theme.text,
      fontSize: 12,
      fontWeight: "800",
      paddingHorizontal: 10,
    },
    carouselItem: {
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      marginVertical: 10,
      paddingRight: 20,
    },
    rankContainer: {
      position: "relative",
      borderRadius: 12,
      alignItems: "center",
      width: "100%",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    rankImage: {
      width: 256,
      height: "100%",
    },
    rankLevel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.button,
    },
    rankTitle: {
      fontSize: 10,
      fontWeight: "500",
      color: theme.secondaryText,
      marginBottom: 6,
    },
    trailText: {
      fontSize: 12,
      color: theme.secondaryText,
      fontWeight: "700",
      textAlign: "left",
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    trailName: {
      fontSize: 20,
      fontWeight: "800",
      color: theme.button,
      textAlign: "left",
      marginBottom: 8,
    },
    trailTokens: {
      fontSize: 13,
      fontWeight: "600",
      color: theme.button,
    },
    paginationDotsContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 8,
    },
    paginationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginHorizontal: 5,
      backgroundColor: "rgba(255,255,255,0.2)",
    },
    activePaginationDot: {
      backgroundColor: theme.button,
    },
    linkContainer: {
      marginTop: 10,
      backgroundColor: theme.background,
    },
    wildInfo: {
      color: theme.text,
      fontSize: 11,
      fontWeight: "700",
      marginTop: 6,
      textAlign: "center",
    },
    wildMeta: {
      color: theme.secondaryText,
      fontSize: 10,
      fontWeight: "600",
      marginTop: 2,
      textAlign: "center",
    },
  });
