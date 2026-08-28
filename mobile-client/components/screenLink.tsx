import { Pressable, StyleSheet, Text, View } from "react-native";

import Icon from "react-native-vector-icons/Ionicons";
import React from "react";
import { User } from "../watermelon/models";
import { darkTheme, lightTheme } from "../theme";
import { useTheme } from "../contexts/ThemeProvider";

interface Props {
  children: React.ReactNode;
  navTo: string;
  navigation: any;
  user: User;
  hasActiveSubscription: boolean;
  needsActiveSubscription: boolean;
  iconName?: string;
  description?: string;
}

const ScreenLink = ({
  children,
  navigation,
  navTo,
  hasActiveSubscription,
  needsActiveSubscription,
  iconName = "chevron-forward-outline",
  description,
}: Props) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const isLocked = needsActiveSubscription && !hasActiveSubscription;

  const handlePress = () => {
    if (!isLocked) {
      navigation.navigate(navTo);
      return;
    }

    navigation.navigate("Basecamp", { screen: "Subscribe" });
  };

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.linkContainer,
        isLocked && styles.lockedContainer,
        pressed && styles.pressed,
      ]}
      onPress={handlePress}>
      <View style={[styles.iconBubble, isLocked && styles.lockedIconBubble]}>
        <Icon name={isLocked ? "lock-closed-outline" : iconName} size={20} color={theme.button} />
      </View>

      <View style={styles.copyContainer}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, isLocked && styles.lockedText]}>{children}</Text>
          {needsActiveSubscription && (
            <View style={[styles.badge, isLocked && styles.lockedBadge]}>
              <Text style={[styles.badgeText, isLocked && styles.lockedBadgeText]}>Pro</Text>
            </View>
          )}
        </View>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>

      <Icon
        name="chevron-forward-outline"
        size={20}
        color={isLocked ? theme.linkDisabled : theme.secondaryText}
      />
    </Pressable>
  );
};

export default ScreenLink;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    linkContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderColor: theme.border,
      borderRadius: 18,
      borderWidth: 1,
      backgroundColor: theme.card,
      marginBottom: 12,
      paddingVertical: 14,
      paddingHorizontal: 14,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 2,
    },
    lockedContainer: {
      opacity: 0.82,
    },
    pressed: {
      opacity: 0.72,
      transform: [{ scale: 0.99 }],
    },
    iconBubble: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.progressBarBackground,
    },
    lockedIconBubble: {
      backgroundColor: theme.inputBackground,
    },
    copyContainer: {
      flex: 1,
    },
    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    title: {
      color: theme.text,
      fontSize: 16,
      fontWeight: "800",
    },
    lockedText: {
      color: theme.linkDisabled,
    },
    description: {
      color: theme.secondaryText,
      fontSize: 13,
      fontWeight: "500",
      lineHeight: 18,
      marginTop: 3,
    },
    badge: {
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: theme.button,
    },
    lockedBadge: {
      backgroundColor: theme.inputBackground,
    },
    badgeText: {
      color: theme.buttonText,
      fontSize: 11,
      fontWeight: "900",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    lockedBadgeText: {
      color: theme.linkDisabled,
    },
  });
