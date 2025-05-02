import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import React from 'react';
import addonImages from '../../helpers/Addons/addonImages';
import {withObservables} from '@nozbe/watermelondb/react';

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
    flexDirection: 'row',
    backgroundColor: 'rgb(31, 33, 35)',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
    gap: 12,
  },
  addonTitle: {
    flex: 1,
    justifyContent: 'center',
  },
  addonName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgb(7, 254, 213)',
    marginBottom: 4,
  },
  addonDescription: {
    fontSize: 12,
    color: 'rgba(221, 224, 226, 0.75)',
    flexWrap: 'wrap',
  },
});

