import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Park,
  Trail,
  User_Completed_Trail,
  User_Park,
  User_Purchased_Trail,
  User_Wild,
  Wild,
} from "../../watermelon/models";
import React, { useCallback, useMemo, useState } from "react";
import { darkTheme, lightTheme } from "../../theme";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";

import { Q } from "@nozbe/watermelondb";
import WildAvatar from "../Wilds/WildAvatar";
import { useAuthContext } from "../../services/AuthContext";
import { useDatabase } from "@nozbe/watermelondb/react";
import { useTheme } from "../../contexts/ThemeProvider";

type RouteParams = { parkId: string; wildId?: string };

const ParkDetails = () => {
  const { params } = useRoute<any>() as { params: RouteParams };
  const navigation = useNavigation<any>();
  const { parkId, wildId } = params;

  const { user } = useAuthContext();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const db = useDatabase();

  const [park, setPark] = useState<Park | null>(null);
  const [wild, setWild] = useState<Wild | null>(null);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [purchasedTrails, setPurchasedTrails] = useState<User_Purchased_Trail[]>([]);
  const [completedTrails, setCompletedTrails] = useState<User_Completed_Trail[]>([]);
  const [userParks, setUserParks] = useState<User_Park[]>([]);
  const [userWild, setUserWild] = useState<User_Wild | null>(null);

  const load = useCallback(async () => {
    // Fetch in parallel; relations use .query().fetch()
    if (!user) return;
    try {
      const [p, w, t, pt, ct, up, [uw]] = await Promise.all([
        db.get<Park>("parks").find(parkId),
        wildId ? db.get<Wild>("wilds").find(wildId) : Promise.resolve(null),
        db.get<Trail>("trails").query(Q.where("park_id", parkId)).fetch(),
        user.usersPurchasedTrails,
        user.usersCompletedTrails,
        user.usersParks,
        user.usersWilds
          .extend(Q.and(Q.where("user_id", user.id), Q.where("wild_id", wildId || "")))
          .fetch(),
      ]);
      setPark(p);
      setWild(w);
      setTrails(t);
      setPurchasedTrails(pt);
      setCompletedTrails(ct);
      setUserParks(up);
      setUserWild(uw || null);
      console.log("Loaded park details:", { p, w, t, pt, ct, up, uw });
    } catch (error) {
      console.error("Error loading park details:", error);
    }
  }, [db, parkId, wildId, user]);

  // Fetch when the screen is focused (and on return)
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // Quick lookups
  const purchasedIds = useMemo(
    () => new Set(purchasedTrails.map(pt => pt.trailId)),
    [purchasedTrails],
  );
  const completedIds = useMemo(
    () => new Set(completedTrails.map(ct => ct.trailId)),
    [completedTrails],
  );

  const totalTrails = trails.length;
  const completedCount = useMemo(
    () => trails.filter(t => completedIds.has(t.id)).length,
    [trails, completedIds],
  );
  const purchasedCount = useMemo(
    () => trails.filter(t => purchasedIds.has(t.id)).length,
    [trails, purchasedIds],
  );
  const completionPct = totalTrails ? Math.round((completedCount / totalTrails) * 100) : 0;

  const wildPose = useMemo(() => {
    if (!wild) return theme.themeName === "darkTheme" ? "hidden_dark" : "hidden_light";
    const hasThisPark = userParks.some(up => up.parkId === parkId);
    return hasThisPark ? "still" : theme.themeName === "darkTheme" ? "hidden_dark" : "hidden_light";
  }, [wild, userParks, parkId, theme.themeName]);

  const onPressTrail = useCallback((trail: Trail) => {
    // navigate to trail detail by id; no models in params
    navigation.navigate("Explore", {
      screen: "TrailDetails",
      params: { fullTrail: null, trailId: trail.id },
    });
  }, []);

  if (!park) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: theme.text }}>Loading park…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header / Park Info */}
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.parkName}>{park.parkName}</Text>
            <View style={styles.tagRow}>
              {park.parkType ? <Tag theme={theme} label={park.parkType} /> : null}
              {park.climate ? <Tag theme={theme} label={park.climate} /> : null}
              {park.terrainType ? <Tag theme={theme} label={park.terrainType} /> : null}
            </View>
          </View>
          {!!park.parkImageUrl && (
            <Image
              source={{ uri: park.parkImageUrl }}
              style={styles.parkImage}
              resizeMode="cover"
            />
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Stat theme={theme} label="Trails" value={String(totalTrails)} />
          <Stat theme={theme} label="Completed" value={String(completedCount)} />
          <Stat theme={theme} label="Purchased" value={String(purchasedCount)} />
        </View>

        {/* Park Progress */}
        <View style={styles.progressWrap}>
          <Text style={styles.progressLabel}>Park Completion</Text>
          <View style={styles.progressBarOuter}>
            <View style={[styles.progressBarFill, { width: `${completionPct}%` }]} />
          </View>
          <Text style={styles.progressPct}>{completionPct}%</Text>
        </View>
      </View>

      {/* Wild Progress */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Wild</Text>
        {wild ? (
          <View style={styles.wildRow}>
            <View style={{ alignItems: "center" }}>
              <WildAvatar id={wild.id} pose={wildPose} size={140} />
              {userWild && !userWild?.isActive ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.setActiveButton,
                    pressed && styles.setActiveButtonPressed,
                  ]}
                  onPress={async () => {
                    await user?.setActiveWild(wild.id);
                    load();
                  }}>
                  <Text style={styles.setActiveButtonText}>Set Active</Text>
                </Pressable>
              ) : (
                <></>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.wildName}>{wild.wildName}</Text>
              <Text style={{ color: theme.secondaryText, marginBottom: 4 }}>
                {wild.species ?? "Unknown species"}
              </Text>

              {/* Level + XP Info */}
              {userWild && (
                <>
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 13,
                      fontWeight: "600",
                      marginBottom: 4,
                    }}>
                    Level {userWild.level} — {userWild.xp} / {userWild.xpToNext} XP
                  </Text>

                  <View style={styles.xpBarOuter}>
                    <View
                      style={[
                        styles.xpBarFill,
                        {
                          width: `${
                            userWild.xpToNext
                              ? Math.min((userWild.xp / userWild.xpToNext) * 100, 100)
                              : 0
                          }%`,
                        },
                      ]}
                    />
                  </View>
                </>
              )}

              {/* Tags */}
              <View style={[styles.tagRow, { marginTop: 8 }]}>
                {wild.rarity ? <Tag theme={theme} label={`Rarity: ${wild.rarity}`} /> : null}
                {userWild?.isActive ? <Tag theme={theme} label="Active" /> : null}
              </View>
            </View>
          </View>
        ) : (
          <EmptyLine theme={theme} text="No wild assigned to this park yet." />
        )}
      </View>

      {/* Trails */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Trails</Text>
        {trails.length === 0 ? (
          <EmptyLine theme={theme} text="No trails in this park yet." />
        ) : (
          <FlatList
            data={trails}
            keyExtractor={t => t.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item: trail }) => {
              const isCompleted = completedIds.has(trail.id);
              const isPurchased = purchasedIds.has(trail.id);
              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.trailRow}
                  onPress={() => onPressTrail(trail)}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.trailName}>{trail.trailName}</Text>
                    <View style={styles.trailMetaRow}>
                      {trail.trailDistance ? (
                        <Meta theme={theme} label={`${trail.trailDistance} mi`} />
                      ) : null}
                      {trail.trailElevation ? (
                        <Meta theme={theme} label={`${trail.trailElevation} ft gain`} />
                      ) : null}
                      {trail.trailDifficulty ? (
                        <Meta theme={theme} label={trail.trailDifficulty} />
                      ) : null}
                      {trail.isFree ? <Meta theme={theme} label="Free" /> : null}
                      {trail.isSubscribersOnly ? <Meta theme={theme} label="Subscribers" /> : null}
                    </View>
                  </View>
                  <View style={styles.badgeCol}>
                    {isCompleted ? <Badge theme={theme} text="Completed" tone="success" /> : null}
                    {isPurchased ? <Badge theme={theme} text="Purchased" tone="primary" /> : null}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </ScrollView>
  );
};

