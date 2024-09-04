import React from 'react';
import { View, Text, Button, StyleSheet, FlatList, SafeAreaView} from 'react-native';
import withObservables from '@nozbe/with-observables';
const AddOnStore = ({ availableAddOns, user, onPurchase, usersAddons }) => {
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={availableAddOns}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.addonItem}>
            <View style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={styles.addonName }>{item.name}</Text>
              <Text>Owned: {usersAddons.filter(addon => addon.addonId === item.id)[0]?.quantity || 0}</Text>
            </View>
            <Text style={styles.addonDescription}>{item.description.slice(0, item.description.length - 1)} by {item.effect_value}</Text>
            <Text style={styles.addonCost}>Cost: {item.price} Trail Tokens</Text>
            <Button
              title={user.totalMiles >= item.requiredTotalMiles && user.trailTokens >= item.price ? 'Buy Now' : user.totalMiles < item.requiredTotalMiles ? `You need ${item.requiredTotalMiles - user.totalMiles} more miles` : `You need ${item.price - user.trailTokens} more tokens` }
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
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  addonName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addonDescription: {
    fontSize: 14,
    color: '#666',
    marginVertical: 5,
  },
  addonCost: {
    fontSize: 16,
    marginBottom: 10,
  },
});
