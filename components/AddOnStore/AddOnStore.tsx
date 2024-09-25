import React from 'react';
import { View, Text, Button, StyleSheet, FlatList, SafeAreaView, Image} from 'react-native';
import withObservables from '@nozbe/with-observables';
import addonImages from '../../helpers/Addons/addonImages';
const AddOnStore = ({ availableAddOns, user, onPurchase, usersAddons }) => {
// Import your images using `require`


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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addonItem: {
    padding: 15,
    backgroundColor: '#000',
    marginBottom: 10,
    borderRadius: 8,
    borderColor: 'cyan',
    borderWidth: 1,
  },
  addonName: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#fff',
  },
  addonDescription: {
    textAlign: 'center',
    letterSpacing: 1,
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  addonCost: {
    fontSize: 14,
    color: 'gold',
    textAlign: 'center',
  },
});
