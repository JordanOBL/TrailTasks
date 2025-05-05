import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, SafeAreaView, Image } from 'react-native';
import { withObservables } from '@nozbe/watermelondb/react';
import addonImages from '../../helpers/Addons/addonImages';
import { useTheme } from '../../contexts/ThemeProvider';

const AddOnStore = ({ availableAddOns, user, onPurchase, usersAddons }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={availableAddOns}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.addonItem}>
            <Image source={addonImages[item.name.replace(/\s/g, '')]} style={styles.image} />
            <View style={styles.metaContainer}>
              <Text style={styles.addonName}>{item.name}</Text>
              <Text style={styles.addonCost}>Cost: {item.price}</Text>
              <Text style={[styles.addonName, { fontSize: 12 }]}>
                Owned: {usersAddons.find(addon => addon.addonId === item.id)?.quantity || 0}
              </Text>
            </View>
            <Text style={styles.addonDescription}>
              {item.description.slice(0, item.description.length - 1)} by {item.effectValue}
            </Text>
            <TouchableOpacity
  style={[
    styles.buyButton,
    {
      backgroundColor:
        user.totalMiles >= item.requiredTotalMiles && user.trailTokens >= item.price
          ? theme.button
          : theme.border,
    },
  ]}
  disabled={user.totalMiles < item.requiredTotalMiles || user.trailTokens < item.price}
  onPress={() => onPurchase(item)}
>
  <Text style={styles.buyButtonText}>
    {
      user.totalMiles >= item.requiredTotalMiles && user.trailTokens >= item.price
        ? 'Buy Now'
        : user.totalMiles < item.requiredTotalMiles
          ? `You need ${(item.requiredTotalMiles - user.totalMiles).toFixed(2)} more miles`
          : `You need ${item.price - user.trailTokens} more tokens`
    }
  </Text>
</TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const enhance = withObservables(['user', 'userAddons'], ({ user }) => ({
  user,
  usersAddons: user.usersAddons.observe(),
}));

const EnhancedAddOnStore = enhance(AddOnStore);
export default EnhancedAddOnStore;

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    addonItem: {
      backgroundColor: theme.card,
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
    image: {
      width: 200,
      height: 200,
      alignSelf: 'center',
    },
    metaContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    addonName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.button,
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
      color: theme.secondaryText,
      fontSize: 14,
      textAlign: 'center',
      marginVertical: 8,
    },
    buyButton: {
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 10,
},
buyButtonText: {
  color: theme.buttonText,
  fontWeight: '600',
  fontSize: 16,
},

  });

