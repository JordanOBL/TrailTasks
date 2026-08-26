import {
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { darkTheme, lightTheme } from '../../theme';

import FullTrailDetails from "../../types/fullTrailDetails";
import React from 'react';
import calculateEstimatedTime from "../../helpers/calculateEstimatedTime";
import {useAuthContext} from "../../services/AuthContext";
import { useTheme } from '../../contexts/ThemeProvider';

interface Props {
  trail: FullTrailDetails;
  isQueued: boolean;
  handleTrailPress: (trail: FullTrailDetails) => void;
}
const TrailCard = React.memo(({ trail, isQueued, handleTrailPress }: Props) => {
  const { theme } = useTheme();
  const {user, isProMember} = useAuthContext();
  const styles = getStyles(theme);
  const currentTrail = user?.trailId == trail?.id
  const getTrailStatusText = () => {
  if (currentTrail) return "Currently Hiking";
  if (trail.is_free) return "Available (Free Trail)";
  if (trail.is_purchased) return "Available (Purchased)";
  if (trail.is_subscribers_only && !isProMember) return "Pro Subscribers Only";
  return "Buy to Unlock";
};

  return (
    <TouchableOpacity style={styles.card} onPress={() => handleTrailPress(trail)}>
      <Image
        source={trail.trail_image_url ? { uri: trail.trail_image_url } : require('../../assets/LOGO.png')}
        style={styles.image}
      />
     <Text style={{color: theme.text, textAlign: 'center', opacity: 0.5}}>{getTrailStatusText()}</Text>
      <View style={styles.infoContainer}>
        <View style={styles.row}>
          <Text style={styles.trailName} numberOfLines={1}>{trail?.trail_name}</Text>
          <View style={[styles.completedBadge, { display: trail.is_completed ? 'flex' : 'none' }]}>
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
            <Text style={styles.statText}>{calculateEstimatedTime(Number(trail?.trail_distance))}</Text>
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

export default TrailCard;

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

