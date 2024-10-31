import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import React from 'react';
import addonImages from '../../helpers/Addons/addonImages';
import withObservables from '@nozbe/with-observables';

const AddonListItem = ({userAddon, selectAddon, addon}) => {

  return (
    <TouchableOpacity onPress={() => selectAddon(addon)}>
      <View style={styles.container}>
      <Image source={addonImages[addon?.name.replace(/\s/g, '')]} style={{width: 75, height: 75}} />
      <View style={styles.addonTitle}>
        <Text style={styles.addonName}>{addon.name}</Text>
        <Text>Owned: {userAddon.quantity}</Text>
        <Text style={styles.addonDescription}>{addon.description}</Text>
      </View>
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
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    flexwrap: 'wrap',
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 10,
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  addonTitle: {
    display: 'flex',
    width: '100%',
    alignItems: 'flex-start',
  },
  addonDescription: {
  display: 'flex',
    flexDirection: 'row',
    width: '75%',
    flexWrap: 'wrap',
    fontSize: 12,
    color: 'black',
  },
  addonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
});
