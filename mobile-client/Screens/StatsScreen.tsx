import * as React from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { User, User_Session } from "../watermelon/models";

import { Dropdown } from "react-native-element-dropdown";
import { FilterBy } from "../helpers/Stats/FilterFunction";
import Icon from "react-native-vector-icons/Ionicons";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Q } from "@nozbe/watermelondb";
import SessionList from "../components/Stats/SessionList";
import Stats from "../components/Stats/Stats";
import handleError from "../helpers/ErrorHandler";
import { useAuthContext } from "../services/AuthContext";
import { useDatabase } from "@nozbe/watermelondb/react";
import { useTheme } from "../contexts/ThemeProvider";

type TimeFrame = {
  label: string;
  value: number;
};

const timeFrames: TimeFrame[] = [
  { label: "All Time", value: 0 },
  { label: "1 Year", value: 365 },
  { label: "6 Months", value: 180 },
  { label: "3 Months", value: 90 },
  { label: "1 Month", value: 30 },
  { label: "2 Weeks", value: 14 },
  { label: "1 Week", value: 7 },
  { label: "1 Day", value: 1 },
];

type CategoryOption = {
  sessionCategoryName: string;
  sessionCategoryId: string | number;
};

type Props = {
  user: User;
  userSessions?: User_Session[];
};

