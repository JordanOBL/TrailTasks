import React from 'react';
import { useNavigation } from '@react-navigation/native';

import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
} from 'react-native';
import {withObservables} from "@nozbe/watermelondb/react";
import {
    User_Completed_Trail,
    Park,
    Subscription,
    User,
    User_Purchased_Trail
} from "../../watermelon/models";
import calculateEstimatedTime from "../../helpers/calculateEstimatedTime";
import FullTrailDetails from "../../types/fullTrailDetails";

const TrailCard = React.memo(({ trail,completedTrails, user,  userPurchasedTrails }: {trail: FullTrailDetails, userPurchasedTrails: User_Purchased_Trail[], user:User, park:Park, userSubscription: Subscription, completedTrails: User_Completed_Trail[] }) => {
    const navigation = useNavigation();
    const handlePress = () => {
        // @ts-ignore
        navigation.navigate('TrailDetails', {
            trail,
            user,
            userPurchasedTrails,
            completedTrails,

        });
    };

    return (
        <TouchableOpacity style={[styles.trailCard, styles.container, {marginVertical: 20}]} onPress={handlePress}>

        <View style={styles.trailCard}>
            <View style={styles.trailCard}>
                <Image source={trail.trail_image_url
                    ? {uri: trail.trail_image_url}
                    : require('../../assets/LOGO.png')} style={styles.trailImage}/>
            </View>
            <View style={styles.trailInfo}>
                <Text style={styles.trailName}>{trail?.trail_name}</Text>
                <Text style={styles.parkName}>{trail?.park_name}</Text>
                <View style={styles.trailStats}>
                    <Text style={styles.trailStatText}>🌟 {trail?.trail_difficulty}</Text>
                    <Text style={styles.trailStatText}>⛰ {trail?.trail_distance} mi</Text>
                    <Text style={styles.trailStatText}>🕒 {calculateEstimatedTime(trail?.trail_distance)}</Text>
                </View>
            </View>
        </View>
        </TouchableOpacity>
    )
});

const enhance = withObservables(
    ['user', 'userPurchasedTrails'],
    ({ user }) => ({
        user,
        completedTrails: user.completedHikes.observe(),
        queuedTrails: user.queuedTrails.observe(),
        userPurchasedTrails: user.usersPurchasedTrails.observe(),
    })
);

const EnhancedTrailCard = enhance(TrailCard);
export default EnhancedTrailCard;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(18, 19, 21)', // Black background
    },
    trailCard: {
        backgroundColor: 'rgb(18, 19, 21)',// Dark background for trail card
       // Margin at the bottom to space out cards
        overflow: 'hidden', // Adds shadow for Android
        shadowColor: '#000', // Adds shadow for iOS
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1, // Slightly stronger shadow opacity
        shadowRadius: 5,
        zIndex: 0, // Ensure dropdown is above other elements
        elevation: 5,
    },
    trailImage: {
        width: '100%',
        height: 200,
        zIndex: 999, // Ensure dropdown is above other elements

    },
    trailInfo: {
        padding: 10,
    },
    trailName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff', // White text color for trail name
    },
    parkName: {
        color: '#aaa', // Lighter text color for park name
        marginBottom: 5,
    },
    trailStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',

        margin: 10,
    },
    trailStatText: {
        fontSize: 14,
        color: '#ddd', // Lighter text color for trail stats
    },
    actionButton: {
        padding: 10,
        backgroundColor: 'rgba(100,1001,100,.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    }
});
