import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';
import Purchases from 'react-native-purchases';

const RestorePurchasesButton = () => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [loading, setLoading] = useState(false);

  const handleRestore = async () => {
    try {
      setLoading(true);
      const customerInfo = await Purchases.restorePurchases();

      const hasActive = Object.keys(customerInfo.entitlements.active || {}).length > 0;

      if (hasActive) {
        Alert.alert('✅ Restored', 'Your purchases have been restored!');
      } else {
        Alert.alert('ℹ️ No Subscriptions', 'No active subscriptions were found.');
      }
    } catch (error) {
      console.error('Restore Error:', error);
      Alert.alert('⚠️ Error', 'Something went wrong while restoring purchases.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity onPress={handleRestore} style={styles.button} disabled={loading}>
      {loading ? (
        <ActivityIndicator color={theme.background} />
      ) : (
        <Text style={styles.text}>Restore Purchases</Text>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    button: {
      marginTop: 20,
      backgroundColor: theme.button,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 5,
    },
    text: {
      color: theme.background,
      fontWeight: '600',
      fontSize: 16,
    },
  });

export default RestorePurchasesButton;

