import React from 'react';
import { useAuthContext } from '../services/AuthContext';
import { useTheme } from '../contexts/ThemeProvider';
import RestorePurchasesButton from '../components/RevenueCat/RestorePurchasesButton';
import { Platform, Linking, TouchableOpacity, View, StyleSheet, Text } from 'react-native';


const SubscriptionSettingsScreen = ({navigation}) => {
  const { customerInfo, currentOffering, isProMember } = useAuthContext();

  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subscription Status</Text>
      <Text style={styles.status}>
        {isProMember ? '✅ You are a Trail Tasks Pro Member' : '🔒 You are currently on the free plan'}
      </Text>
      <View style={styles.card}>
        <Text style={styles.heading}>Current Plan</Text>
        {isProMember ? (
          <>
            <Text style={styles.detail}>✅ Active</Text>
            <Text style={styles.detail}>
              {customerInfo?.activeSubscriptions[0]} 
            </Text>
            <Text style={styles.detail}>
              {currentOffering?.monthly?.product.priceString || ''} / month
            </Text>
            <Text style={styles.detail}>
              Renews: {new Date(customerInfo?.latestExpirationDate || '').toDateString()}
            </Text> 
            <RestorePurchasesButton />

            {customerInfo?.managementURL && (
              <TouchableOpacity
                style={styles.manageButton}
                onPress={() => Linking.openURL(customerInfo.managementURL)}
              >
                <Text style={styles.manageButtonText}>
                  {Platform.OS === 'ios' ? 'Manage on App Store' : 'Manage on Google Play'}
                </Text>
              </TouchableOpacity>
            )}

          </>
        ) : (
            <>
              <Text style={styles.detail}>You don’t have an active subscription.</Text>

              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={() => navigation.navigate('Subscribe')}
              >
                <Text style={styles.subscribeButtonText}>Subscribe to Trail Tasks Pro</Text>
              </TouchableOpacity>
            </>
          )}
      </View>
    </View>
  );
};
const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
   container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 10,
    },
    status: {
      fontSize: 16,
      color: theme.secondaryText,
      marginBottom: 20,
    },    
    card: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.card,
      marginBottom: 20,
    },
    heading: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    detail: {
      fontSize: 16,
      color: theme.secondaryText,
      marginBottom: 4,
    },
    manageButton: {
      backgroundColor: theme.button,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    manageButtonText: {
      color: theme.buttonText,
      fontWeight: '600',
    },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: 'gold',
      borderRadius: 6,
      alignSelf: 'flex-start',
    },
    badgeText: {
      fontWeight: 'bold',
      color: 'black',
    },subscribeButton: {
  marginTop: 12,
  backgroundColor: '#008080', // or theme.button
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderRadius: 10,
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 3,
},
subscribeButtonText: {
  color: 'white',
  fontWeight: '600',
  fontSize: 16,
},
  });


export default SubscriptionSettingsScreen;

