import {
  Alert,
  Image,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useMemo, useState } from "react";
import { darkTheme, lightTheme } from "../theme";
import { useDatabase, withObservables } from "@nozbe/watermelondb/react";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";

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

const TrailDetailScreen = ({route, navigation}:Props) => {
  const { params } = route as { params: RouteParams };
  const { fullTrail, trailId } = params ?? {};

  const db = useDatabase();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { user, isProMember } = useAuthContext();

  const [trail, setTrail] = useState< FullTrailDetails | null>(fullTrail ?? null);
  const [queuedTrails, setQueued] = useState<any[]>([]);
  const [purchasedTrails, setPurchasedTrails] = useState<any[]>([]);
  const [completedTrails, setCompletedTrails] = useState<any[]>([]);
  const [showReplaceTrailModal, setShowReplaceTrailModal] = useState(false);
  const [showBuyTrailModal, setShowBuyTrailModal] = useState(false);

  const isFreeTrail = !!trail?.is_free;
  const isSubscribersOnly = !!trail?.is_subscribers_only;  
  const isQueued = useMemo(
    () => !!trail && queuedTrails.some(t => t.trailId === trail.id),
    [queuedTrails, trail]
  );
  const isPurchased = useMemo(
    () => !!trail && purchasedTrails.some(t => t.trailId === trail.id),
    [purchasedTrails, trail]
  );
  const isCompleted = useMemo(
    () => !!trail && completedTrails.some(t => t.trailId === trail.id),
    [completedTrails, trail]
  );
  const reward = useMemo(() => {
    const trailDistance = Number(trail?.trail_distance ?? 0);
    return trail?.trail_of_the_week
      ? Math.ceil(trailDistance) * 10
      : Math.max(5, Math.ceil(trailDistance * 3));
  }, [trail]);


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
                [user.id, user.id, user.id, trailId]
              )
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

  useFocusEffect(useCallback(() => { load(); }, [load]));


  // If you still want to use SQL counts from the row, coerce them:
  // const isPurchased = !!Number(trail?.is_purchased);
  // const isCompleted = !!Number(trail?.is_completed);


  const getPurchaseButtonText = () => {
    if (user?.trailId === trail?.id) return "In Progress";
    if (isFreeTrail || isPurchased) return "Start Now";
    if (isSubscribersOnly && !isProMember) return "Unlock With Subscription";
    return `Buy ${reward}`;
  };

  const handleReplaceTrail = async () => {
    try {
      if (!user) {
        throw new Error("User not found");
      }
      await user.updateUserTrail({
        trailId: trail?.id ,
        trailStartedAt: formatDateTime(new Date()),
      });
      setShowReplaceTrailModal(false);
    } catch (err) {
      handleError(err, "handleReplaceTrail in TrailDetailScreen");
    }
  }

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
                  onPress={() => setShowReplaceTrailModal(false)}
                >
                  <Text style={styles.fullButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.linkButton} onPress={handleReplaceTrail}>
                  <Text style={styles.fullButtonText}>Start New</Text>
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

        <Image
          style={styles.trailImage}
          source={
            trail?.trail_image_url ? { uri: trail.trail_image_url } : require("../assets/LOGO.png")
          }
        />

        <View style={styles.infoContainer}>
          <Text style={styles.trailName}>{trail.trail_name}</Text>
          <Text style={styles.parkName}>
            {trail.park_name}, {trail?.state_code}
          </Text>
          <Text style={styles.statusText}>{isCompleted ? "✅ Completed" : "Not Completed"}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{trail.trail_distance} mi</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{trail.trail_elevation} ft</Text>
              <Text style={styles.statLabel}>Elevation</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{calculateEstimatedTime(trail.trail_distance)}</Text>
              <Text style={styles.statLabel}>Est. Time</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{reward}</Text>
              <Text style={styles.statLabel}>Reward</Text>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              onPress={async () => {
                if (isQueued) {
                  const result = await user?.deleteFromQueuedTrails({ trailId: trail.id });
                  if (!result) {
                    Alert.alert("Error", "Could not remove from queue. Please try again later.");
                  }
                } else {
                  const result = await user?.addToQueuedTrails({ trailId: trail.id });
                  if (!result) {
                    Alert.alert("Error", "Could not add to queue. Please try again later.");
                  }
                }
              }}
              disabled={
                !isProMember || user?.trailId === trail.id || (!isPurchased && !isFreeTrail)
              }
              style={[
                styles.fullButton,
                {
                  backgroundColor: isQueued
                    ? "red"
                    : !isProMember || (!isPurchased && !isFreeTrail)
                    ? "gray"
                    : "green",
                },
              ]}
            >
              <Text style={styles.fullButtonText}>
                {isQueued ? "Remove from Queue" : "Add to Queue"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={user?.trailId === trail.id}
              onPress={() => {
                if (isFreeTrail || isPurchased) {
                  setShowReplaceTrailModal(true);
                  return;
                } 
                else if (isSubscribersOnly && !isProMember) {
                  navigation.navigate("Basecamp", {
                    screen: "Subscribe",
                    
                  })

                  return;
                } else {
                  handleBuyTrail();
                }
              }}
              style={[
                styles.fullButton,
                {
                  backgroundColor:
                    user?.trailId == trail.id
                      ? "gray"
                      : isProMember || isFreeTrail || isPurchased || !isSubscribersOnly
                      ? "#2196F3"
                      : "gray",
                },
              ]}
            >
              <Text style={styles.fullButtonText}>{getPurchaseButtonText()}</Text>
            </TouchableOpacity>
          </View>

          {(trail.nps_url || trail.all_trails_url || trail.hiking_project_url) && (
            <View style={styles.linksContainer}>
              <Text style={styles.sectionTitle}>🌐 Explore This Trail</Text>
              {trail.nps_url && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => Linking.openURL(trail.nps_url!)}
                >
                  <Text style={styles.linkText}>NPS Website</Text>
                </TouchableOpacity>
              )}
              {trail.all_trails_url && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => Linking.openURL(trail.all_trails_url!)}
                >
                  <Text style={styles.linkText}>AllTrails</Text>
                </TouchableOpacity>
              )}
              {trail.hiking_project_url && (
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => Linking.openURL(trail.hiking_project_url!)}
                >
                  <Text style={styles.linkText}>Hiking Project</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    );
  };


