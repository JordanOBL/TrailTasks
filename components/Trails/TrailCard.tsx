import React from 'react';
import { useNavigation } from '@react-navigation/native';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
} from 'react-native';
import { withObservables } from "@nozbe/watermelondb/react";
import calculateEstimatedTime from "../../helpers/calculateEstimatedTime";
import FullTrailDetails from "../../types/fullTrailDetails";
import { useTheme } from '../../contexts/ThemeProvider';
import {useAuthContext} from "../../services/AuthContext";
const TrailCard = React.memo(({ trail, completedTrails, user, userPurchasedTrails, isQueued }: Props) => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const currentTrail = user.trailId == trail?.id
  const { isProMember } = useAuthContext();


  const handlePress = () => {
    navigation.navigate('TrailDetails', {
      trail,
      user,
      
    });
  };


  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <Image
        source={trail.trail_image_url ? { uri: trail.trail_image_url } : require('../../assets/LOGO.png')}
        style={styles.image}
      />
      {!isProMember && <Text style={{color: theme.text, textAlign: 'center', opacity: 0.5}}>{currentTrail ? 'Currently Hiking' : trail.is_free ? 'Free Trail':trail.is_subscribers_only ? 'Pro Subscribers Only'  : 'Available'}</Text>}
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.trailName} numberOfLines={1}>{trail?.trail_name}</Text>
          <View style={[styles.completedBadge, { display: trail.completed_trails ? 'flex' : 'none' }]}>
            <Text style={styles.completedBadgeText}>✓ Completed</Text>
          </View>
          <View style={[styles.completedBadge, { display: isQueued ? 'flex' : 'none' }]}>
            <Text style={styles.completedBadgeText}>In-Queue</Text>
          </View>
        </View>
        <Text style={styles.parkName}>{trail?.park_name}</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>⛰</Text>
            <Text style={styles.statText}>{trail?.trail_distance} mi</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🕒</Text>
            <Text style={styles.statText}>{calculateEstimatedTime(trail?.trail_distance)}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🌟</Text>
            <Text style={styles.statText}>{trail?.trail_difficulty}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const enhance = withObservables(['user', 'userPurchasedTrails', 'completedTrails'], ({ user }) => ({
    user,
    completedTrails: user.usersCompletedTrails.observe(),
    userPurchasedTrails: user.usersPurchasedTrails.observe(),
}));

const EnhancedTrailCard = enhance(TrailCard);
export default EnhancedTrailCard;

const getStyles = (theme: typeof lightTheme | typeof darkTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.trailCardBackground,
      borderRadius: 15,
      overflow: 'hidden',
      marginVertical: 15,
      marginHorizontal: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    image: {
      width: '100%',
      height: 180,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    trailName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.trailCardText,
      flex: 1,
      marginRight: 10,
    },
    completedBadge: {
      backgroundColor: theme.completedBadge,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 15,
    },
    completedBadgeText: {
      color: theme.completedBadgeText,
      fontSize: 12,
      fontWeight: 'bold',
    },
    infoContainer: {
      padding: 15,
      backgroundColor: theme.trailCardOverlay,
      borderBottomLeftRadius: 15,
      borderBottomRightRadius: 15,
    },
    parkName: {
      fontSize: 16,
      color: theme.trailCardSecondaryText,
      marginBottom: 8,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginTop: 10,
    },
    statItem: {
      alignItems: 'center',
    },
    statIcon: {
      fontSize: 16,
      color: theme.trailIcon,
    },
    statText: {
      fontSize: 14,
      color: theme.trailStatText,
      marginTop: 2,
    },
  });