const StatsScreen: React.FC<Props> = ({ user }) => {
  const watermelonDatabase = useDatabase();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { isProMember } = useAuthContext();

  const [sessionCategories, setSessionCategories] = React.useState<CategoryOption[]>([]);
  const [userSessionsWithCategories, setUserSessionsWithCategories] = React.useState<any[]>([]);
  const [timeFilter, setTimeFilter] = React.useState<string>("All Time");
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All Categories");
  const [filteredUserSessions, setFilteredUserSessions] = React.useState<any[]>([]);
  const [view, setView] = React.useState<"stats" | "sessions">("stats");
  const [showFilterMenu, setShowFilterMenu] = React.useState(false);

  const handleTimeFilterChange = (str: string) => {
    setTimeFilter(str);
  };

  const handleCategoryFilterChange = (categoryName: string) => {
    setCategoryFilter(categoryName);
    setFilteredUserSessions(
      categoryName === "All Categories"
        ? userSessionsWithCategories
        : userSessionsWithCategories.filter(
            session => session.session_category_name === categoryName,
          ),
    );
  };

  async function getUserSessionsWithCategories() {
    try {
      const query = `
        SELECT users_sessions.*, session_categories.session_category_name 
        FROM users_sessions 
        LEFT JOIN session_categories ON users_sessions.session_category_id = session_categories.id 
        WHERE users_sessions.user_id = ?
        ORDER BY users_sessions.date_added DESC;
      `;
      const sessions: any[] = await watermelonDatabase
        .get("users_sessions")
        .query(Q.unsafeSqlQuery(query, [user.id]))
        .unsafeFetchRaw();
      setUserSessionsWithCategories(sessions);
      setFilteredUserSessions(sessions);
    } catch (err) {
      handleError(err, "Stats Screen getUserSessionsWithCategories");
    }
  }

  async function getSessionCategories() {
    try {
      const categories = await watermelonDatabase.get("session_categories").query().fetch();
      const mapped = categories.map((cat: any) => ({
        sessionCategoryName: cat.sessionCategoryName,
        sessionCategoryId: cat.id,
      }));
      setSessionCategories(mapped);
    } catch (err) {
      handleError(err, "getSessionCategories() in Stats Screen");
    }
  }

  React.useEffect(() => {
    getSessionCategories();
    getUserSessionsWithCategories();
  }, [user]);

  React.useEffect(() => {
    FilterBy(timeFilter, categoryFilter, userSessionsWithCategories, setFilteredUserSessions);
    setShowFilterMenu(false);
  }, [timeFilter, categoryFilter]);

  const currentViewLabel = view === "stats" ? "Stats" : "Sessions";

  return (
    <SafeAreaView style={styles.container} testID="stats-screen">
      <View style={styles.headerCard}>
        <Text style={styles.headerEyebrow}>Your Activity</Text>
        <Text style={styles.headerTitle}>{currentViewLabel}</Text>
        <Text style={styles.headerSubtitle}>
          Review completed sessions, miles, focus time, and trail trends.
        </Text>

        <View style={styles.segmentedControl}>
          <Pressable
            accessibilityRole="button"
            style={[styles.segmentButton, view === "stats" && styles.segmentButtonActive]}
            onPress={() => setView("stats")}>
            <Text style={[styles.segmentText, view === "stats" && styles.segmentTextActive]}>
              Stats
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            style={[styles.segmentButton, view === "sessions" && styles.segmentButtonActive]}
            onPress={() => setView("sessions")}>
            <Text style={[styles.segmentText, view === "sessions" && styles.segmentTextActive]}>
              Sessions
            </Text>
          </Pressable>
        </View>
      </View>

      <Pressable
        style={styles.filterToggle}
        disabled={!isProMember}
        onPress={() => setShowFilterMenu(prev => !prev)}>
        <View>
          <Text
            style={[
              styles.filterToggleText,
              { color: isProMember ? theme.text : theme.linkDisabled },
            ]}>
            Filters
          </Text>
          <Text style={styles.filterSummary}>
            {categoryFilter} • {timeFilter}
          </Text>
        </View>
        {isProMember && (
          <Ionicons
            name={showFilterMenu ? "caret-up-outline" : "caret-down-outline"}
            size={20}
            color={theme.secondaryText}
          />
        )}
        {!isProMember && (
          <View style={styles.proLock}>
            <Icon name="lock-closed" size={18} color={theme.linkDisabled} />
            <Text style={[styles.filterToggleText, { color: theme.linkDisabled }]}>Pro</Text>
          </View>
        )}
      </Pressable>

      {showFilterMenu && (
        <View style={styles.filterMenu}>
          <Dropdown
            data={[
              { sessionCategoryName: "All Categories", sessionCategoryId: 0 },
              ...sessionCategories,
            ]}
            onChange={item => handleCategoryFilterChange(item.sessionCategoryName)}
            labelField="sessionCategoryName"
            valueField="sessionCategoryId"
            placeholder="Select a category"
            style={styles.dropdown}
            placeholderStyle={{ color: theme.secondaryText }}
            selectedTextStyle={{ color: theme.text }}
            value={categoryFilter}
          />

          <Dropdown
            data={timeFrames}
            onChange={item => handleTimeFilterChange(item.label)}
            labelField="label"
            valueField="value"
            placeholder="Select a time frame"
            style={styles.dropdown}
            placeholderStyle={{ color: theme.secondaryText }}
            selectedTextStyle={{ color: theme.text }}
            value={timeFilter}
          />

          <Pressable
            style={styles.filterButton}
            onPress={() => {
              setCategoryFilter("All Categories");
              setTimeFilter("All Time");
              setShowFilterMenu(false);
            }}>
            <Text style={styles.filterButtonText}>Reset</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.content}>
        {view === "sessions" ? (
          <SessionList
            filteredUserSessions={filteredUserSessions}
            sessionCategories={sessionCategories}
          />
        ) : (
          <Stats
            filteredUserSessions={filteredUserSessions}
            filteredCategory={categoryFilter}
            filteredTime={timeFilter}
            sessionCategories={sessionCategories}
          />
        )}
      </View>

      <Pressable
        style={styles.toggleButton}
        testID="toggle-stats-screen"
        onPress={() => setView(view === "stats" ? "sessions" : "stats")}>
        <Ionicons
          name={view === "stats" ? "list-outline" : "podium-outline"}
          size={24}
          color={theme.buttonText}
        />
      </Pressable>
    </SafeAreaView>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    headerCard: {
      margin: 16,
      marginBottom: 8,
      padding: 18,
      borderRadius: 22,
      backgroundColor: theme.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 3,
    },
    headerEyebrow: {
      color: theme.secondaryText,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    headerTitle: {
      color: theme.button,
      fontSize: 30,
      fontWeight: "900",
      lineHeight: 36,
    },
    headerSubtitle: {
      color: theme.secondaryText,
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
      marginTop: 6,
      marginBottom: 16,
    },
    segmentedControl: {
      flexDirection: "row",
      backgroundColor: theme.background,
      borderRadius: 14,
      padding: 4,
      gap: 4,
    },
    segmentButton: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 11,
      alignItems: "center",
    },
    segmentButtonActive: {
      backgroundColor: theme.button,
    },
    segmentText: {
      color: theme.secondaryText,
      fontSize: 14,
      fontWeight: "800",
    },
    segmentTextActive: {
      color: theme.buttonText,
    },
    filterToggle: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginHorizontal: 16,
      marginBottom: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterToggleText: {
      fontWeight: "800",
      fontSize: 15,
    },
    filterSummary: {
      color: theme.secondaryText,
      fontSize: 12,
      fontWeight: "600",
      marginTop: 2,
    },
    proLock: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    filterMenu: {
      marginHorizontal: 16,
      marginBottom: 8,
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    dropdown: {
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 10,
      backgroundColor: theme.inputBackground,
    },
    filterButton: {
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 20,
      marginTop: 2,
      alignItems: "center",
      backgroundColor: theme.button,
    },
    filterButtonText: {
      color: theme.buttonText,
      fontWeight: "800",
    },
    content: {
      flex: 1,
    },
    toggleButton: {
      position: "absolute",
      bottom: 20,
      right: 20,
      borderRadius: 28,
      width: 56,
      height: 56,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.button,
      elevation: 5,
      shadowColor: theme.button,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.28,
      shadowRadius: 10,
    },
  });

export default StatsScreen;
