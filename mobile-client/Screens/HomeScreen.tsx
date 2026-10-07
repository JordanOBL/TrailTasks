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
/* eslint-disable react-native/no-inline-styles */
import React from "react";
import SyncButton from "../components/syncButton";
import TutorialModal from "../components/HomeScreen/tutorialModal";
import WildAvatar from "../components/Wilds/WildAvatar";
import XpRing from "../components/HomeScreen/XpRing";
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
  userSessions?: any[];
  tokenTransactions?: any[];
  userWilds: any;
  activeWilds: User_Wild[];
}

export const HomeScreen: React.FC<Props> = ({
  user,
  navigation,
  currentTrail,
  userSessions,
  tokenTransactions,
  userWilds,
  activeWilds,
}) => {
  const watermelonDatabase = useDatabase();
  const { theme } = useTheme();

  const { isConnected } = useInternetConnection();
  const [showTutorial, setShowTutorial] = React.useState(false);
  const [featuredTrail, setFeaturedTrail] = React.useState<FullTrailDetails | null>(null);
  const [totalMiles, setTotalMiles] = React.useState<number | null>(null);
  const [tokenBalance, setTokenBalance] = React.useState<number>(0);
  const styles = getStyles(theme); // dynamically generate styles based on theme
  const [activeWild] = activeWilds;
  const { width: windowWidth } = useWindowDimensions();
  const progressBarWidth = Math.max(220, windowWidth - 56);
  const totalMilesLabel = totalMiles === null ? "0.0" : totalMiles.toFixed(1);
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
  React.useEffect(() => {
    let isMounted = true;

    async function loadDerivedTotalMiles() {
      try {
        if (!user?.calculateTotalMiles) {
          setTotalMiles(null);
          return;
        }

        const calculatedTotalMiles = await user.calculateTotalMiles();
        if (isMounted) {
          setTotalMiles(Number(calculatedTotalMiles) || 0);
        }
      } catch (err) {
        handleError(err, "loadDerivedTotalMiles HomeScreen");
      }
    }

    loadDerivedTotalMiles();

    return () => {
      isMounted = false;
    };
  }, [user, userSessions]);

  React.useEffect(() => {
    let isMounted = true;

    async function loadTokenBalance() {
      try {
        if (!user?.calculateTrailTokenBalance) {
          setTokenBalance(0);
          return;
        }

        const calculatedTokenBalance = await user.calculateTrailTokenBalance();
        if (isMounted) {
          setTokenBalance(Number(calculatedTokenBalance) || 0);
        }
      } catch (err) {
        handleError(err, "loadTokenBalance HomeScreen");
      }
    }

    loadTokenBalance();

    return () => {
      isMounted = false;
    };
  }, [user, tokenTransactions]);

  // Show the tutorial modal for new users with no derived completed-session miles.
  React.useEffect(() => {
    if (totalMiles === null) {
      return;
    }

    setShowTutorial(totalMiles <= 0.0);
  }, [totalMiles]);

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
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.sectionEyebrow}>Today</Text>
              <Text style={styles.heroTitle}>Ready for a focused hike?</Text>
            </View>
            <View style={styles.syncStatus}>
              <Text style={[styles.onlineStatus, { color: isConnected ? "#2ecc71" : "#ff6b6b" }]}>
                {isConnected ? "Online" : "Offline"}
              </Text>
              {/* <SyncButton /> */}
            </View>
          </View>

          <View style={styles.statusRow}>
            <View style={styles.statPill}>
              <Text testID="trail-tokens" style={styles.statValue}>
                {tokenBalance}
              </Text>
              <Text style={styles.statLabel}>Tokens</Text>
            </View>
            <View style={styles.statPill}>
              <Text style={styles.statValue} testID="daily-streak">
                {user?.dailyStreak}
              </Text>
              <Text style={styles.statLabel}>Day streak</Text>
            </View>
            <View style={styles.statPill}>
              <Text testID="total-miles" style={styles.statValue}>
                {totalMilesLabel}
              </Text>
              <Text style={styles.statLabel}>Miles</Text>
            </View>
          </View>
        </View>

        <View style={styles.trailCard}>
          <Text style={styles.sectionEyebrow}>Current Trail</Text>
          <Text testID="current-trail" style={styles.trailName} numberOfLines={2}>
            {currentTrail.trailName}
          </Text>
          <View style={styles.progressHeaderRow}>
            <Text style={styles.trailPercent}>{trailPercent.toFixed(0)}% complete</Text>
            <Text style={styles.trailDistanceMeta}>
              {trailProgress.toFixed(2)} / {trailDistance.toFixed(2)} mi
            </Text>
          </View>
          <DistanceProgressBar
            user={user}
            currentTrail={currentTrail}
            height={10}
            borderRadius={999}
            barColor={"#00998aff"}
            width={progressBarWidth}
          />

          <View style={styles.sessionRow}>
            {activeWild ? (
              <View style={styles.wildInlineCard}>
                <XpRing size={60} xp={activeWild.xp} xpToLevel={activeWild.xpToNext} ringColor={"#00998aff"}>
                  <WildAvatar id={activeWild.wildId} pose={"wave"} size={46} animated={true} />
                </XpRing>
                <View style={styles.wildInlineCopy}>
                  <Text testID="current-wild" style={styles.wildInfo} numberOfLines={1}>
                    {activeWild.wildId}
                  </Text>
                  <Text testID="wild-xp" style={styles.wildMeta}>
                    {activeWild.xp} / {activeWild.xpToNext} XP
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.wildInlineCard}>
                <View style={styles.emptyWildAvatar} />
                <View style={styles.wildInlineCopy}>
                  <Text style={styles.wildInfo}>No Active Wild</Text>
                  <Text style={styles.wildMeta}>Choose a companion.</Text>
                </View>
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.ctaButton}
              onPress={() => navigation.navigate("Timer")}>
              <Text style={styles.ctaText}>Start</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          disabled={!featuredTrail}
          onPress={openFeaturedTrail}
          style={[styles.weeklyTrailCard, !featuredTrail && styles.disabledWeeklyTrailCard]}
          testID="featured-trail-card">
          <View style={styles.weeklyCopy}>
            <Text style={styles.sectionEyebrow}>Featured Trail</Text>
            <Text style={styles.weeklyTitle} numberOfLines={1}>
              {featuredTrail?.trail_name ?? "Featured trail loading"}
            </Text>
            <Text style={styles.weeklyDescription} numberOfLines={1}>
              {featuredTrailDescription}
            </Text>
          </View>
          <Text style={styles.weeklyCta}>{featuredTrail ? "View →" : "Sync"}</Text>
        </TouchableOpacity>

        <HomeScreenLinks user={user} navigation={navigation} />
      </ScrollView>
    </SafeAreaView>
  );
};

