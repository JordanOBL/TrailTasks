import { Pressable, StyleSheet, Text, View } from "react-native";
import { darkTheme, lightTheme } from "../../theme";

import React from "react";
import { User_Wild } from "../../watermelon/models";
import WildAvatar from "./WildAvatar";
import { useTheme } from "../../contexts/ThemeProvider";

export interface WildCardProps {
  wild: any;
  switchActiveWild: (newActiveWild: User_Wild) => Promise<void>;
}

const WildCard = React.memo(({ wild, switchActiveWild }: WildCardProps) => {
  const { theme } = useTheme();
console.log('WildCard wild:', wild);
  const styles = getStyles(theme);

const isActive = wild?.isActive;

  return (
    <View
     
      style={[styles.card, isActive && styles.activeWild]}
    >
      <WildAvatar
        id={wild.wildId}
        key={wild.id}
        pose={isActive ? "wave" : "rest"}
      />
      <View style={styles.info}>
        <Text style={styles.name}>{wild.name}</Text>
        <Text style={styles.level}>{wild.species}</Text>
        <Text style={styles.level}>Level {wild.level ? wild.level : 1}</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressFill, { width: `${Math.random() * 100}%` }]} />
        </View>
        <Text style={styles.perkTitle}>{wild.perkName}</Text>
        <Text style={styles.perkDesc}>{wild.perkDescription}</Text>
      </View>
      <Pressable
        onPress={() => switchActiveWild(wild)}
        style={{ marginTop: 10 }}
        disabled={isActive}
      >
        <Text style={{ color: "rgb(7,254,213)", fontWeight: "600" }}>
          {isActive ? "Active Wild" : "Set as Active"}
        </Text>
      </Pressable>
    </View>
  );
});

const getStyles = (theme: typeof lightTheme | typeof darkTheme) => {
  return StyleSheet.create({
    activeWild: {
      borderWidth: 2,
      borderColor: "rgb(7,254,213)",
    },
    card: {
      width: 180,
      height: 300,
      backgroundColor: theme.background,
      borderRadius: 16,
      padding: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
      marginBottom: 4,
      alignItems: "center",
    },
    locked: {
      opacity: 0.6,
    },
    inactive: {
      opacity: 0.8,
    },
    image: {
      width: "100%",
      height: 120,
    },
    info: {
      marginTop: 8,
    },
    name: {
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
    },
    level: {
      fontSize: 14,
      color: "#666",
      textAlign: "center",
    },
    progressContainer: {
      height: 6,
      backgroundColor: "#e0e0e0",
      borderRadius: 3,
      overflow: "hidden",
      marginVertical: 4,
    },
    progressFill: {
      height: 6,
      backgroundColor: "#4caf50",
    },
    perkTitle: {
      fontWeight: "600",
      fontSize: 13,
      marginTop: 6,
      textAlign: "center",
    },
    perkDesc: {
      fontSize: 12,
      color: "#444",
      textAlign: "center",
    },
    lockedText: {
      fontSize: 12,
      color: "#c00",
      marginTop: 4,
      textAlign: "center",
    },
  });
};

export default WildCard;