const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    trailImage: { width: "100%", height: 240 },
    infoContainer: { padding: 20 },
    trailName: { fontSize: 24, fontWeight: "bold", color: theme.trailHeaderText },
    parkName: { fontSize: 16, fontWeight: "500", color: theme.parkNameText },
    statusText: { fontSize: 12, color: "gray", marginVertical: 4 },
    statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
    statBox: {
      width: "48%",
      backgroundColor: theme.card,
      padding: 10,
      borderRadius: 10,
      marginBottom: 12,
    },
    statValue: { fontSize: 18, fontWeight: "bold", color: theme.text, textAlign: "center" },
    statLabel: { fontSize: 12, color: theme.secondaryText, textAlign: "center" },
    buttonGroup: { marginTop: 20, gap: 10 },
    fullButton: { borderRadius: 14, paddingVertical: 14, alignItems: "center" },
    fullButtonText: { color: theme.buttonText, fontSize: 16, fontWeight: "600" },
    modalBackground: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000000aa",
    },
    modalContainer: { backgroundColor: "#fff", padding: 20, borderRadius: 12, width: "85%" },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
    modalText: { fontSize: 14, marginBottom: 20, textAlign: "center" },
    linksContainer: { marginTop: 30 },
    sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: 10, color: theme.text },
    linkButton: {
      backgroundColor: theme.button,
      padding: 10,
      borderRadius: 10,
      marginBottom: 8,
      alignItems: "center",
    },
    linkText: { color: theme.buttonText, fontWeight: "500" },
  });

export default TrailDetailScreen
