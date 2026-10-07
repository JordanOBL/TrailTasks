import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import Icon from "react-native-vector-icons/Ionicons";
import React from "react";
import ScreenLink from "../components/screenLink";
import { User } from "../watermelon/models";
import { darkTheme, lightTheme } from "../theme";
import { useAuthContext } from "../services/AuthContext";
import { useTheme } from "../contexts/ThemeProvider";
import { withObservables } from "@nozbe/watermelondb/react";

interface ProfileScreenProps {
  navigation: any;
  user: User;
}

type ProfileLink = {
  label: string;
  description: string;
  route: string;
  iconName: string;
  needsActiveSubscription: boolean;
};

const profileLinks: ProfileLink[] = [
  {
    label: "Stats",
    description: "See miles, focus time, and completed session trends.",
    route: "Stats",
    iconName: "podium-outline",
    needsActiveSubscription: false,
  },
  {
    label: "Upcoming Trails",
    description: "Plan and manage the trail queue for future hikes.",
    route: "Trail Queue",
    iconName: "calendar-outline",
    needsActiveSubscription: true,
  },
  {
    label: "Friends",
    description: "Connect with other hikers when social features are enabled.",
    route: "Friends",
    iconName: "people-outline",
    needsActiveSubscription: false,
  },
  {
    label: "Achievements",
    description: "Review milestones, badges, and earned progress.",
    route: "Achievements",
    iconName: "ribbon-outline",
    needsActiveSubscription: false,
  },
];

export const ProfileScreen = ({ navigation, user }: ProfileScreenProps) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { isProMember } = useAuthContext();
  const displayName = user?.username || "Trail Explorer";
  const membershipLabel = isProMember ? "Pro member" : "Free account";

  return (
    <SafeAreaView style={styles.safeArea} testID="profile-screen">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerCard}>
          <View style={styles.avatarCircle}>
            <Icon name="person-outline" size={30} color={theme.buttonText} />
          </View>

          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Profile</Text>
            <Text style={styles.title}>{displayName}</Text>
            <Text style={styles.subtitle}>{membershipLabel}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trail Hub</Text>
          <Text style={styles.sectionSubtitle}>
            Quick access to your activity and account tools.
          </Text>
        </View>

        <View style={styles.linksCard}>
          {profileLinks.map(link => (
            <ScreenLink
              key={link.route}
              user={user}
              needsActiveSubscription={link.needsActiveSubscription}
              hasActiveSubscription={isProMember}
              navigation={navigation}
              navTo={link.route}
              iconName={link.iconName}
              description={link.description}>
              {link.label}
            </ScreenLink>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const enhance = withObservables(["user"], ({ user }) => ({
  user: user.observe(),
  currentTrail: user.trail.observe(),
  userSessions: user.usersSessions.observe(),
  userWilds: user.usersWilds.observe(),
}));
const EnhancedProfileScreen = enhance(ProfileScreen);
export default EnhancedProfileScreen;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      padding: 16,
      paddingBottom: 32,
      gap: 18,
    },
    headerCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
      borderRadius: 24,
      padding: 18,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
    avatarCircle: {
      width: 64,
      height: 64,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.button,
    },
    headerCopy: {
      flex: 1,
    },
    eyebrow: {
      color: theme.secondaryText,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    title: {
      color: theme.text,
      fontSize: 26,
      fontWeight: "900",
      lineHeight: 32,
    },
    subtitle: {
      color: theme.button,
      fontSize: 14,
      fontWeight: "800",
      marginTop: 3,
    },
    sectionHeader: {
      gap: 4,
    },
    sectionTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "900",
    },
    sectionSubtitle: {
      color: theme.secondaryText,
      fontSize: 14,
      fontWeight: "500",
      lineHeight: 20,
    },
    linksCard: {
      gap: 0,
    },
  });
