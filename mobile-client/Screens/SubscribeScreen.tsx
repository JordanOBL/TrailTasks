import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuthContext } from '../services/AuthContext';
import SubscriptionOptionCard from '../components/RevenueCat/SubscriptionOptionCard';
import Purchases from 'react-native-purchases';
import { useTheme } from '../contexts/ThemeProvider';

const SubscribeScreen = ({ navigation }) => {
  const { currentOffering, isProMember } = useAuthContext();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [selectedPackage, setSelectedPackage] = useState(null);
const FEATURES = [
  'Access All Trails',
  'Use Trail Queue Feature',
  'Pomdoro Time Selections',
  'Multiple Session Tracking Filters',
  'Complete Sessions With Friends in Group Sessions',  
  'Access All Leaderboards',
  'Priority Support'
];

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    try {
      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);
      if (
        customerInfo.entitlements.active &&
        Object.keys(customerInfo.entitlements.active).length > 0
      ) {
        Alert.alert('🎉 Success!', 'You are now a Trail Tasks Pro member.');
        navigation.goBack();
      }
    } catch (err) {
      console.warn('❌ Purchase error:', err);
      Alert.alert('Error', err.message || 'Something went wrong.');
    }
  };

  if (!currentOffering) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={theme.button} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.emoji}>⛰️</Text>
      <Text style={styles.header}>Unlock Trail Tasks Pro</Text>
      <Text style={styles.subHeader}>
        Access all features, support development, and hike in style 
      </Text>
      <View style={styles.featureList}>
        {FEATURES.map((item, index) => (
          <Text key={index} style={styles.featureItem}>• {item}</Text>
        ))}
      </View>
{currentOffering.annual && (
        <SubscriptionOptionCard
          product={currentOffering.annual.product}
          isPopular={true}
          selected={selectedPackage?.identifier === currentOffering.annual.identifier}
          onPress={() => setSelectedPackage(currentOffering.annual)}
        />
      )}
      {currentOffering.monthly && (
        <SubscriptionOptionCard
          product={currentOffering.monthly.product}
          isPopular={false}
          selected={selectedPackage?.identifier === currentOffering.monthly.identifier}
          onPress={() => setSelectedPackage(currentOffering.monthly)}
        />
      )}

      

      {selectedPackage && (
        <TouchableOpacity style={styles.subscribeButton} onPress={handlePurchase}>
          <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      padding: 20,
      paddingBottom: 80,
      backgroundColor: theme.background,
      alignItems: 'center',
    },
    loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    emoji: {
      fontSize: 40,
      marginTop: 10,
      marginBottom: 6,
    },
     featureList: {
      alignItems: 'flex-start',
      width: '100%',
      marginBottom: 20,
    },
    featureItem: {
      color: theme.text,
      fontSize: 14,
      marginBottom: 6,
    },
    header: {
      fontSize: 24,
      color: theme.text,
      fontWeight: 'bold',
      marginBottom: 6,
      textAlign: 'center',
    },
    subHeader: {
      color: theme.secondaryText,
      fontSize: 14,
      marginBottom: 20,
      textAlign: 'center',
    },
    subscribeButton: {
      marginTop: 20,
      backgroundColor: theme.button,
      paddingVertical: 14,
      paddingHorizontal: 40,
      borderRadius: 20,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 4,
    },
    subscribeButtonText: {
      color: theme.buttonText,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default SubscribeScreen;

