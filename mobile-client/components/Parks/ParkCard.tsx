import * as Progress from 'react-native-progress';
import * as React from 'react';

import { Button, Card, Text } from 'react-native-paper';
import {Park_Wild, User, User_Wild} from '../../watermelon/models';
import { StyleSheet, View } from 'react-native';

import WildAvatar from '../Wilds/WildAvatar';
import { useTheme } from '../../contexts/ThemeProvider';
import {withObservables} from '@nozbe/watermelondb/react';

interface Props {
  parkId: string;
  navigation: any;
    user: User | null;
    parkName?: string;
    isParkPassCompleted?: boolean;
    isWildUnlocked?: boolean;
    wildId?: string;
    
}

const ParkCard = React.memo(({ user,parkId, parkName, isParkPassCompleted,isWildUnlocked, wildId , navigation}: Props) => {
  const { theme }  = useTheme();
  const styles = getStyles(theme);
  //const progress = data?.completedTrails / data?.totalTrails;
if(!user ){
  return (
    <View>
      <Text>Loading..</Text>
    </View>
  );
}

  return (
    <Card style={styles.cardContainer}>
      <View style={[styles.content]}>
        <Text style={styles.title}>{parkName}</Text>

        {/* <Text testID={`park-${park.parkId}-level`} style={styles.levelBadge}>
            Level: {data?.pass?.parkLevel || 0}
          </Text> */}
      <View style={styles.imageContainer}>
         {wildId ? <WildAvatar
            id={wildId}
            key={wildId}
            pose={isWildUnlocked ?  'still' : 'hidden'}
            size={100}
          /> : <Text style={{color: 'white'}}>No Image</Text>}
        </View>

        {/* <Progress.Bar
          //progress={progress}
          height={12}
          borderWidth={0}
          borderRadius={10}
          color="rgb(7,254,213)"
          unfilledColor={theme.border || 'rgba(255,255,255,0.1)'}
          style={styles.progressBar}
          key={park.parkId}
        /> */}

        {/* <Text testID={`park-${data.parkId}-progress-text`} style={styles.progressText}>
          {data.completedTrails}/{data.totalTrails}
        </Text> */}

        {/* {progress === 1 && (!data.pass || data.pass.parkLevel <= user.prestigeLevel) && (
          <Button
            testID={`park-${data.parkId}-redeem-button`}
            mode="contained"
            buttonColor="rgb(7,254,213)"
            onPress={async () => await user.redeemParkPass(data.parkId)}
            style={styles.redeemButton}
            dark={theme.buttonText === '#ffffff'}
          >
            Redeem
          </Button>
        )} */}
        <Button mode="elevated" buttonColor="rgb(7,254,213)" onPress={() => {
          navigation.navigate('ParkDetails', {wildId, parkId});

        }}>
          Details
        </Button>
      </View>
    </Card>
  );
});

export default ParkCard;


const getStyles = (theme: any) =>
  StyleSheet.create({
    cardContainer: {
      borderRadius: 16,
      position: 'relative',
      margin: 10,
      width: 170,
      backgroundColor: theme.card,
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 10,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      borderWidth: 1,
      borderColor: theme.border,
    },
        levelBadge: {
            color: theme.text,
        },
       content: {
      alignItems: 'center',
      width: '100%',
    },
    imageContainer: {
      marginVertical: 12,
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 6,
    },
    progressBar: {
  width: 130, // or use Dimensions.get('window').width * 0.35 for dynamic sizing
  alignSelf: 'center',
  marginTop: 4,
  marginBottom: 2,
},
    progressText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.secondaryText,
      marginTop: 4,
      marginBottom: 4,
      textAlign: 'center',
    },
    redeemButton: {
      marginTop: 10,
      borderRadius: 20,
      width: '100%',
    },
  });

