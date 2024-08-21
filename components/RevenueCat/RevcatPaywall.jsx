import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import useRevenueCat from "../../helpers/RevenueCat/useRevenueCat";

const RevcatPaywall = ({ user }) => {
    if (!user || !user.id) {
        console.error('User ID is missing or invalid.');
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Error: User ID is missing</Text>
            </View>
        );
    }

    const { currentOffering, isProMember, customerInfo, loading } = useRevenueCat({ userId: user.id });

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading paywall...</Text>
            </View>
        );
    }

    if (!currentOffering || !customerInfo) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>Error: Unable to load paywall</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <RevenueCatUI.Paywall
                options={{ offering: currentOffering }}
                onRestoreCompleted={({ customerInfo }) => {
                    console.log("Restore completed:", customerInfo);
                }}
                onDismiss={() => {
                    console.log("Paywall dismissed");
                }}
            />
        </View>
    );
}

export default RevcatPaywall;
