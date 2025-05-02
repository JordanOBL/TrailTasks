import React from 'react';
import { View, Text, Button, StyleSheet, FlatList, SafeAreaView, Image} from 'react-native';
import {withObservables} from '@nozbe/watermelondb/react';
import addonImages from '../../helpers/Addons/addonImages';
const AddOnStore = ({ availableAddOns, user, onPurchase, usersAddons }) => {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={availableAddOns}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.addonItem}>
            <Image source={addonImages[item.name.replace(/\s/g, '')]} style={{width: 200, height: 200, alignSelf: 'center'}} />
            <View style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={styles.addonName }>{item.name}</Text>
            <Text style={styles.addonCost}>Cost: {item.price}</Text>
              <Text style={[styles.addonName, {fontSize: 12}] }>Owned: {usersAddons.filter(addon => addon.addonId === item.id)[0]?.quantity || 0}</Text>
            </View>
            <Text style={styles.addonDescription}>{item.description.slice(0, item.description.length - 1)} by {item.effectValue}</Text>
            <Button
              title={user.totalMiles >= item.requiredTotalMiles && user.trailTokens >= item.price ? 'Buy Now' : user.totalMiles < item.requiredTotalMiles ? `You need ${(item.requiredTotalMiles - user.totalMiles).toFixed(2)} more miles` : `You need ${item.price - user.trailTokens} more tokens` }
              onPress={() => onPurchase(item)}
              disabled={user.totalMiles < item.requiredTotalMiles || user.trailTokens < item.price}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const enhance = withObservables(['user', 'userAddons'], ({user, userAddons}) => ({
  user,
  userAddons: user.usersAddons,
}))

const EnhancedAddOnStore = enhance(AddOnStore);

export default EnhancedAddOnStore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgb(18, 19, 21)',
    padding: 16,
  },
  addonItem: {
    backgroundColor: 'rgb(31, 33, 35)',
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    alignItems: 'center',
  },
  addonName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'rgb(7, 254, 213)',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  addonCost: {
    fontSize: 14,
    color: 'gold',
    marginBottom: 4,
  },
  addonDescription: {
    color: 'rgba(221, 224, 226, 0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
  },
});

