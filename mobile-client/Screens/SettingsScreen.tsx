import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { darkTheme, lightTheme } from "../theme";

import React from "react";
import { User } from "../watermelon/models";
import { sync } from "../watermelon/sync";
import { useAuthContext } from "../services/AuthContext";
import { useDatabase } from "@nozbe/watermelondb/react";
import { useInternetConnection } from "../contexts/InternetConnectionProvider";
import { useTheme } from "../contexts/ThemeProvider";

interface Props {
  user: User;
  navigation: any;
}

const SettingsScreen = ({ user, navigation }: Props) => {
  const database = useDatabase();
  const { isConnected } = useInternetConnection();
  const { theme, toggleTheme } = useTheme();
  const { logout, user: authUser } = useAuthContext();
  const accountUser = authUser || user;

  const currentThemeName = theme === darkTheme ? "dark" : "light";
  const styles = getStyles(theme);

  return (
    <View testID="settings-screen" style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Appearance
          </Text>
          <View style={styles.card}>
            <Pressable accessibilityRole="button" style={styles.option} onPress={toggleTheme}>
              <Text style={styles.optionText}>
                Switch to {currentThemeName === "dark" ? "Light" : "Dark"} Mode
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Account
          </Text>
          <View style={styles.card}>
            <Pressable
              accessibilityRole="button"
              style={[styles.option, styles.divider]}
              onPress={() => navigation.navigate("SubscriptionSettings")}>
              <Text style={styles.optionText}>Subscription</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => logout()} style={styles.option}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Data
          </Text>
          <View style={styles.card}>
            <Pressable
              accessibilityRole="button"
              style={styles.option}
              onPress={() => sync(database, isConnected, accountUser?.id)}>
              <Text style={styles.optionText}>Sync</Text>
            </Pressable>
          </View>
          <Text style={styles.helperText}>Advanced account sync</Text>
          <View style={styles.card}>
            <Pressable
              accessibilityRole="button"
              style={[styles.option, styles.divider]}
              onPress={() =>
                sync(database, isConnected, accountUser?.id, { fullUserSync: true, pullOnly: true })
              }>
              <Text style={styles.optionText}>Force Account Pull</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              style={styles.option}
              onPress={() =>
                sync(database, isConnected, accountUser?.id, {
                  pushOnly: true,
                  forceAccountPush: true,
                })
              }>
              <Text style={styles.optionText}>Force Account Push</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default SettingsScreen;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scroll: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      padding: 16,
      paddingBottom: 32,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      color: theme.secondaryText,
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 8,
      paddingHorizontal: 4,
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      borderColor: theme.border,
      borderWidth: 1,
    },
    option: {
      minHeight: 48,
      justifyContent: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    divider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.border,
    },
    optionText: {
      fontSize: 16,
      color: theme.text,
    },
    logoutText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme === darkTheme ? "#FF8A80" : "#B3261E",
    },
    helperText: {
      color: theme.secondaryText,
      fontSize: 13,
      marginTop: 16,
      marginBottom: 8,
      paddingHorizontal: 4,
    },
  });
