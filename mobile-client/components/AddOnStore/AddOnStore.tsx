import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image } from "react-native";
import { withObservables } from "@nozbe/watermelondb/react";
import addonImages from "../../helpers/Addons/addonImages";
import { useTheme } from "../../contexts/ThemeProvider";
import { Addon, User, User_Addon } from "../../watermelon/models";
import { darkTheme, lightTheme } from "../../theme";

interface AddonStoreProps {
  availableAddOns: Addon[];
  user: User;
  totalMiles: number;
  tokenBalance: number;
  onPurchase: (item: Addon) => void;
  usersAddons: User_Addon[];
}

export const AddOnStore = ({
  availableAddOns,
  totalMiles,
  tokenBalance,
  onPurchase,
  usersAddons,
}: AddonStoreProps) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.container}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        data={availableAddOns}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.addonName}>No add-ons yet</Text>
            <Text style={styles.addonDescription}>Check back soon for more trail essentials.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const canBuy = totalMiles >= item.requiredTotalMiles && tokenBalance >= item.price;
          const requirement =
            totalMiles < item.requiredTotalMiles
              ? `You need ${(item.requiredTotalMiles - totalMiles).toFixed(2)} more miles`
              : `You need ${item.price - tokenBalance} more tokens`;

          return (
            <View style={styles.addonItem}>
              <View style={styles.itemHeader}>
                <Image
                  source={addonImages[item.name.replace(/\s/g, "")]}
                  style={styles.image}
                  accessibilityIgnoresInvertColors
                />
                <View style={styles.metaContainer}>
                  <Text style={styles.addonName}>{item.name}</Text>
                  <Text style={styles.addonCost}>{item.price} Trail Tokens</Text>
                  <Text style={styles.owned}>
                    Owned: {usersAddons.find(addon => addon.addonId === item.id)?.quantity || 0}
                  </Text>
                </View>
              </View>
              <Text style={styles.addonDescription}>
                {item.description.slice(0, item.description.length - 1)} by {item.effectValue}
              </Text>
              {!canBuy && <Text style={styles.requirement}>{requirement}</Text>}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Buy ${item.name} for ${item.price} Trail Tokens`}
                accessibilityHint={canBuy ? undefined : requirement}
                accessibilityState={{ disabled: !canBuy }}
                style={[
                  styles.buyButton,
                  { backgroundColor: canBuy ? theme.button : theme.border },
                ]}
                disabled={totalMiles < item.requiredTotalMiles || tokenBalance < item.price}
                onPress={() => onPurchase(item)}>
                <Text
                  style={[
                    styles.buyButtonText,
                    { color: canBuy ? theme.buttonText : theme.secondaryText },
                  ]}>
                  {canBuy ? "Buy Now" : "Locked"}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
};

const enhance = withObservables(["user", "userAddons"], ({ user }) => ({
  user,
  usersAddons: user.usersAddons.observe(),
}));

const EnhancedAddOnStore = enhance(AddOnStore);
export default EnhancedAddOnStore;

const getStyles = (theme: typeof darkTheme | typeof lightTheme) =>
  StyleSheet.create({
    container: { flex: 1, minHeight: 0, backgroundColor: theme.background },
    content: { paddingBottom: 16, gap: 12 },
    addonItem: {
      backgroundColor: theme.card,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 12,
    },
    itemHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
    image: { width: 64, height: 64, resizeMode: "contain" },
    metaContainer: { flex: 1, minWidth: 0, gap: 4 },
    addonName: { fontSize: 17, fontWeight: "600", color: theme.text },
    addonCost: { fontSize: 14, fontWeight: "600", color: theme.button },
    owned: { fontSize: 12, color: theme.secondaryText },
    addonDescription: { color: theme.secondaryText, fontSize: 14, lineHeight: 20 },
    requirement: { color: theme.secondaryText, fontSize: 13, lineHeight: 18 },
    buyButton: {
      minHeight: 44,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    buyButtonText: { fontWeight: "600", fontSize: 14 },
    empty: {
      padding: 24,
      gap: 8,
      borderRadius: 16,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
  });
