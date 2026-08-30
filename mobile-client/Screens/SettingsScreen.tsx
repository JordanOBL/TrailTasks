import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate("SubscriptionSettings")}>
        <Text style={styles.optionText}>Subscription</Text>
      </TouchableOpacity>

      <Pressable style={styles.option} onPress={() => sync(database, isConnected, accountUser?.id)}>
        <Text style={styles.optionText}>Sync</Text>
      </Pressable>

      <Pressable
        style={styles.option}
        onPress={() =>
          sync(database, isConnected, accountUser?.id, { fullUserSync: true, pullOnly: true })
        }>
        <Text style={styles.optionText}>Force Account Pull</Text>
      </Pressable>

      <Pressable
        style={styles.option}
        onPress={() =>
          sync(database, isConnected, accountUser?.id, {
            pushOnly: true,
            forceAccountPush: true,
          })
        }>
        <Text style={styles.optionText}>Force Account Push</Text>
      </Pressable>

      <Pressable style={styles.option} onPress={toggleTheme}>
        <Text style={styles.optionText}>
          Switch to {currentThemeName === "dark" ? "Light" : "Dark"} Mode
        </Text>
      </Pressable>
      <Pressable onPress={() => logout()} style={styles.logoutButton}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>
    </View>
  );
};

export default SettingsScreen;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: theme.background,
    },
    button: {
      backgroundColor: theme.button,
      padding: 12,
      borderRadius: 8,
      marginVertical: 8,
    },
    buttonText: {
      color: theme.buttonText,
      fontSize: 16,
      fontWeight: "600",
    },
    logoutButton: {
      marginTop: 20,
      borderRadius: 8,
      borderColor: theme.border,
      borderWidth: 1,
      backgroundColor: "rgba(255, 0, 0, 0.1)",
      paddingVertical: 12,
      alignItems: "center",
    },
    logoutButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "red",
    },
    option: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderColor: theme.border,
    },
    optionText: {
      fontSize: 18,
      color: theme.text,
    },
  });
