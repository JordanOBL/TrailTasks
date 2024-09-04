import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView} from 'react-native';
import EnhancedAddOnStore from '../components/AddOnStore/AddOnStore.tsx';
import withObservables from '@nozbe/with-observables';
import useAddons from '../helpers/Addons/useAddons';
import handleError from "../helpers/ErrorHandler";
const AddOnStoreScreen = ({user, userAddons}) => {
  const {addons, loading, error} = useAddons();

  const handlePurchase = async (addOn) => {
    try {
      
    if (user.totalMiles >= addOn.requiredTotalMiles && user.trailTokens >= addOn.price) {
      //decrease user trail tokens
      //add addon to users_addons either full addon or update qty
      console.debug("purchasing addon");
      await user.buyAddon(addOn);
      console.debug("purchased addon");
      alert(`You purchased ${addOn.name}!`);
      return;
    }
    } catch (err) {
      handleError(err, "handlePurchase");
    }
  };

  if (loading) {
    return <Text>Loading Add-Ons...</Text>;
  }
  if (error) {
    return <Text>Error loading Add-Ons: {error.message}</Text>;
  }

  //console.log(addons);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Welcome to the Add-On Store</Text>
      <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-around'}}>
        <Text style={styles.miles}>Trail Tokens: {user.trailTokens}</Text>
        <Text style={styles.miles}>Total Miles: {user.totalMiles}</Text>
      </View>
      <EnhancedAddOnStore availableAddOns={addons} usersAddons={userAddons} user={user} onPurchase={handlePurchase} />   
    </SafeAreaView>
  );
};
const enhance = withObservables(['user', 'userAddons'], ({user, userAddons}) => ({
  user,
  userAddons: user.usersAddons,
}));

const EnhancedAddOnStoreScreen = enhance(AddOnStoreScreen);

export default EnhancedAddOnStoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    //backgroundColor: '#f5f5f5',
    backgroundColor: 'rgb(18, 19, 21)',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: 'white',
  },
  miles: {
    fontSize: 18,
    marginBottom: 20,
    color: 'white',
  },
  purchasedAddOns: {
    marginTop: 30,
  },
  addOnItem: {
    fontSize: 18,
    paddingVertical: 5,
  },
});
