import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import addonImages from '../../helpers/Addons/addonImages';
import { withObservables } from '@nozbe/watermelondb/react';
import { useTheme } from '../../contexts/ThemeProvider';

const AddonListItem = ({ userAddon, selectAddon, addon }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <TouchableOpacity onPress={() => selectAddon(addon)}>
      <View style={styles.container}>
        <Image
          source={addonImages[addon?.name.replace(/\s/g, '')]}
          style={{ width: 75, height: 75 }}
        />
        <View style={styles.addonTitle}>
          <Text style={styles.addonName}>{addon.name}</Text>
          <Text style={styles.ownedText}>Owned: {userAddon.quantity}</Text>
          <Text style={styles.addonDescription}>{addon.description}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const enhance = withObservables(['userAddon', 'addon'], ({ addon, userAddon }) => ({
  userAddon,
  addon: userAddon.addon,
}));

const EnhancedAddonListItem = enhance(AddonListItem);
export default EnhancedAddonListItem;

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.card,
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
      color: 'rgb(7, 254, 213)', // Keep brand accent
      marginBottom: 4,
    },
    ownedText: {
      fontSize: 13,
      color: theme.text,
      marginBottom: 4,
    },
    addonDescription: {
      fontSize: 12,
      color: theme.secondaryText,
      flexWrap: 'wrap',
    },
  });

