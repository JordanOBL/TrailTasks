import { Pressable, StyleSheet, Text, View } from "react-native";
import { darkTheme, lightTheme } from "../../theme";

import React from "react";
import { User } from "../../watermelon/models";
import { useAuthContext } from "../../services/AuthContext";
import { useTheme } from "../../contexts/ThemeProvider";

interface Props {
  user: User;
  navigation: any;
}

const links = [
  { label: "Profile", route: "Profile", needsSubscription: false },
  { label: "Shop", route: "Shop", needsSubscription: false },
  { label: "Leaderboards", route: "Leaderboards", needsSubscription: false },
  { label: "Settings", route: "Settings", needsSubscription: false },
];

export default function HomeScreenLinks({ user, navigation }: Props) {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { isProMember } = useAuthContext();

  function handlePress(needsSubscription: boolean, link: string) {
    if (!needsSubscription || isProMember) {
      navigation.navigate(link);
      return;
    }

    navigation.navigate("Subscribe");
  }

  return (
    <View style={styles.container}>
      {links.map(link => (
        <Pressable
          key={link.route}
          style={styles.screenLink}
          onPress={() => handlePress(link.needsSubscription, link.route)}>
          <Text style={styles.text}>{link.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const getStyles = (theme: typeof lightTheme | typeof darkTheme) => {
  return StyleSheet.create({
    container: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    screenLink: {
      flexBasis: "48%",
      flexGrow: 1,
      minHeight: 56,
      backgroundColor: theme.card,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 12,
    },

    text: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "700",
      letterSpacing: 0.2,
    },
  });
};
