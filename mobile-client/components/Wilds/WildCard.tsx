import {Pressable, StyleSheet, Text, View} from 'react-native';
import Rive, {RiveRef} from 'rive-react-native';

import React from 'react';
import WildAvatar from './WildAvatar';

export interface WildCardProps {
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
  createHiddenText: (text: string) => string;
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
  createHiddenText,
}: WildCardProps) =>
{
  
     const riveRef = React.useRef<RiveRef>(null);

     function wave() {
       riveRef.current?.fireState('State Machine 1', 'wave');
     }
     function getRandom() {
       return Math.floor(Math.random() * 3000) + 5000; // Between 2s–5s
     }

     React.useEffect(() => {
       let timeout = null;

       function scheduleWave() {
         const delay = getRandom();
         timeout = setTimeout(() => {
           if (riveRef.current) wave();
           scheduleWave(); // Recurse to schedule the next blink
         }, delay);
       }

       scheduleWave(); // Start the blinking loop

       return () => {
         clearTimeout(timeout); // Clean up on unmount
       };
     }, [riveRef]);
  return (
    <Pressable
      onPress={onPress}
      disabled={isLocked}
      style={[
        styles.card,
        isLocked && styles.locked,
        isActive && styles.activeWild,
        !isActive && !isLocked && styles.inactive,
      ]}>
      {id === 'scout' ? (
        <Rive
          ref={riveRef}
          resourceName={id}
          artboardName="Artboard"
          stateMachineName="State Machine 1"
          style={{width: 150, height: 150}}
        />
      ) : (
        <WildAvatar
          id={id}
          pose={isLocked ? 'hidden' : isActive ? 'wave' : 'rest'}
        />
      )}
      <View style={styles.info}>
        <Text style={styles.name}>
          {isLocked ? createHiddenText(name) : name}
        </Text>
        <Text style={styles.level}>Level {level}</Text>
        <View style={styles.progressContainer}>
          <View style={[styles.progressFill, {width: `${xpPercent * 100}%`}]} />
        </View>
        <Text style={styles.perkTitle}>{isLocked ? '' : perkName}</Text>
        <Text style={styles.perkDesc}>{isLocked ? '' : perkDescription}</Text>
        {isLocked && <Text style={styles.lockedText}>Locked</Text>}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  activeWild: {
    borderWidth: 2,
    borderColor: 'rgb(7,254,213)',
  },
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
    opacity: 0.6,
  },
  inactive: {
    opacity: 0.8,
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
    textAlign: 'center',
  },
  level: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
    textAlign: 'center',
  },
  perkDesc: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
  },
  lockedText: {
    fontSize: 12,
    color: '#c00',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default WildCard;
