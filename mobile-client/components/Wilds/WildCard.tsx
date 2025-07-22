import {Pressable, StyleSheet, Text, View} from 'react-native';
import Rive, {RiveRef} from 'rive-react-native';

import React from 'react';
import WildAvatar from './WildAvatar';

export interface WildCardProps {
  usersWilds?: string[];
 item: any,
  isLocked?: boolean;
  onPress?: () => void;
  isActive?: boolean;
  createHiddenText: (text: string) => string;
}

const WildCard = React.memo(({
  usersWilds,
 item, 
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
      disabled={false}
      style={[
        styles.card,
        isLocked && styles.locked,
        isActive && styles.activeWild,
        !isActive && !isLocked && styles.inactive,
      ]}>
      {item.id === 'scout' ? (
        <Rive
          ref={riveRef}
          resourceName={item.id}
          artboardName="Artboard"
          stateMachineName="State Machine 1"
          style={{ width: 100, height: 100 }}
          key={item.id}
        />
      ) : (
        <WildAvatar
            id={item.id}
            key={item.id}
          // pose={isLocked ? 'hidden' : isActive ? 'wave' : 'rest'}
          pose={'still'}
        />
      )}
      <View style={styles.info}>
        <Text style={styles.name}>
          {isLocked ? createHiddenText(item.name) : item.name}
        </Text>
        <Text style={styles.level}>{item.species}</Text>
        <Text style={styles.level}>Level {item.level ? item.level : 1}</Text>
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressFill, {width: `${Math.random() * 100}%`}]}
          />
        </View>
        <Text style={styles.perkTitle}>{isLocked ? '' : item.perk_name}</Text>
        <Text style={styles.perkDesc}>
          {isLocked ? '' : item.perk_description}
        </Text>
        {isLocked && <Text style={styles.lockedText}>Locked</Text>}
      </View>
    </Pressable>
  );
});

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
    alignItems:'center',
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
