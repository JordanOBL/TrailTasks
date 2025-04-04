import { FlatList, SafeAreaView, StyleSheet, Text, View, Alert } from 'react-native';
import React, { useState } from 'react';
import {sync} from '../watermelon/sync';
import {useDatabase} from '@nozbe/watermelondb/react';
import {useInternetConnection} from '../hooks/useInternetConnection';
import EnhancedAddOnStore from '../components/AddOnStore/AddOnStore';
import handleError from "../helpers/ErrorHandler";
import useAddons from '../helpers/Addons/useAddons';
import {withObservables} from '@nozbe/watermelondb/react';
import handleAddonPurchase from '../helpers/Addons/handleAddonPurchase';

const AddOnStoreScreen = ({user, userAddons}) => {
  const {addons, loading, error} = useAddons();
  const watermelondb = useDatabase();
  const {isConnected} = useInternetConnection();

  if (loading) {
    return <Text>Loading Add-Ons...</Text>;
  }
  if (error) {
    return <Text>Error loading Add-Ons: {error}</Text>;
  }

  async function handleAddonPurchase(addon) {
    try {
      let successMessage = await user.buyAddon(addon);
      if(successMessage){
        await sync(watermelondb, isConnected, user.id)
      }
      Alert.alert('Success', successMessage);
    } catch (err) {
      Alert.alert('Purchase Failed', err.message);
    }
  }
  return (
    <SafeAreaView style={styles.container}>
      <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around', padding: 10}}>
        <Text style={styles.tokens}>Trail Tokens: {user.trailTokens}</Text>
        <Text style={styles.miles}>Total Miles: {user.totalMiles}</Text>
      </View>
      <EnhancedAddOnStore availableAddOns={addons} usersAddons={userAddons} user={user} onPurchase={handleAddonPurchase} />
    </SafeAreaView>
  );
};
const enhance = withObservables(['user', 'userAddons'], ({user}) => ({
  user,
  userAddons: user.usersAddons,
}));

const EnhancedAddOnStoreScreen = enhance(AddOnStoreScreen);

export default EnhancedAddOnStoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgb(18, 19, 21)',
    marginBottom: 50
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  miles: {
    fontSize: 16,
    color: 'white',
  },
  tokens: {
    fontSize: 16,
    color: 'gold',
  }
});
