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

type HomeLink = {
  label: string;
  description: string;
  route: string;
  needsSubscription: boolean;
};

const links: HomeLink[] = [
  {
    label: "Profile & progress",
    description: "Stats, achievements, friends, and trail queue live here.",
    route: "Profile",
    needsSubscription: false,
  },
  {
    label: "Shop",
    description: "Backpack upgrades and trail helpers.",
    route: "Shop",
    needsSubscription: false,
  },
  {
    label: "Settings",
    description: "Account, session, and subscription controls.",
    route: "Settings",
    needsSubscription: false,
  },
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
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionEyebrow}>More</Text>
        <Text style={styles.sectionTitle}>Everything else</Text>
      </View>

      <View style={styles.linksCard}>
        {links.map((link, index) => (
          <Pressable
            key={link.route}
            style={[styles.screenLink, index < links.length - 1 && styles.screenLinkBorder]}
            onPress={() => handlePress(link.needsSubscription, link.route)}>
            <View style={styles.linkCopy}>
              <Text style={styles.text}>{link.label}</Text>
              <Text style={styles.description}>{link.description}</Text>
            </View>
            <Text style={styles.chevron}>→</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const getStyles = (theme: typeof lightTheme | typeof darkTheme) => {
  return StyleSheet.create({
    container: {
      gap: 8,
    },
    sectionHeader: {
      paddingHorizontal: 2,
    },
    sectionEyebrow: {
      color: theme.secondaryText,
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 0.65,
      textTransform: "uppercase",
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 17,
      fontWeight: "900",
      marginTop: 2,
    },
    linksCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 18,
      borderWidth: 1,
      overflow: "hidden",
    },
    screenLink: {
      alignItems: "center",
      flexDirection: "row",
      gap: 12,
      minHeight: 64,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    screenLinkBorder: {
      borderBottomColor: theme.border,
      borderBottomWidth: 1,
    },
    linkCopy: {
      flex: 1,
      minWidth: 0,
    },
    text: {
      color: theme.text,
      fontSize: 15,
      fontWeight: "900",
      letterSpacing: 0.1,
    },
    description: {
      color: theme.secondaryText,
      fontSize: 12,
      fontWeight: "700",
      lineHeight: 17,
      marginTop: 3,
    },
    chevron: {
      color: theme.button,
      fontSize: 18,
      fontWeight: "900",
    },
  });
};