const enhance = withObservables(["user"], ({ user }) => ({
  user: user.observe(),
  currentTrail: user.trail.observe(),
  userSessions: user.usersSessions.observe(),
  tokenTransactions: user.tokenTransactions.observe(),
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
      padding: 14,
      paddingBottom: 32,
      gap: 12,
    },
    heroCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 20,
      borderWidth: 1,
      padding: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 2,
    },
    heroTopRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: 12,
      justifyContent: "space-between",
      marginBottom: 14,
    },
    heroCopy: {
      flex: 1,
      minWidth: 0,
    },
    heroTitle: {
      color: theme.text,
      fontSize: 24,
      fontWeight: "900",
      letterSpacing: -0.3,
      lineHeight: 29,
    },
    statusRow: {
      flexDirection: "row",
      gap: 8,
      alignItems: "stretch",
    },
    statPill: {
      flex: 1,
      backgroundColor: theme.background,
      borderColor: theme.border,
      borderRadius: 14,
      borderWidth: 1,
      paddingHorizontal: 11,
      paddingVertical: 9,
      justifyContent: "center",
    },
    statValue: {
      color: theme.button,
      fontSize: 18,
      fontWeight: "900",
      lineHeight: 22,
    },
    statLabel: {
      color: theme.secondaryText,
      fontSize: 10,
      fontWeight: "800",
      letterSpacing: 0.4,
      marginTop: 2,
      textTransform: "uppercase",
    },
    syncStatus: {
      alignItems: "center",
      backgroundColor: theme.background,
      borderColor: theme.border,
      borderRadius: 999,
      borderWidth: 1,
      justifyContent: "center",
      minWidth: 74,
      paddingHorizontal: 10,
      paddingVertical: 7,
    },
    trailCard: {
      padding: 16,
      borderRadius: 20,
      borderColor: theme.border,
      borderWidth: 1,
      backgroundColor: theme.card,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 2,
    },
    sectionEyebrow: {
      fontSize: 11,
      color: theme.secondaryText,
      fontWeight: "900",
      textAlign: "left",
      marginBottom: 5,
      textTransform: "uppercase",
      letterSpacing: 0.65,
    },
    progressHeaderRow: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 8,
      marginTop: 8,
    },
    trailPercent: {
      color: theme.secondaryText,
      fontSize: 13,
      fontWeight: "800",
    },
    trailDistanceMeta: {
      color: theme.secondaryText,
      fontSize: 12,
      fontWeight: "700",
    },
    sessionRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 10,
      marginTop: 14,
    },
    wildInlineCard: {
      alignItems: "center",
      backgroundColor: theme.background,
      borderColor: theme.border,
      borderRadius: 16,
      borderWidth: 1,
      flex: 1,
      flexDirection: "row",
      gap: 10,
      minHeight: 72,
      padding: 8,
    },
    wildInlineCopy: {
      flex: 1,
      minWidth: 0,
    },
    emptyWildAvatar: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 999,
      borderWidth: 1,
      height: 48,
      width: 48,
    },
    ctaButton: {
      backgroundColor: theme.progressBar,
      paddingVertical: 16,
      paddingHorizontal: 22,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 94,
      shadowColor: theme.progressBar,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 3,
    },
    ctaText: {
      color: "#000",
      fontSize: 16,
      fontWeight: "900",
      letterSpacing: 0.3,
    },
    weeklyTrailCard: {
      flexDirection: "row",
      gap: 12,
      padding: 14,
      borderRadius: 18,
      borderColor: theme.border,
      borderWidth: 1,
      backgroundColor: theme.card,
      alignItems: "center",
    },
    disabledWeeklyTrailCard: {
      opacity: 0.72,
    },
    weeklyCopy: {
      flex: 1,
      minWidth: 0,
    },
    weeklyTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "900",
      marginBottom: 3,
    },
    weeklyDescription: {
      color: theme.secondaryText,
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 17,
    },
    weeklyCta: {
      color: theme.button,
      fontSize: 13,
      fontWeight: "900",
      marginLeft: 6,
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
