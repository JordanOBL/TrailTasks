import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { Trail, User, User_Wild } from "../watermelon/models";
import { darkTheme, lightTheme } from "../theme";

import DistanceProgressBar from "../components/DistanceProgressBar";
import FullTrailDetails from "../types/fullTrailDetails";
import HomeScreenLinks from "../components/HomeScreen/HomeScreenLinks";
import { Q } from "@nozbe/watermelondb";
import { Rank } from "../helpers/Ranks/ranksData";
/* eslint-disable react-native/no-inline-styles */
import React from "react";
import SyncButton from "../components/syncButton";
import TutorialModal from "../components/HomeScreen/tutorialModal";
import WildAvatar from "../components/Wilds/WildAvatar";
import XpRing from "../components/HomeScreen/XpRing";
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
  const [featuredTrail, setFeaturedTrail] = React.useState<FullTrailDetails | null>(null);
  const styles = getStyles(theme); // dynamically generate styles based on theme
  userRankRef.current = React.useMemo(() => getUserRank(user?.totalMiles), [user?.totalMiles]);
  const [activeWild] = activeWilds;
  const { width: windowWidth } = useWindowDimensions();
  const progressBarWidth = Math.max(220, windowWidth - 56);
  const trailProgress = Number(user?.trailProgress ?? 0);
  const trailDistance = Number(currentTrail?.trailDistance ?? 0);
  const trailPercent =
    trailDistance > 0 ? Math.min(100, Math.max(0, (trailProgress / trailDistance) * 100)) : 0;
  const featuredTrailDescription = featuredTrail
    ? `${featuredTrail.park_name}${
        featuredTrail.state_code ? `, ${featuredTrail.state_code}` : ""
      } • ${featuredTrail.trail_distance} mi`
    : "Sync to load this month's featured bonus trail.";

  const openFeaturedTrail = React.useCallback(() => {
    if (!featuredTrail) return;
    navigation.navigate("TrailDetails", { fullTrail: featuredTrail, trailId: null });
  }, [featuredTrail, navigation]);

  const handleTutorialClose = () => {
    setShowTutorial(false); // Close the tutorial modal
  };
  // Show the tutorial modal for new users with no recorded miles.
  React.useEffect(() => {
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
      async function loadFeaturedTrail() {
        try {
          if (!user) return;
          const rows = (await watermelonDatabase
            .get<Trail>("trails")
            .query(
              Q.experimentalJoinTables(["parks"]),
              Q.experimentalNestedJoin("parks", "parks_states"),
              Q.unsafeSqlQuery(
                "SELECT trails.*, " +
                  "parks.id AS park_id, parks.park_name, parks.park_type, parks.park_image_url, " +
                  "park_states.id AS park_state_id, park_states.state_code, park_states.state, " +
                  "COUNT(DISTINCT users_completed_trails.trail_id) AS is_completed, " +
                  "COUNT(DISTINCT users_purchased_trails.trail_id) AS is_purchased, " +
                  "users_parks.park_level " +
                  "FROM trails " +
                  "LEFT JOIN parks ON trails.park_id = parks.id " +
                  "LEFT JOIN park_states ON parks.id = park_states.park_id " +
                  "LEFT JOIN users_completed_trails ON users_completed_trails.trail_id = trails.id AND users_completed_trails.user_id = ? " +
                  "LEFT JOIN users_purchased_trails ON users_purchased_trails.trail_id = trails.id AND users_purchased_trails.user_id = ? " +
                  "LEFT JOIN users_parks ON users_parks.park_id = parks.id AND users_parks.user_id = ? " +
                  "WHERE trails.trail_of_the_week = true " +
                  "GROUP BY trails.id " +
                  "LIMIT 1",
                [user.id, user.id, user.id],
              ),
            )
            .unsafeFetchRaw()) as FullTrailDetails[];
          setFeaturedTrail(rows[0] ?? null);
        } catch (err) {
          handleError(err, "loadFeaturedTrail HomeScreen");
        }
      }

      loadFeaturedTrail();
    }, [user, watermelonDatabase]),
  );

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
          sync(watermelonDatabase, isConnected, user.id, {
            coalesceKey: `account:${user.id}`,
          }).catch(err => handleError(err, "useCallback sync HomeScreen"));
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
            <Text testID="trail-tokens" style={styles.statValue}>
              {user?.trailTokens}
            </Text>
            <Text style={styles.statLabel}>Tokens</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue} testID="daily-streak">
              {user?.dailyStreak}
            </Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.syncStatus}>
            <Text style={[styles.onlineStatus, { color: isConnected ? "#2ecc71" : "#ff6b6b" }]}>
              {isConnected ? "Online" : "Offline"}
            </Text>
            {/* <SyncButton /> */}
          </View>
        </View>

        <View style={styles.dashboardRow}>
          <View style={styles.wildCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionEyebrow}>Active Wild</Text>
            </View>
            {activeWild ? (
              <>
                <XpRing
                  size={112}
                  xp={activeWild.xp}
                  xpToLevel={activeWild.xpToNext}
                  ringColor={"#00998aff"}>
                  <WildAvatar id={activeWild.wildId} pose={"wave"} size={92} animated={true} />
                </XpRing>
                <Text testID="current-wild" style={styles.wildInfo} numberOfLines={1}>
                  Current Wild: {activeWild.wildId}
                </Text>
                <Text testID="wild-xp" style={styles.wildMeta}>
                  Wild XP: {activeWild.xp} / {activeWild.xpToNext}
                </Text>
              </>
            ) : (
              <View style={styles.emptyWildState}>
                <Text style={styles.wildInfo}>No Active Wild</Text>
                <Text style={styles.wildMeta}>Choose a companion to earn XP.</Text>
              </View>
            )}
          </View>

          <View style={styles.trailCard}>
            <Text style={styles.sectionEyebrow}>Current Trail</Text>
            <Text testID="current-trail" style={styles.trailName} numberOfLines={2}>
              {currentTrail.trailName}
            </Text>
            <Text style={styles.trailPercent}>{trailPercent.toFixed(0)}% complete</Text>
            <DistanceProgressBar
              user={user}
              currentTrail={currentTrail}
              height={12}
              borderRadius={999}
              barColor={"#00998aff"}
              width={progressBarWidth}
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

        <TouchableOpacity
          activeOpacity={0.88}
          disabled={!featuredTrail}
          onPress={openFeaturedTrail}
          style={[styles.weeklyTrailCard, !featuredTrail && styles.disabledWeeklyTrailCard]}
          testID="featured-trail-card">
          <View style={styles.weeklyCopy}>
            <Text style={styles.sectionEyebrow}>Featured Trail</Text>
            <Text style={styles.weeklyTitle} numberOfLines={2}>
              {featuredTrail?.trail_name ?? "Featured trail loading"}
            </Text>
            <Text style={styles.weeklyDescription}>{featuredTrailDescription}</Text>
            {featuredTrail && <Text style={styles.weeklyCta}>Tap to queue, buy, or start →</Text>}
          </View>
          <View style={styles.bonusBadge}>
            <Text style={styles.bonusValue}>★</Text>
            <Text style={styles.bonusLabel}>Bonus</Text>
          </View>
        </TouchableOpacity>
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
    dashboardRow: {
      gap: 12,
    },
    wildCard: {
      minHeight: 176,
      padding: 16,
      borderRadius: 18,
      backgroundColor: theme.card,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
    trailCard: {
      padding: 16,
      borderRadius: 18,
      backgroundColor: theme.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
    cardHeaderRow: {
      alignSelf: "stretch",
      alignItems: "flex-start",
      marginBottom: 6,
    },
    emptyWildState: {
      minHeight: 112,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionEyebrow: {
      fontSize: 12,
      color: theme.secondaryText,
      fontWeight: "700",
      textAlign: "left",
      marginBottom: 4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    trailPercent: {
      color: theme.secondaryText,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 8,
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
    weeklyTrailCard: {
      flexDirection: "row",
      gap: 14,
      padding: 16,
      borderRadius: 18,
      backgroundColor: theme.card,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
    disabledWeeklyTrailCard: {
      opacity: 0.72,
    },
    weeklyCopy: {
      flex: 1,
    },
    weeklyTitle: {
      color: theme.button,
      fontSize: 19,
      fontWeight: "800",
      marginBottom: 6,
    },
    weeklyDescription: {
      color: theme.secondaryText,
      fontSize: 13,
      fontWeight: "500",
      lineHeight: 18,
    },
    weeklyCta: {
      color: theme.button,
      fontSize: 12,
      fontWeight: "800",
      marginTop: 8,
    },
    bonusBadge: {
      width: 74,
      height: 74,
      borderRadius: 37,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: theme.progressBar,
    },
    bonusValue: {
      color: "gold",
      fontSize: 22,
      fontWeight: "900",
      lineHeight: 26,
    },
    bonusLabel: {
      color: "gold",
      fontSize: 10,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.3,
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