/* ————— Small UI bits (theme-aware) ————— */

const Tag = ({ label, theme }: { label: string; theme: typeof lightTheme | typeof darkTheme }) => (
  <View
    style={{
      backgroundColor:
        theme.themeName === "darkTheme" ? theme.linkBackground : theme.linkBackground,
      borderColor: theme.linkBorder,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    }}>
    <Text
      style={{
        color: theme.linkText,
        fontSize: 12,
        fontWeight: "600",
      }}>
      {label}
    </Text>
  </View>
);

const Meta = ({ label, theme }: { label: string; theme: typeof lightTheme | typeof darkTheme }) => (
  <View
    style={{
      backgroundColor: theme.themeName === "darkTheme" ? theme.inputBackground : theme.card,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
    }}>
    <Text
      style={{
        color: theme.themeName === "darkTheme" ? theme.trailStatText : theme.trailStatText,
        fontSize: 12,
        fontWeight: "500",
      }}>
      {label}
    </Text>
  </View>
);

const Stat = ({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: typeof lightTheme | typeof darkTheme;
}) => (
  <View style={{ alignItems: "center", flex: 1, paddingVertical: 8 }}>
    <Text
      style={{
        fontSize: 20,
        fontWeight: "700",
        color: theme.statValue,
      }}>
      {value}
    </Text>
    <Text
      style={{
        marginTop: 2,
        fontSize: 12,
        color: theme.statLabel,
      }}>
      {label}
    </Text>
  </View>
);

