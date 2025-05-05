import { FlatList, SafeAreaView, StyleSheet, Text, View, Alert } from 'react-native';
import React, { useState } from 'react';
import { sync } from '../watermelon/sync';
import { useDatabase } from '@nozbe/watermelondb/react';
import { useInternetConnection } from '../hooks/useInternetConnection';
import EnhancedAddOnStore from '../components/AddOnStore/AddOnStore';
import handleError from "../helpers/ErrorHandler";
import useAddons from '../helpers/Addons/useAddons';
import { withObservables } from '@nozbe/watermelondb/react';
import handleAddonPurchase from '../helpers/Addons/handleAddonPurchase';
import { useTheme } from '../contexts/ThemeProvider';

const AddOnStoreScreen = ({ user, userAddons }) => {
  const { addons, loading, error } = useAddons();
  const watermelondb = useDatabase();
  const { isConnected } = useInternetConnection();
  const { theme } = useTheme(); // 👈 use your theme context

  if (loading) {
    return <Text style={{ color: theme.text }}>Loading Add-Ons...</Text>;
  }
  if (error) {
    return <Text style={{ color: theme.text }}>Error loading Add-Ons: {error}</Text>;
  }

  async function handleAddonPurchase(addon) {
    try {
      let successMessage = await user.buyAddon(addon);
      if (successMessage) {
        await sync(watermelondb, isConnected, user.id);
      }
      Alert.alert('Success', successMessage);
    } catch (err) {
      Alert.alert('Purchase Failed', err.message);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.topBar]}>
        <Text style={[styles.tokens, { color: theme.button }]}>{`Trail Tokens: ${user.trailTokens}`}</Text>
        <Text style={[styles.miles, { color: theme.text }]}>{`Total Miles: ${user.totalMiles}`}</Text>
      </View>
      <EnhancedAddOnStore
        availableAddOns={addons}
        usersAddons={userAddons}
        user={user}
        onPurchase={handleAddonPurchase}
      />
    </SafeAreaView>
  );
};

const enhance = withObservables(['user', 'userAddons'], ({ user }) => ({
  user,
  userAddons: user.usersAddons,
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

