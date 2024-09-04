import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import withObservables from '@nozbe/with-observables';

const AddonListItem = ({userAddon, selectAddon, addon}) => {

  return (
    <TouchableOpacity onPress={() => selectAddon(addon)}>
      <View style={styles.container}>
      <View style={styles.addonTitle}>
        <Text style={styles.addonName}>{addon.name}</Text>

        <Text>Owned: {userAddon.quantity}</Text>
      </View>
        <Text style={styles.addonDescription}>{addon.description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const enhance = withObservables(['userAddon', 'addon'], ({addon, userAddon}) => ({
  userAddon,
  addon:  userAddon.addon
}))

const EnhancedAddonListItem = enhance(AddonListItem);

export default EnhancedAddonListItem;

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  addonTitle: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
   },
  addonDescription: {
    fontSize: 12,
    color: 'black',
  },
  addonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});
