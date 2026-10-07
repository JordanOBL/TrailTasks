import { Addon, User, User_Session } from '../watermelon/models';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import EnhancedAddOnStore from '../components/AddOnStore/AddOnStore';
//import handleAddonPurchase from '../helpers/Addons/handleAddonPurchase';
import handleError from "../helpers/ErrorHandler";
import { sync } from '../watermelon/sync';
import useAddons from '../helpers/Addons/useAddons';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useInternetConnection } from '../contexts/InternetConnectionProvider';
import { useTheme } from '../contexts/ThemeProvider';
import { withObservables } from '@nozbe/watermelondb/react';

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

  if (loading) {
    return <Text style={{ color: theme.text }}>Loading Add-Ons...</Text>;
  }
  if (error) {
    return <Text style={{ color: theme.text }}>Error loading Add-Ons: {error}</Text>;
  }

  async function handleAddonPurchase(addon: Addon) {
    try {
      let successMessage = await user.buyAddon(addon);
      if (successMessage) {
        await sync(watermelondb, isConnected, user.id);
      }
      Alert.alert('Success', successMessage);
    } catch (err) {
      Alert.alert('Purchase Failed');
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.topBar]}>
        <Text style={[styles.tokens, { color: theme.button }]}>{`Trail Tokens: ${tokenBalance}`}</Text>
        <Text style={[styles.miles, { color: theme.text }]}>{`Total Miles: ${totalMiles.toFixed(2)}`}</Text>
      </View>
      <EnhancedAddOnStore
        availableAddOns={addons}
        usersAddons={userAddons}
        user={user}
        totalMiles={totalMiles}
        tokenBalance={tokenBalance}
        onPurchase={handleAddonPurchase}
      />
    </SafeAreaView>
  );
};

const enhance = withObservables(['user', 'userAddons'], ({ user }) => ({
  user,
  userAddons: user.usersAddons,
  userSessions: user.usersSessions,
}));

const EnhancedAddOnStoreScreen = enhance(AddOnStoreScreen);
export default EnhancedAddOnStoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  topBar: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  tokens: {
    fontSize: 16,
    fontWeight: '600',
  },
  miles: {
    fontSize: 16,
    fontWeight: '600',
  },
});

