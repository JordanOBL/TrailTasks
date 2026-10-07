import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import FullTrailDetails from "../../types/fullTrailDetails";
import {
  calculateActiveWildXpReward,
  calculateCompletedTrailRewardTokens,
  calculateTrailUnlockCost,
} from "../../helpers/Trails/trailEconomy";
import { darkTheme, lightTheme } from "../../theme";
import { useTheme } from "../../contexts/ThemeProvider";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  trail: FullTrailDetails;
  trailTokens?: number;
  onBuyTrail: (trail: FullTrailDetails, cost: number) => void;
}

const BuyTrailModal = ({ isVisible, onClose, trail, trailTokens = 0, onBuyTrail }: Props) => {
  const [error, setError] = useState("");
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const unlockCost = calculateTrailUnlockCost(trail.trail_distance);
  const completionReward = calculateCompletedTrailRewardTokens(trail.trail_distance);
  const wildXpReward = calculateActiveWildXpReward(trail.trail_distance);
  const tokenBalanceAfterPurchase = trailTokens - unlockCost;

  const close = () => {
    setError("");
    onClose();
  };

  const handleBuyTrail = () => {
    if (trailTokens >= unlockCost) {
      onBuyTrail(trail, unlockCost);
      close();
    } else {
      setError(`You need ${unlockCost - trailTokens} more trail tokens.`);
    }
  };

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.modalView}>
          <Text style={styles.eyebrow}>Unlock trail</Text>
          <Text style={styles.title} numberOfLines={2}>
            {trail.trail_name}
          </Text>
          <Text style={styles.description}>
            Spend {unlockCost} tokens now. Completing this trail earns at least {completionReward} tokens,
            plus time rewards and {wildXpReward} Wild XP.
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Cost</Text>
              <Text style={styles.summaryValue}>{unlockCost}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Complete</Text>
              <Text style={styles.summaryValue}>+{completionReward}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Balance</Text>
              <Text style={styles.summaryValue}>{Math.max(0, tokenBalanceAfterPurchase)}</Text>
            </View>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <View style={styles.buttonsContainer}>
            <Pressable style={[styles.button, styles.buttonCancel]} onPress={close}>
              <Text style={[styles.buttonText, styles.cancelText]}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.buttonBuy]} onPress={handleBuyTrail}>
              <Text style={styles.buttonText}>Unlock</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    backdrop: {
      alignItems: "center",
      backgroundColor: theme.modalBackground ?? "rgba(0,0,0,0.55)",
      flex: 1,
      justifyContent: "center",
      padding: 20,
    },
    modalView: {
      backgroundColor: theme.modalCard ?? theme.card,
      borderColor: theme.border,
      borderRadius: 22,
      borderWidth: 1,
      padding: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.22,
      shadowRadius: 20,
      width: "100%",
      maxWidth: 420,
      elevation: 6,
    },
    eyebrow: {
      color: theme.secondaryText,
      fontSize: 11,
      fontWeight: "900",
      letterSpacing: 0.7,
      marginBottom: 6,
      textTransform: "uppercase",
    },
    title: {
      color: theme.text,
      fontSize: 22,
      fontWeight: "900",
      letterSpacing: -0.25,
      lineHeight: 27,
    },
    description: {
      color: theme.secondaryText,
      fontSize: 14,
      fontWeight: "700",
      lineHeight: 20,
      marginTop: 10,
    },
    summaryRow: {
      alignItems: "center",
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderRadius: 16,
      borderWidth: 1,
      flexDirection: "row",
      marginTop: 16,
      paddingVertical: 12,
    },
    summaryItem: {
      alignItems: "center",
      flex: 1,
      minWidth: 0,
    },
    summaryDivider: {
      backgroundColor: theme.border,
      height: 32,
      width: 1,
    },
    summaryLabel: {
      color: theme.secondaryText,
      fontSize: 10,
      fontWeight: "900",
      letterSpacing: 0.45,
      textTransform: "uppercase",
    },
    summaryValue: {
      color: theme.text,
      fontSize: 18,
      fontWeight: "900",
      marginTop: 3,
    },
    errorText: {
      color: "#ff6b6b",
      fontSize: 13,
      fontWeight: "800",
      marginTop: 12,
      textAlign: "center",
    },
    buttonsContainer: {
      flexDirection: "row",
      gap: 10,
      marginTop: 18,
    },
    button: {
      alignItems: "center",
      borderRadius: 16,
      flex: 1,
      paddingVertical: 13,
    },
    buttonCancel: {
      backgroundColor: "transparent",
      borderColor: theme.border,
      borderWidth: 1,
    },
    buttonBuy: {
      backgroundColor: theme.button,
    },
    buttonText: {
      color: theme.buttonText,
      fontSize: 15,
      fontWeight: "900",
    },
    cancelText: {
      color: theme.text,
    },
  });

export default BuyTrailModal;