const Badge = ({
  text,
  tone,
  theme,
}: {
  text: string;
  tone: string;
  theme: typeof lightTheme | typeof darkTheme;
}) => {
  let bg = theme.card;
  if (tone === "success") {
    bg = theme.completedBadge;
  } // green from theme
  else if (tone === "primary") {
    bg = theme.buttonPrimary;
  } else if (tone === "warning") {
    bg = "#FBBF24";
  }
  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 8,
      }}>
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: tone === "success" ? theme.completedBadgeText : theme.buttonPrimaryText,
        }}>
        {text}
      </Text>
    </View>
  );
};

const EmptyLine = ({
  text,
  theme,
}: {
  text: string;
  theme: typeof lightTheme | typeof darkTheme;
}) => (
  <Text
    style={{
      color: theme.secondaryText,
      fontStyle: "italic",
      paddingVertical: 8,
    }}>
    {text}
  </Text>
);

/* ————— Styles ————— */

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    container: {
      padding: 16,
      gap: 16,
      backgroundColor: theme.background,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    headerRow: {
      flexDirection: "row",
      gap: 12,
    },
    headerLeft: {
      flex: 1,
      gap: 8,
    },
    parkName: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.trailHeaderText,
    },
    tagRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    parkImage: {
      width: 84,
      height: 84,
      borderRadius: 12,
      backgroundColor: theme.themeName === "darkTheme" ? theme.inputBackground : theme.card,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    statsRow: {
      marginTop: 16,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    progressWrap: {
      marginTop: 16,
    },
    progressLabel: {
      fontSize: 12,
      color: theme.secondaryText,
      marginBottom: 6,
    },
    progressBarOuter: {
      height: 10,
      backgroundColor: theme.progressBarBackground,
      borderRadius: 999,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.progressBorder,
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: theme.progressBar,
    },
    progressPct: {
      marginTop: 6,
      fontSize: 12,
      color: theme.progressText,
      fontWeight: "600",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.trailHeaderText,
      marginBottom: 10,
    },
    wildRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      justifyContent: "center",
    },
    wildName: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.text,
      marginBottom: 6,
    },
    trailRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 12,
    },
    trailName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.text,
    },
    trailMetaRow: {
      marginTop: 6,
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    badgeCol: {
      gap: 6,
      marginLeft: 12,
      alignItems: "flex-end",
    },
    separator: {
      height: 1,
      backgroundColor: theme.border,
      opacity: 0.6,
    },
    xpBarOuter: {
      height: 8,
      backgroundColor: theme.progressBarBackground,
      borderRadius: 999,
      overflow: "hidden",
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.progressBorder,
      marginBottom: 6,
    },
    xpBarFill: {
      height: "100%",
      backgroundColor: theme.progressBar, // uses same accent as park progress
    },
    setActiveButton: {
      marginTop: 10,
      paddingVertical: 7,
      paddingHorizontal: 14,
      borderRadius: 999,
      backgroundColor: theme.buttonPrimary,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.buttonPrimary,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.themeName === "darkTheme" ? 0.28 : 0.14,
      shadowRadius: 4,
      elevation: 2,
    },

    setActiveButtonPressed: {
      opacity: 0.82,
      transform: [{ scale: 0.98 }],
    },

    setActiveButtonText: {
      color: theme.buttonPrimaryText,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
    ActiveButtonText: {
      color: theme.buttonPrimaryText,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
  });

export default ParkDetails;
