import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { darkTheme, lightTheme } from "../../theme";

import FullTrailDetails from "../../types/fullTrailDetails";
import React from "react";
import calculateEstimatedTime from "../../helpers/calculateEstimatedTime";
import { useAuthContext } from "../../services/AuthContext";
import { useTheme } from "../../contexts/ThemeProvider";

interface Props {
  trail: FullTrailDetails;
  isQueued: boolean;
  handleTrailPress: (trail: FullTrailDetails) => void;
}

const TrailCard = React.memo(({ trail, isQueued, handleTrailPress }: Props) => {
  const { theme } = useTheme();
  const { user, isProMember } = useAuthContext();
  const styles = getStyles(theme);
  const currentTrail = user?.trailId === trail?.id;
  const isCompleted = !!trail.is_completed;
  const isPurchased = !!trail.is_purchased;
  const isFree = !!trail.is_free;
  const isProOnly = !!trail.is_pro_only;
  const isProLocked = isProOnly && !isProMember && !isFree;
  const isTrailOfTheWeek = Boolean(trail.trail_of_the_week);

  const getTrailStatus = () => {
    if (currentTrail) return { label: "Currently Hiking", tone: "active" as const };
    if (isCompleted) return { label: "Completed", tone: "success" as const };
    if (isQueued) return { label: "In Queue", tone: "queued" as const };
    if (isFree && isProOnly) return { label: "Free This Month", tone: "open" as const };
    if (isFree) return { label: "Starter Trail", tone: "open" as const };
    if (isPurchased) return { label: "Purchased", tone: "open" as const };
    if (isProLocked) return { label: "Pro", tone: "locked" as const };
    if (isProOnly && isProMember) return { label: "Pro Eligible", tone: "locked" as const };
    return { label: "Unlock", tone: "locked" as const };
  };

  const status = getTrailStatus();
  const estimatedTime = calculateEstimatedTime(Number(trail?.trail_distance));

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.card}
      onPress={() => handleTrailPress(trail)}>
      <Image
        source={
          trail.trail_image_url ? { uri: trail.trail_image_url } : require("../../assets/LOGO.png")
        }
        style={styles.image}
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.trailName} numberOfLines={2}>
              {trail?.trail_name}
            </Text>
            <Text style={styles.parkName} numberOfLines={1}>
              {trail?.park_name}
              {trail?.state_code ? `, ${trail.state_code}` : ""}
            </Text>
          </View>

          <View style={[styles.statusPill, styles[`${status.tone}Pill`]]}>
            <Text style={[styles.statusPillText, styles[`${status.tone}PillText`]]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{trail?.trail_distance} mi</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{estimatedTime}</Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue} numberOfLines={1}>
              {trail?.trail_difficulty || "Trail"}
            </Text>
            <Text style={styles.statLabel}>Difficulty</Text>
          </View>
        </View>

        {isTrailOfTheWeek && (
          <View style={styles.featuredRow}>
            <Text style={styles.featuredText}>★ This week</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default TrailCard;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.trailCardBackground,
      borderColor: theme.border,
      borderRadius: 18,
      borderWidth: 1,
      flexDirection: "row",
      marginHorizontal: 16,
      marginTop: 12,
      minHeight: 132,
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 3,
    },
    image: {
      backgroundColor: theme.card,
      height: "100%",
      minHeight: 132,
      width: 112,
    },
    content: {
      flex: 1,
      justifyContent: "space-between",
      minWidth: 0,
      paddingHorizontal: 13,
      paddingVertical: 12,
    },
    titleRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      gap: 9,
    },
    titleBlock: {
      flex: 1,
      minWidth: 0,
    },
    trailName: {
      color: theme.trailCardText,
      fontSize: 17,
      fontWeight: "900",
      letterSpacing: -0.2,
      lineHeight: 21,
    },
    parkName: {
      color: theme.trailCardSecondaryText,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 4,
    },
    statusPill: {
      borderRadius: 999,
      maxWidth: 104,
      paddingHorizontal: 9,
      paddingVertical: 5,
    },
    statusPillText: {
      fontSize: 9,
      fontWeight: "900",
      letterSpacing: 0.35,
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
      backgroundColor: "rgba(19, 179, 172, 0.18)",
      borderColor: "rgba(19, 179, 172, 0.46)",
      borderWidth: 1,
    },
    openPillText: {
      color: theme.button,
    },
    lockedPill: {
      backgroundColor: "transparent",
      borderColor: theme.border,
      borderWidth: 1,
    },
    lockedPillText: {
      color: theme.secondaryText,
    },
    statsContainer: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 13,
    },
    statItem: {
      flex: 1,
      minWidth: 0,
    },
    statValue: {
      color: theme.trailCardText,
      fontSize: 13,
      fontWeight: "900",
    },
    statLabel: {
      color: theme.secondaryText,
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.35,
      marginTop: 3,
      textTransform: "uppercase",
    },
    statDivider: {
      backgroundColor: theme.border,
      height: 26,
      marginHorizontal: 8,
      width: 1,
    },
    featuredRow: {
      alignSelf: "flex-start",
      backgroundColor: "rgba(255, 204, 0, 0.16)",
      borderColor: "rgba(255, 204, 0, 0.34)",
      borderRadius: 999,
      borderWidth: 1,
      marginTop: 10,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    featuredText: {
      color: theme.trailCardText,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.25,
      textTransform: "uppercase",
    },
  });
