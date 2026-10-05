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
  const isProLocked = !!trail.is_subscribers_only && !isProMember;

  const getTrailStatus = () => {
    if (currentTrail) return { label: "Currently Hiking", tone: "active" as const };
    if (isCompleted) return { label: "Completed", tone: "success" as const };
    if (isQueued) return { label: "In Queue", tone: "queued" as const };
    if (isFree) return { label: "Free Trail", tone: "open" as const };
    if (isPurchased) return { label: "Purchased", tone: "open" as const };
    if (isProLocked) return { label: "Pro", tone: "locked" as const };
    if (trail.is_subscribers_only && isProMember) return { label: "Included with Pro", tone: "open" as const };
    return { label: "Unlock", tone: "locked" as const };
  };

  const status = getTrailStatus();
  const estimatedTime = calculateEstimatedTime(Number(trail?.trail_distance));

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      style={styles.card}
      onPress={() => handleTrailPress(trail)}>
      <View style={styles.imageShell}>
        <Image
          source={
            trail.trail_image_url ? { uri: trail.trail_image_url } : require("../../assets/LOGO.png")
          }
          style={styles.image}
        />
        <View style={styles.imageOverlay} />

        <View style={styles.topBadgeRow}>
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

        <View style={styles.imageTitleBlock}>
          <Text style={styles.trailName} numberOfLines={2}>
            {trail?.trail_name}
          </Text>
          <Text style={styles.parkName} numberOfLines={1}>
            {trail?.park_name}{trail?.state_code ? `, ${trail.state_code}` : ""}
          </Text>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Distance</Text>
            <Text style={styles.statValue}>{trail?.trail_distance} mi</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{estimatedTime}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Difficulty</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {trail?.trail_difficulty || "Trail"}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>⛰</Text>
            <Text style={styles.metaText}>{trail?.state || "Tap for details"}</Text>
          </View>
          <Text style={styles.ctaText}>View trail →</Text>
        </View>
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
      borderRadius: 24,
      borderWidth: 1,
      marginHorizontal: 18,
      marginTop: 16,
      overflow: "hidden",
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.22,
      shadowRadius: 18,
      elevation: 6,
    },
    imageShell: {
      height: 220,
      justifyContent: "space-between",
      overflow: "hidden",
    },
    image: {
      ...StyleSheet.absoluteFillObject,
      height: "100%",
      width: "100%",
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0, 0, 0, 0.32)",
    },
    topBadgeRow: {
      alignItems: "flex-start",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      justifyContent: "space-between",
      padding: 14,
    },
    statusPill: {
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 7,
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
      backgroundColor: "rgba(19, 179, 172, 0.9)",
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
      paddingHorizontal: 11,
      paddingVertical: 7,
    },
    featuredPillText: {
      color: "#121212",
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    imageTitleBlock: {
      padding: 16,
      paddingTop: 34,
    },
    trailName: {
      color: "#ffffff",
      fontSize: 24,
      fontWeight: "900",
      letterSpacing: -0.3,
      lineHeight: 28,
      textShadowColor: "rgba(0, 0, 0, 0.45)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 8,
    },
    parkName: {
      color: "rgba(255, 255, 255, 0.86)",
      fontSize: 14,
      fontWeight: "700",
      marginTop: 5,
    },
    infoContainer: {
      backgroundColor: theme.trailCardOverlay,
      paddingHorizontal: 15,
      paddingVertical: 14,
    },
    statsContainer: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statItem: {
      flex: 1,
      minWidth: 0,
    },
    statLabel: {
      color: theme.secondaryText,
      fontSize: 11,
      fontWeight: "800",
      marginBottom: 4,
      textTransform: "uppercase",
    },
    statValue: {
      color: theme.trailCardText,
      fontSize: 14,
      fontWeight: "900",
    },
    statDivider: {
      backgroundColor: theme.border,
      height: 32,
      marginHorizontal: 10,
      width: 1,
    },
    footerRow: {
      alignItems: "center",
      borderTopColor: theme.border,
      borderTopWidth: 1,
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 14,
      paddingTop: 12,
    },
    metaRow: {
      alignItems: "center",
      flex: 1,
      flexDirection: "row",
      minWidth: 0,
    },
    metaIcon: {
      fontSize: 15,
      marginRight: 6,
    },
    metaText: {
      color: theme.trailCardSecondaryText,
      flex: 1,
      fontSize: 13,
      fontWeight: "700",
    },
    ctaText: {
      color: theme.button,
      fontSize: 13,
      fontWeight: "900",
      marginLeft: 12,
    },
  });
