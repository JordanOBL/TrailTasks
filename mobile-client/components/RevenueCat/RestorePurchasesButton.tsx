import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../contexts/ThemeProvider';
import { useAuthContext } from '../../services/AuthContext';
import { darkTheme, lightTheme } from '../../theme';

const RestorePurchasesButton = () => {
  const { theme } = useTheme();
  const { restorePurchases, revenueCatConfigured, revenueCatLoading } = useAuthContext();
  const styles = getStyles(theme);
  const [loading, setLoading] = React.useState(false);
  const restoreUnavailable = revenueCatLoading || !revenueCatConfigured;
  const disabled = loading || restoreUnavailable;

  const handleRestore = async () => {
    try {
      setLoading(true);
      const customerInfo = await restorePurchases();

      const hasActive = !!customerInfo?.entitlements?.active?.pro;

      if (hasActive) {
        Alert.alert('✅ Restored', 'Your purchases have been restored!');
      } else {
        Alert.alert('ℹ️ No Subscriptions', 'No active subscriptions were found.');
      }
    } catch (error) {
      Alert.alert('⚠️ Error', error instanceof Error ? error.message : 'Something went wrong while restoring purchases.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleRestore}
      style={[styles.button, disabled && styles.disabledButton]}
      disabled={disabled}
      testID="restore-purchases-button">
      {loading ? (
        <ActivityIndicator color={theme.background} />
      ) : (
        <Text style={styles.text}>{restoreUnavailable ? 'Restore unavailable' : 'Restore Purchases'}</Text>
      )}
    </TouchableOpacity>
  );
};

const getStyles = (theme: typeof darkTheme | typeof lightTheme) =>
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
    disabledButton: {
      opacity: 0.55,
    },
  });

export default RestorePurchasesButton;
