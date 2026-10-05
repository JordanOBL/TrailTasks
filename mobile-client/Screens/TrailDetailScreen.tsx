import {
  Alert,
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { darkTheme, lightTheme } from "../theme";
import { useDatabase } from "@nozbe/watermelondb/react";
import { useFocusEffect } from "@react-navigation/native";

import BuyTrailModal from "../components/Trails/BuyTrailModal";
import FullTrailDetails from "../types/fullTrailDetails";
import { Q } from "@nozbe/watermelondb";
import { Trail } from "../watermelon/models";
import calculateEstimatedTime from "../helpers/calculateEstimatedTime";
import formatDateTime from "../helpers/formatDateTime";
import handleError from "../helpers/ErrorHandler";
import { useAuthContext } from "../services/AuthContext";
import { useTheme } from "../contexts/ThemeProvider";

type RouteParams = { fullTrail?: FullTrailDetails; trailId?: string };
interface Props {
  route: any;
  navigation: any;
}

const TrailDetailScreen = ({ route, navigation }: Props) => {
  const { params } = route as { params: RouteParams };
  const { fullTrail, trailId } = params ?? {};

  const db = useDatabase();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { user, isProMember } = useAuthContext();

  const [trail, setTrail] = useState<FullTrailDetails | null>(fullTrail ?? null);
  const [queuedTrails, setQueued] = useState<any[]>([]);
  const [purchasedTrails, setPurchasedTrails] = useState<any[]>([]);
  const [completedTrails, setCompletedTrails] = useState<any[]>([]);
  const [showReplaceTrailModal, setShowReplaceTrailModal] = useState(false);
  const [showBuyTrailModal, setShowBuyTrailModal] = useState(false);

  const isFreeTrail = !!trail?.is_free;
  const isSubscribersOnly = !!trail?.is_subscribers_only;
  const isQueued = useMemo(
    () => !!trail && queuedTrails.some(t => t.trailId === trail.id),
    [queuedTrails, trail],
  );
  const isPurchased = useMemo(
    () => !!trail && purchasedTrails.some(t => t.trailId === trail.id),
    [purchasedTrails, trail],
  );
  const isCompleted = useMemo(
    () => !!trail && completedTrails.some(t => t.trailId === trail.id),
    [completedTrails, trail],
  );
  const canUseTrail = isFreeTrail || isPurchased || (isSubscribersOnly && isProMember);
  const reward = useMemo(() => {
    const trailDistance = Number(trail?.trail_distance ?? 0);
    return trail?.trail_of_the_week
      ? Math.ceil(trailDistance) * 10
      : Math.max(5, Math.ceil(trailDistance * 3));
  }, [trail]);
  const status = useMemo(() => {
    if (user?.trailId === trail?.id) return { label: "Currently Hiking", tone: "active" as const };
    if (isCompleted) return { label: "Completed", tone: "success" as const };
    if (isQueued) return { label: "In Queue", tone: "queued" as const };
    if (isFreeTrail) return { label: "Free Trail", tone: "open" as const };
    if (isPurchased) return { label: "Purchased", tone: "open" as const };
    if (isSubscribersOnly && !isProMember) return { label: "Pro", tone: "locked" as const };
    if (isSubscribersOnly && isProMember)
      return { label: "Included with Pro", tone: "open" as const };
    return { label: "Unlock", tone: "locked" as const };
  }, [
    isCompleted,
    isFreeTrail,
    isProMember,
    isPurchased,
    isQueued,
    isSubscribersOnly,
    trail?.id,
    user?.trailId,
  ]);

  useEffect(() => {
    const relation = user?.usersQueuedTrails;
    if (!relation || typeof relation.observe !== "function") return;

    const subscription = relation.observe().subscribe(setQueued);
    return () => subscription.unsubscribe();
  }, [user]);

  useEffect(() => {
    const relation = user?.usersPurchasedTrails;
    if (!relation || typeof relation.observe !== "function") return;

    const subscription = relation.observe().subscribe(setPurchasedTrails);
    return () => subscription.unsubscribe();
  }, [user]);

  useEffect(() => {
    const relation = user?.usersCompletedTrails;
    if (!relation || typeof relation.observe !== "function") return;

    const subscription = relation.observe().subscribe(setCompletedTrails);
    return () => subscription.unsubscribe();
  }, [user]);

  const load = useCallback(async () => {
    try {
      if (!user) throw new Error("User not found");
      // If we have a trailId param, fetch that trail from DB
      // TrailId is present when user navigates from clicking trail under park page / logbook tab
      if (trailId) {
        const [rows, queued, bought, done] = await Promise.all([
          db
            .get<Trail>("trails")
            .query(
              Q.experimentalJoinTables(["parks"]),
              Q.experimentalNestedJoin("parks", "parks_states"),
              Q.unsafeSqlQuery(
                `SELECT trails.*,
                        parks.id AS park_id, parks.park_name, parks.park_type, parks.park_image_url,
                        park_states.id AS park_state_id, park_states.state_code, park_states.state,
                        COUNT(DISTINCT users_completed_trails.trail_id) AS is_completed,
                        COUNT(DISTINCT users_purchased_trails.trail_id) AS is_purchased,
                        users_parks.park_level
                 FROM trails
                 LEFT JOIN parks ON trails.park_id = parks.id
                 LEFT JOIN park_states ON parks.id = park_states.park_id
                 LEFT JOIN users_completed_trails
                        ON users_completed_trails.trail_id = trails.id AND users_completed_trails.user_id = ?
                 LEFT JOIN users_purchased_trails
                        ON users_purchased_trails.trail_id = trails.id AND users_purchased_trails.user_id = ?
                 LEFT JOIN users_parks
                        ON users_parks.park_id = parks.id AND users_parks.user_id = ?
                 WHERE trails.id = ?
                 GROUP BY trails.id`,
                [user.id, user.id, user.id, trailId],
              ),
            )
            .unsafeFetchRaw() as Promise<FullTrailDetails[]>,
          user.usersQueuedTrails,
          user.usersPurchasedTrails,
          user.usersCompletedTrails,
        ]);

        setTrail(rows[0] ?? null);
        setQueued(queued);
        setPurchasedTrails(bought);
        setCompletedTrails(done);
      } else if (trail) {
        // We already have a DTO from params fullTrail; just load the user-owned lists
        //full trail params is present when user navigates from trail explore tab
        const [queued, bought, done] = await Promise.all([
          user.usersQueuedTrails,
          user.usersPurchasedTrails,
          user.usersCompletedTrails,
        ]);
        setQueued(queued);
        setPurchasedTrails(bought);
        setCompletedTrails(done);
      }
    } catch (err) {
      handleError(err, "load TrailDetailScreen");
    }
  }, [db, trailId, trail?.id, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // If you still want to use SQL counts from the row, coerce them:
  // const isPurchased = !!Number(trail?.is_purchased);
  // const isCompleted = !!Number(trail?.is_completed);

  const getPurchaseButtonText = () => {
    if (user?.trailId === trail?.id) return "In Progress";
    if (canUseTrail) return "Start Now";
    if (isSubscribersOnly && !isProMember) return "Unlock With Subscription";
    return `Buy ${reward}`;
  };

  const handleReplaceTrail = async () => {
    try {
      if (!user) {
        throw new Error("User not found");
      }
      await user.updateUserTrail({
        trailId: trail?.id,
        trailStartedAt: formatDateTime(new Date()),
      });
      setShowReplaceTrailModal(false);
    } catch (err) {
      handleError(err, "handleReplaceTrail in TrailDetailScreen");
    }
  };

  const handleBuyTrail = () => setShowBuyTrailModal(true);

  if (!trail) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: theme.text }}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Modal transparent visible={showReplaceTrailModal}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Start New Trail</Text>
            <Text style={styles.modalText}>
              Are you sure you want to replace your current trail?
            </Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => setShowReplaceTrailModal(false)}>
                <Text style={styles.linkText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkButton} onPress={handleReplaceTrail}>
                <Text style={styles.linkText}>Start New</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <BuyTrailModal
        isVisible={showBuyTrailModal}
        onClose={() => {
          setShowBuyTrailModal(false);
          navigation.goBack();
        }}
        trail={trail}
        trailTokens={user?.trailTokens}
        onBuyTrail={async () => {
          await user?.purchaseTrail(trail, reward);
        }}
      />

      <View style={styles.detailCard}>
        <View style={styles.heroShell}>
          <Image
            style={styles.trailImage}
            source={
              trail?.trail_image_url
                ? { uri: trail.trail_image_url }
                : require("../assets/LOGO.png")
            }
          />
          <View style={styles.imageOverlay} />

          <View style={styles.topBadgeRow}>
            <View style={styles.badgesGroup}>
              <View style={[styles.statusPill, styles[`${status.tone}Pill`]]}>
                <Text style={[styles.statusPillText, styles[`${status.tone}PillText`]]}>
                  {status.label}
                </Text>
              </View>
              {trail.trail_of_the_week && (
                <View style={styles.featuredPill}>
                  <Text style={styles.featuredPillText}>★ This Week</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              accessibilityLabel="Close trail details"
              accessibilityRole="button"
              onPress={() => navigation.goBack()}
              style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.heroTitleBlock}>
            <Text style={styles.trailName}>{trail.trail_name}</Text>
            <Text style={styles.parkName}>
              {trail.park_name}
              {trail?.state_code ? `, ${trail.state_code}` : ""}
            </Text>
          </View>
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Distance</Text>
              <Text style={styles.statValue}>{trail.trail_distance} mi</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Time</Text>
              <Text style={styles.statValue}>
                {calculateEstimatedTime(Number(trail.trail_distance))}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Elevation</Text>
              <Text style={styles.statValue}>{trail.trail_elevation} ft</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Reward</Text>
              <Text style={styles.statValue}>{reward}</Text>
            </View>
          </View>

          <View style={styles.actionPanel}>
            <TouchableOpacity
              onPress={async () => {
                if (isQueued) {
                  const previousQueuedTrails = queuedTrails;
                  setQueued(currentQueuedTrails =>
                    currentQueuedTrails.filter(queuedTrail => queuedTrail.trailId !== trail.id),
                  );

                  try {
                    const result = (await user?.deleteFromQueuedTrails({
                      trailId: trail.id,
                    })) as unknown;
                    if (result === false) {
                      setQueued(previousQueuedTrails);
                      Alert.alert("Error", "Could not remove from queue. Please try again later.");
                    }
                  } catch (err) {
                    setQueued(previousQueuedTrails);
                    handleError(err, "deleteFromQueuedTrails in TrailDetailScreen");
                  }
                } else {
                  const previousQueuedTrails = queuedTrails;
                  setQueued(currentQueuedTrails => {
                    if (currentQueuedTrails.some(queuedTrail => queuedTrail.trailId === trail.id)) {
                      return currentQueuedTrails;
                    }

                    return [...currentQueuedTrails, { trailId: trail.id }];
                  });

                  try {
                    const result = await user?.addToQueuedTrails({ trailId: trail.id });
                    if (!result) {
                      setQueued(previousQueuedTrails);
                      Alert.alert("Error", "Could not add to queue. Please try again later.");
                    }
                  } catch (err) {
                    setQueued(previousQueuedTrails);
                    handleError(err, "addToQueuedTrails in TrailDetailScreen");
                  }
                }
              }}
              disabled={!isProMember || user?.trailId === trail.id || !canUseTrail}
              style={[
                styles.fullButton,
                styles.secondaryButton,
                (!isProMember || user?.trailId === trail.id || !canUseTrail) &&
                  styles.disabledButton,
                isQueued && styles.removeButton,
              ]}>
              <View style={styles.buttonContentRow}>
                <Text
                  style={[
                    styles.fullButtonText,
                    styles.secondaryButtonText,
                    (isQueued || !isProMember || user?.trailId === trail.id || !canUseTrail) &&
                      styles.fullButtonTextOnDark,
                  ]}>
                  {isQueued ? "Remove from Queue" : "Add to Queue"}
                </Text>
                {!isProMember && <ProBadge testID="add-to-queue-pro-badge" theme={theme} />}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={user?.trailId === trail.id}
              onPress={() => {
                if (canUseTrail) {
                  setShowReplaceTrailModal(true);
                  return;
                } else if (isSubscribersOnly && !isProMember) {
                  navigation.navigate("Basecamp", {
                    screen: "Subscribe",
                  });

                  return;
                } else {
                  handleBuyTrail();
                }
              }}
              style={[
                styles.fullButton,
                styles.primaryButton,
                user?.trailId === trail.id && styles.disabledButton,
              ]}>
              <Text style={styles.fullButtonText}>{getPurchaseButtonText()}</Text>
            </TouchableOpacity>
          </View>

          {(trail.nps_url || trail.all_trails_url || trail.hiking_project_url) && (
            <View style={styles.linksContainer}>
              <Text style={styles.sectionTitle}>Explore this trail</Text>
              {trail.nps_url && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => Linking.openURL(trail.nps_url!)}>
                  <Text style={styles.linkText}>NPS Website →</Text>
                </TouchableOpacity>
              )}
              {trail.all_trails_url && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => Linking.openURL(trail.all_trails_url!)}>
                  <Text style={styles.linkText}>AllTrails →</Text>
                </TouchableOpacity>
              )}
              {trail.hiking_project_url && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => Linking.openURL(trail.hiking_project_url!)}>
                  <Text style={styles.linkText}>Hiking Project →</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const ProBadge = ({
  testID,
  theme,
}: {
  testID: string;
  theme: typeof lightTheme | typeof darkTheme;
}) => {
  const styles = getStyles(theme);

  return (
    <View style={styles.proBadge} testID={testID}>
      <Text style={styles.proBadgeText}>Pro</Text>
    </View>
  );
};

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.exploreBackground ?? theme.background,
    },
    detailCard: {
      backgroundColor: theme.trailCardBackground ?? theme.card,
      borderColor: theme.border,
      borderRadius: 28,
      borderWidth: 1,
      margin: 18,
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.24,
      shadowRadius: 20,
      elevation: 7,
    },
    heroShell: {
      height: 300,
      justifyContent: "space-between",
      overflow: "hidden",
    },
    trailImage: {
      ...StyleSheet.absoluteFillObject,
      height: "100%",
      width: "100%",
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.36)",
    },
    topBadgeRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "space-between",
      padding: 16,
    },
    badgesGroup: {
      alignItems: "flex-start",
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingRight: 10,
    },
    closeButton: {
      alignItems: "center",
      backgroundColor: "rgba(18, 18, 18, 0.68)",
      borderColor: "rgba(255, 255, 255, 0.28)",
      borderRadius: 999,
      borderWidth: 1,
      height: 36,
      justifyContent: "center",
      width: 36,
    },
    closeButtonText: {
      color: "#ffffff",
      fontSize: 26,
      fontWeight: "700",
      lineHeight: 28,
    },
    statusPill: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    statusPillText: {
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
    activePill: {
      backgroundColor: theme.button,
    },
    activePillText: {
      color: theme.buttonText,
    },
    successPill: {
      backgroundColor: theme.completedBadge,
    },
    successPillText: {
      color: theme.completedBadgeText,
    },
    queuedPill: {
      backgroundColor: "rgba(255, 255, 255, 0.88)",
    },
    queuedPillText: {
      color: "#111111",
    },
    openPill: {
      backgroundColor: "rgba(19, 179, 172, 0.92)",
    },
    openPillText: {
      color: "#ffffff",
    },
    lockedPill: {
      backgroundColor: "rgba(18, 18, 18, 0.78)",
      borderColor: "rgba(255, 255, 255, 0.26)",
      borderWidth: 1,
    },
    lockedPillText: {
      color: "#ffffff",
    },
    featuredPill: {
      backgroundColor: "rgba(255, 204, 0, 0.92)",
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    featuredPillText: {
      color: "#121212",
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    heroTitleBlock: {
      padding: 18,
      paddingTop: 44,
    },
    trailName: {
      color: "#ffffff",
      fontSize: 30,
      fontWeight: "900",
      letterSpacing: -0.4,
      lineHeight: 34,
      textShadowColor: "rgba(0, 0, 0, 0.5)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 9,
    },
    parkName: {
      color: "rgba(255, 255, 255, 0.88)",
      fontSize: 15,
      fontWeight: "800",
      marginTop: 6,
    },
    infoContainer: {
      backgroundColor: theme.trailCardOverlay ?? theme.card,
      padding: 16,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    statBox: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 18,
      borderWidth: 1,
      flexGrow: 1,
      minWidth: "46%",
      paddingHorizontal: 14,
      paddingVertical: 13,
    },
    statLabel: {
      color: theme.secondaryText,
      fontSize: 11,
      fontWeight: "800",
      marginBottom: 5,
      textTransform: "uppercase",
    },
    statValue: {
      color: theme.trailCardText ?? theme.text,
      fontSize: 16,
      fontWeight: "900",
    },
    buttonGroup: { marginTop: 20, gap: 10 },
    actionPanel: {
      gap: 11,
      marginTop: 18,
    },
    fullButton: {
      alignItems: "center",
      borderRadius: 18,
      paddingVertical: 15,
    },
    primaryButton: {
      backgroundColor: theme.button,
    },
    secondaryButton: {
      backgroundColor: theme.card,
      borderColor: theme.button,
      borderWidth: 1,
    },
    disabledButton: {
      backgroundColor: "#6f7478",
      borderColor: "#6f7478",
    },
    removeButton: {
      backgroundColor: "#c62828",
      borderColor: "#c62828",
    },
    buttonContentRow: {
      alignItems: "center",
      flexDirection: "row",
      gap: 8,
      justifyContent: "center",
    },
    fullButtonText: {
      color: theme.buttonText,
      fontSize: 16,
      fontWeight: "900",
    },
    secondaryButtonText: {
      color: theme.button,
    },
    fullButtonTextOnDark: {
      color: "#ffffff",
    },
    proBadge: {
      backgroundColor: theme.button,
      borderRadius: 999,
      paddingHorizontal: 7,
      paddingVertical: 2,
    },
    proBadgeText: {
      color: theme.buttonText,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.4,
      textTransform: "uppercase",
    },
    modalBackground: {
      alignItems: "center",
      backgroundColor: theme.modalBackground ?? "#000000aa",
      flex: 1,
      justifyContent: "center",
    },
    modalContainer: {
      backgroundColor: theme.modalCard ?? theme.card,
      borderColor: theme.border,
      borderRadius: 18,
      borderWidth: 1,
      padding: 20,
      width: "85%",
    },
    modalTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "900",
      marginBottom: 10,
      textAlign: "center",
    },
    modalText: {
      color: theme.secondaryText,
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 20,
      textAlign: "center",
    },
    linksContainer: {
      borderTopColor: theme.border,
      borderTopWidth: 1,
      marginTop: 20,
      paddingTop: 16,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "900",
      marginBottom: 10,
    },
    linkButton: {
      alignItems: "center",
      backgroundColor: theme.linkBackground ?? theme.card,
      borderColor: theme.linkBorder ?? theme.border,
      borderRadius: 14,
      borderWidth: 1,
      marginBottom: 9,
      padding: 12,
    },
    linkText: {
      color: theme.linkText ?? theme.text,
      fontWeight: "800",
    },
  });

export default TrailDetailScreen;
