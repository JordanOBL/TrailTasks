import { Addon, User, User_Session } from "../watermelon/models";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";

import EnhancedAddOnStore from "../components/AddOnStore/AddOnStore";
//import handleAddonPurchase from '../helpers/Addons/handleAddonPurchase';
import handleError from "../helpers/ErrorHandler";
import { sync } from "../watermelon/sync";
import useAddons from "../helpers/Addons/useAddons";
import { useDatabase } from "@nozbe/watermelondb/react";
import { useInternetConnection } from "../contexts/InternetConnectionProvider";
import { useTheme } from "../contexts/ThemeProvider";
import { withObservables } from "@nozbe/watermelondb/react";

const AddOnStoreScreen = ({
  user,
  userAddons,
  userSessions,
}: {
  user: User;
  userAddons: Addon[];
  userSessions: User_Session[];
}) => {
  const { addons, loading, error } = useAddons();
  const watermelondb = useDatabase();
  const { isConnected } = useInternetConnection();
  const { theme } = useTheme(); // 👈 use your theme context
  const [totalMiles, setTotalMiles] = useState(0);
  const [tokenBalance, setTokenBalance] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const computeTotalMiles = async () => {
      const calculatedTotalMiles = await user.calculateTotalMiles();

      if (isMounted) {
        setTotalMiles(calculatedTotalMiles);
      }
    };

    computeTotalMiles();

    return () => {
      isMounted = false;
    };
  }, [user, userSessions, watermelondb]);

  useEffect(() => {
    let isMounted = true;

    const computeTokenBalance = async () => {
      const calculatedTokenBalance = await user.calculateTrailTokenBalance();

      if (isMounted) {
        setTokenBalance(calculatedTokenBalance);
      }
    };

    computeTokenBalance();

    return () => {
      isMounted = false;
    };
  }, [user, userAddons, watermelondb]);

  async function handleAddonPurchase(addon: Addon) {
    try {
      let successMessage = await user.buyAddon(addon);
      if (successMessage) {
        await sync(watermelondb, isConnected, user.id);
      }
      Alert.alert("Success", successMessage);
    } catch (err) {
      Alert.alert("Purchase Failed");
    }
  }

  return (
    <View
      testID="addon-store-screen"
      style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.topBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text
          style={[styles.tokens, { color: theme.text }]}>{`Trail Tokens: ${tokenBalance}`}</Text>
        <Text
          style={[
            styles.miles,
            { color: theme.secondaryText },
          ]}>{`Total Miles: ${totalMiles.toFixed(2)}`}</Text>
      </View>
      {loading || error ? (
        <ScrollView
          style={styles.statusScroll}
          contentInsetAdjustmentBehavior="never"
          automaticallyAdjustContentInsets={false}>
          <View
            accessibilityLiveRegion="polite"
            style={[styles.status, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {loading && <ActivityIndicator color={theme.button} />}
            <Text style={[styles.tokens, { color: theme.text }]}>
              {loading ? "Loading add-ons…" : "Unable to load add-ons"}
            </Text>
            <Text style={[styles.statusDetail, { color: theme.secondaryText }]}>
              {loading
                ? "Getting the shop ready for your next trail."
                : `Error loading Add-Ons: ${error}`}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <EnhancedAddOnStore
          availableAddOns={addons}
          usersAddons={userAddons}
          user={user}
          totalMiles={totalMiles}
          tokenBalance={tokenBalance}
          onPurchase={handleAddonPurchase}
        />
      )}
    </View>
  );
};

const enhance = withObservables(["user", "userAddons"], ({ user }) => ({
  user,
  userAddons: user.usersAddons,
  userSessions: user.usersSessions,
}));

const EnhancedAddOnStoreScreen = enhance(AddOnStoreScreen);
export default EnhancedAddOnStoreScreen;

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 0, paddingHorizontal: 16, paddingTop: 12 },
  topBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: 14,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  tokens: { fontSize: 16, fontWeight: "600" },
  miles: { fontSize: 13 },
  statusScroll: { flex: 1, minHeight: 0 },
  status: { padding: 24, gap: 12, borderRadius: 16, borderWidth: 1, alignItems: "center" },
  statusDetail: { fontSize: 14, lineHeight: 20, textAlign: "center" },
});
