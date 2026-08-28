import * as React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import Icon from "react-native-vector-icons/Ionicons";
import formatTime from "../../helpers/formatTime";
import { getSessionStats } from "../../helpers/Stats/GetSessionStats";
import { useAuthContext } from "../../services/AuthContext";
import { useTheme } from "../../contexts/ThemeProvider";

interface NormalizedSesttionCategoryNameId {
  sessionCategoryName: string;
  sessionCategoryId: string | number;
}

type Props = {
  filteredUserSessions: any[];
  filteredCategory: string;
  filteredTime: string;
  sessionCategories: NormalizedSesttionCategoryNameId[];
};

const Stats: React.FC<Props> = ({ filteredUserSessions, filteredCategory, filteredTime }) => {
  const { theme } = useTheme();
  const { isProMember } = useAuthContext();
  const styles = getStyles(theme);

  const [totalTime, setTotalTime] = React.useState<number>(0);
  const [totalDistance, setTotalDistance] = React.useState<number>(0.0);
  const [mostProductiveTimes, setMostProductiveTimes] = React.useState<string[]>([]);
  const [mostUsedCategory, setMostUsedCategory] = React.useState<string>("");
  const [, setLeastUsedCategory] = React.useState<string>("");

  React.useEffect(() => {
    getSessionStats(
      filteredUserSessions,
      setTotalTime,
      setTotalDistance,
      setMostProductiveTimes,
      setMostUsedCategory,
      setLeastUsedCategory,
    );
  }, [filteredUserSessions]);

  const hasSessions = filteredUserSessions.length > 0;

  const renderProValue = (value: string, testID: string) => {
    if (isProMember) {
      return (
        <Text testID={testID} style={styles.insightValue}>
          {value}
        </Text>
      );
    }

    return (
      <View testID={testID} style={styles.lockedInsightValue}>
        <Icon name="lock-closed" size={16} color={theme.linkDisabled} />
        <Text style={styles.lockedInsightText}>Pro</Text>
      </View>
    );
  };

  return (
    <View style={styles.container} testID="stats-container">
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Text style={styles.eyebrow}>Trail Stats</Text>
          <Text style={styles.filterText}>
            {filteredCategory} • {filteredTime}
          </Text>
          <Text testID="total-distance" style={styles.primaryValue}>
            {totalDistance.toFixed(2)} miles
          </Text>
          <Text style={styles.primaryLabel}>total distance hiked</Text>
        </View>

        <View style={styles.metricGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Focus Time</Text>
            <Text testID="total-focus-time" style={styles.metricValue}>
              {totalTime === 0 ? "N/A" : formatTime(totalTime)}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Sessions</Text>
            <Text testID="session-count" style={styles.metricValue}>
              {filteredUserSessions.length}
            </Text>
          </View>
        </View>

        {!hasSessions && (
          <View style={styles.emptyCard} testID="stats-empty-state">
            <Text style={styles.emptyTitle}>No completed sessions yet</Text>
            <Text style={styles.emptyText}>
              Finish a solo session and your distance, focus time, and trends will show here.
            </Text>
          </View>
        )}

        {hasSessions && filteredCategory === "All Categories" && (
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Insights</Text>
            {mostUsedCategory && (
              <View style={styles.insightCard}>
                <Text style={styles.insightLabel}>Most Used Category</Text>
                {renderProValue(mostUsedCategory, "most-used-category")}
              </View>
            )}
            {mostProductiveTimes.length > 0 && (
              <View style={styles.insightCard}>
                <Text style={styles.insightLabel}>Most Productive Time</Text>
                {renderProValue(mostProductiveTimes[0], "most-productive-time")}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Stats;

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 96,
      gap: 12,
    },
    summaryCard: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
    eyebrow: {
      color: theme.secondaryText,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    filterText: {
      color: theme.secondaryText,
      fontSize: 13,
      fontWeight: "600",
      marginBottom: 14,
    },
    primaryValue: {
      color: theme.button,
      fontSize: 36,
      fontWeight: "900",
      lineHeight: 42,
    },
    primaryLabel: {
      color: theme.secondaryText,
      fontSize: 14,
      fontWeight: "600",
      marginTop: 4,
    },
    metricGrid: {
      flexDirection: "row",
      gap: 12,
    },
    metricCard: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      minHeight: 96,
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 5,
      elevation: 2,
    },
    metricLabel: {
      color: theme.secondaryText,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      marginBottom: 8,
    },
    metricValue: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "800",
    },
    emptyCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 18,
      borderWidth: 1,
      borderColor: theme.border,
    },
    emptyTitle: {
      color: theme.text,
      fontSize: 17,
      fontWeight: "800",
      marginBottom: 6,
    },
    emptyText: {
      color: theme.secondaryText,
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
    },
    insightsSection: {
      gap: 10,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "800",
      marginTop: 4,
    },
    insightCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    insightLabel: {
      color: theme.secondaryText,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.4,
      marginBottom: 8,
    },
    insightValue: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "800",
    },
    lockedInsightValue: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    lockedInsightText: {
      color: theme.linkDisabled,
      fontSize: 18,
      fontWeight: "800",
    },
  });
