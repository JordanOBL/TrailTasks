import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Q } from "@nozbe/watermelondb";
import { withObservables } from "@nozbe/watermelondb/react";
import React from "react";
import { User, User_Wild } from "../watermelon/models";
import WildAvatar from "../components/Wilds/WildAvatar";
import { darkTheme, lightTheme } from "../theme";
import { useTheme } from "../contexts/ThemeProvider";

interface Props {
  navigation: any;
  user: User;
  activeWilds?: User_Wild[];
}

type SessionSelection = "solo" | "group";

const SessionTypeScreen = ({ navigation, user, activeWilds = [] }: Props) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [selection, setSelection] = React.useState<SessionSelection>("solo");

  const currentWild = activeWilds[0]?.wildId ?? "scout";
  const isSoloSelected = selection === "solo";

  function handleSelection() {
    if (selection === "solo") {
      navigation.navigate("Solo", { user });
      return;
    }

    navigation.navigate("Group", { user });
  }

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={styles.container}
      testID="session-type-screen">
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Trail Tasks Session</Text>
        <Text style={styles.title}>Choose your session</Text>
        <Text style={styles.subtitle}>Pick how you want to move your trail forward today.</Text>

        <View style={styles.avatarStage}>
          {isSoloSelected ? (
            <WildAvatar id={currentWild} pose="wave" size={180} animated />
          ) : (
            <View style={styles.groupWildsContainer}>
              <WildAvatar id="ember" pose="wave" size={96} animated />
              <WildAvatar id={currentWild} pose="still" size={108} animated />
              <WildAvatar id="scout" pose="wave" size={96} animated />
            </View>
          )}
        </View>
      </View>

      <View style={styles.choiceList}>
        <SessionChoiceCard
          description="Focus mode for today’s hike, trail progress, and rewards."
          isSelected={isSoloSelected}
          meta="Supported MVP path"
          onPress={() => setSelection("solo")}
          styles={styles}
          title="Solo Trek"
        />
        <SessionChoiceCard
          description="Coming soon: message-bus powered group sessions."
          isSelected={!isSoloSelected}
          meta="Post-MVP architecture work"
          onPress={() => setSelection("group")}
          styles={styles}
          title="Group Hike"
        />
      </View>

      <Pressable onPress={handleSelection} style={styles.goButton}>
        <Text style={styles.goButtonText}>
          {isSoloSelected ? "Start Solo Session" : "Preview Group Sessions"}
        </Text>
      </Pressable>
    </ScrollView>
  );
};

type SessionChoiceCardProps = {
  description: string;
  isSelected: boolean;
  meta: string;
  onPress: () => void;
  styles: ReturnType<typeof getStyles>;
  title: string;
};

const SessionChoiceCard = ({
  description,
  isSelected,
  meta,
  onPress,
  styles,
  title,
}: SessionChoiceCardProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.choiceCard,
      isSelected && styles.choiceCardSelected,
      pressed && styles.choiceCardPressed,
    ]}>
    <View style={styles.choiceHeader}>
      <Text style={styles.choiceTitle}>{title}</Text>
      <View style={[styles.selectionPill, isSelected && styles.selectionPillSelected]}>
        <Text style={[styles.selectionPillText, isSelected && styles.selectionPillTextSelected]}>
          {isSelected ? "Selected" : "Tap to choose"}
        </Text>
      </View>
    </View>
    <Text style={styles.choiceDescription}>{description}</Text>
    <Text style={styles.choiceMeta}>{meta}</Text>
  </Pressable>
);

const enhance = withObservables(["user"], ({ user }: Props) => ({
  activeWilds: user.usersWilds.extend(Q.where("is_active", true), Q.take(1)).observe(),
}));

const EnhancedSessionTypeScreen = enhance(SessionTypeScreen);

export { SessionTypeScreen };
export default EnhancedSessionTypeScreen;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.background,
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      padding: 20,
    },
    heroCard: {
      alignItems: "center",
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 28,
      borderWidth: 1,
      marginBottom: 18,
      paddingHorizontal: 20,
      paddingTop: 22,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 18,
      elevation: 8,
    },
    eyebrow: {
      color: theme.button,
      fontSize: 12,
      fontWeight: "800",
      letterSpacing: 1.1,
      textTransform: "uppercase",
    },
    title: {
      color: theme.text,
      fontSize: 30,
      fontWeight: "900",
      marginTop: 8,
      textAlign: "center",
    },
    subtitle: {
      color: theme.secondaryText,
      fontSize: 15,
      lineHeight: 22,
      marginTop: 8,
      maxWidth: 300,
      textAlign: "center",
    },
    avatarStage: {
      alignItems: "center",
      justifyContent: "center",
      minHeight: 190,
      width: "100%",
    },
    groupWildsContainer: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      width: "100%",
    },
    choiceList: {
      gap: 12,
      marginBottom: 18,
    },
    choiceCard: {
      backgroundColor: theme.inputBackground,
      borderColor: theme.border,
      borderRadius: 22,
      borderWidth: 1,
      padding: 18,
    },
    choiceCardSelected: {
      borderColor: theme.button,
      borderWidth: 2,
    },
    choiceCardPressed: {
      opacity: 0.82,
      transform: [{ scale: 0.99 }],
    },
    choiceHeader: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    choiceTitle: {
      color: theme.text,
      fontSize: 20,
      fontWeight: "900",
    },
    selectionPill: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    selectionPillSelected: {
      backgroundColor: theme.button,
      borderColor: theme.button,
    },
    selectionPillText: {
      color: theme.secondaryText,
      fontSize: 11,
      fontWeight: "800",
    },
    selectionPillTextSelected: {
      color: "#000000",
    },
    choiceDescription: {
      color: theme.text,
      fontSize: 15,
      lineHeight: 21,
    },
    choiceMeta: {
      color: theme.secondaryText,
      fontSize: 12,
      fontWeight: "700",
      marginTop: 10,
    },
    goButton: {
      alignItems: "center",
      backgroundColor: theme.button,
      borderRadius: 18,
      paddingVertical: 16,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
    goButtonText: {
      color: "#000000",
      fontSize: 16,
      fontWeight: "900",
      letterSpacing: 0.3,
    },
  });
