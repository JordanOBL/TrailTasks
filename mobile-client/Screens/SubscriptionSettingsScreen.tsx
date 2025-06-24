import React from 'react';
import { useAuthContext } from '../services/AuthContext';
import { useTheme } from '../contexts/ThemeProvider';
import RestorePurchasesButton from '../components/RevenueCat/RestorePurchasesButton';
import { Platform, Linking, TouchableOpacity, View, StyleSheet, Text } from 'react-native';

const SubscriptionSettingsScreen = ({ navigation }) => {
  const { customerInfo, currentOffering, isProMember } = useAuthContext();
  const { theme } = useTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Subscription</Text>
      <Text style={styles.subHeader}>
        {isProMember
          ? '✅ Trail Tasks Pro is active on your account.'
          : '🔒 Upgrade to Trail Tasks Pro to unlock all features.'}
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Plan Details</Text>

        {isProMember ? (
          <>
            <Text style={styles.detail}>Status: ✅ Active</Text>
            <Text style={styles.detail}>Plan: {customerInfo?.activeSubscriptions[0]}</Text>
            <Text style={styles.detail}>
              Price: {currentOffering?.monthly?.product.priceString || ''} / month
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
            <Text style={styles.detail}>No active subscription.</Text>
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

export default SubscriptionSettingsScreen;
const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 24,
    },
    header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subHeader: {
      fontSize: 16,
      color: theme.secondaryText,
      marginBottom: 24,
      textAlign: 'center',
    },
    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      shadowColor: theme.shadow || '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 12,
    },
    detail: {
      fontSize: 15,
      color: theme.secondaryText,
      marginBottom: 6,
    },
    manageButton: {
      marginTop: 16,
      backgroundColor: theme.button,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    manageButtonText: {
      color: theme.buttonText,
      fontWeight: '600',
      fontSize: 15,
    },
    subscribeButton: {
      marginTop: 16,
      backgroundColor: '#008080',
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    subscribeButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });

