import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useAuthContext } from "../services/AuthContext";
import RestorePurchasesButton from "../components/RevenueCat/RestorePurchasesButton";
import SubscriptionOptionCard from "../components/RevenueCat/SubscriptionOptionCard";
import { useTheme } from "../contexts/ThemeProvider";
import { darkTheme, lightTheme } from "../theme";

const SubscribeScreen = ({ navigation }: { navigation: any }) => {
  const {
    currentOffering,
    isProMember,
    revenueCatConfigured,
    revenueCatLoading,
    revenueCatError,
    purchasePackage,
  } = useAuthContext();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const purchasablePackages = React.useMemo(() => {
    if (!currentOffering) return [];

    const packages = [
      currentOffering.annual,
      currentOffering.monthly,
      ...(currentOffering.availablePackages || []),
    ].filter(Boolean);

    return Array.from(new Map(packages.map((pkg: any) => [pkg.identifier, pkg])).values());
  }, [currentOffering]);
  const selectedPackageIsAvailable = purchasablePackages.some(
    (pkg: any) => pkg.identifier === selectedPackage?.identifier,
  );
  const canPurchase = revenueCatConfigured && !revenueCatLoading && selectedPackageIsAvailable;
  const FEATURES = [
    "Access All Trails",
    "Use Trail Queue Feature",
    "Pomodoro Time Selections",
    "Multiple Session Tracking Filters",
    "Complete Sessions With Friends in Group Sessions",
    "Access All Leaderboards",
    "Priority Support",
  ];

  const handlePurchase = async () => {
    if (!selectedPackage || purchaseLoading || !canPurchase) return;

    try {
      setPurchaseLoading(true);
      const customerInfo = await purchasePackage(selectedPackage);
      if (customerInfo?.entitlements?.active && Object.keys(customerInfo.entitlements.active).length > 0) {
        Alert.alert("🎉 Success!", "You are now a Trail Tasks Pro member.");
        navigation.goBack();
      } else {
        Alert.alert(
          "Purchase complete",
          "RevenueCat did not return an active Pro entitlement yet. Restore purchases or try again in a moment.",
        );
      }
    } catch (err: any) {
      if (!err?.userCancelled) {
        Alert.alert("Error", err instanceof Error ? err.message : "Something went wrong.");
      }
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (isProMember) {
    return (
      <View style={styles.centerState} testID="subscribe-active-state">
        <Text style={styles.header}>Trail Tasks Pro is active</Text>
        <Text style={styles.subHeader}>Your Pro entitlement is already enabled on this account.</Text>
        <RestorePurchasesButton />
        <TouchableOpacity style={styles.subscribeButton} onPress={() => navigation.goBack()}>
          <Text style={styles.subscribeButtonText}>Back to Trail Tasks</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (revenueCatLoading && !currentOffering) {
    return (
      <View style={styles.centerState} testID="subscribe-loading-state">
        <ActivityIndicator size="large" color={theme.button} />
        <Text style={styles.stateText}>Loading subscription options…</Text>
      </View>
    );
  }

  if (revenueCatError) {
    return (
      <View style={styles.centerState} testID="subscribe-error-state">
        <Text style={styles.header}>Trail Tasks Pro is unavailable</Text>
        <Text style={styles.subHeader}>{revenueCatError}</Text>
        <RestorePurchasesButton />
      </View>
    );
  }

  if (purchasablePackages.length === 0) {
    return (
      <View style={styles.centerState} testID="subscribe-empty-state">
        <Text style={styles.header}>No subscription options available</Text>
        <Text style={styles.subHeader}>Please try again later or restore purchases from Subscription Settings.</Text>
        <RestorePurchasesButton />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} testID="subscribe-screen">
      <Text style={styles.emoji}>⛰️</Text>
      <Text style={styles.header}>Unlock Trail Tasks Pro</Text>
      <Text style={styles.subHeader}>
        Access all features, support development, and hike in style
      </Text>
      <View style={styles.featureList}>
        {FEATURES.map((item, index) => (
          <Text key={index} style={styles.featureItem}>
            • {item}
          </Text>
        ))}
      </View>
      {purchasablePackages.map((pkg: any, index: number) => (
        <SubscriptionOptionCard
          key={pkg.identifier}
          product={pkg.product}
          isPopular={pkg.identifier === currentOffering?.annual?.identifier || index === 0}
          selected={selectedPackage?.identifier === pkg.identifier}
          onPress={() => setSelectedPackage(pkg)}
        />
      ))}

      {selectedPackage && (
        <TouchableOpacity
          style={[styles.subscribeButton, (!canPurchase || purchaseLoading) && styles.disabledButton]}
          onPress={handlePurchase}
          disabled={!canPurchase || purchaseLoading}
          testID="subscribe-now-button">
          <Text style={styles.subscribeButtonText}>{purchaseLoading ? "Subscribing…" : "Subscribe Now"}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    container: {
      padding: 20,
      paddingBottom: 80,
      backgroundColor: theme.background,
      alignItems: "center",
    },
    centerState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
      padding: 24,
    },
    stateText: {
      color: theme.secondaryText,
      marginTop: 12,
      textAlign: "center",
    },
    emoji: {
      fontSize: 40,
      marginTop: 10,
      marginBottom: 6,
    },
    featureList: {
      alignItems: "flex-start",
      width: "100%",
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
      fontWeight: "bold",
      marginBottom: 6,
      textAlign: "center",
    },
    subHeader: {
      color: theme.secondaryText,
      fontSize: 14,
      marginBottom: 20,
      textAlign: "center",
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
    disabledButton: {
      opacity: 0.6,
    },
    subscribeButtonText: {
      color: theme.buttonText,
      fontSize: 16,
      fontWeight: "bold",
    },
  });

export default SubscribeScreen;
