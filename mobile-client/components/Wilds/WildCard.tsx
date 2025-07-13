import {Image, Pressable, StyleSheet, Text, View} from 'react-native';

import React from 'react';
import WildAvatar from './WildAvatar';
import {WildImages} from '../../assets/wilds';

export interface WildCardProps
{
    usersWilds: string[];
  id: 'scout' | 'buckey' | 'ember';
  name: string;
  level: number;
  xpPercent: number; // 0 to 1
  perkName: string;
  perkDescription: string;
  rarity: 'common' | 'rare' | 'epic';
  isLocked: boolean;
    onPress?: () => void;
    isActive: boolean;
}

const WildCard = ({
    usersWilds,
  id,
  name,
  level,
  xpPercent,
  perkName,
  perkDescription,
  rarity,
    isLocked,
    onPress,
  isActive,
}: WildCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={isLocked}
      style={[styles.card, isLocked && styles.locked]}>
    <WildAvatar id={id} pose={isLocked ? 'rest' : isActive ? 'wave' : 'still'} />
    <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.level}>Level {level}</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressFill, {width: `${xpPercent * 100}%`}]} />
        </View>
        <Text style={styles.perkTitle}>{perkName}</Text>
        <Text style={styles.perkDesc}>{perkDescription}</Text>
        {isLocked && <Text style={styles.lockedText}>Locked</Text>}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
        width: 180,
      height: 300,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 4,
  },
  locked: {
    opacity: 0.4,
  },
  image: {
    width: '100%',
    height: 120,
  },
  info: {
    marginTop: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  level: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#4caf50',
  },
  perkTitle: {
    fontWeight: '600',
    fontSize: 13,
    marginTop: 6,
  },
  perkDesc: {
    fontSize: 12,
    color: '#444',
  },
  lockedText: {
    fontSize: 12,
    color: '#c00',
    marginTop: 4,
  },
});

export default WildCard;
