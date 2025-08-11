import * as Progress from 'react-native-progress';
import * as React from 'react';

import { Button, Card, Text } from 'react-native-paper';
import {Park_Wild, User, User_Wild} from "../../watermelon/models";
import { StyleSheet, View } from 'react-native';

import WildAvatar from '../Wilds/WildAvatar';
import {useEffect} from "react";
import { useTheme } from '../../contexts/ThemeProvider';
import {withObservables} from "@nozbe/watermelondb/react";

interface Props {
    parkWild: Park_Wild[];
    user: User;
    park: any; // Assuming park is an object with park details
    wild: any; // Assuming wild is an object with wild details
    usersWilds: any
    navigate: any
}
 
const ParkCard = ({ parkWild, user,usersWilds,  park, wild, navigation}: Props) => {
  const { theme }  = useTheme();
  const styles = getStyles(theme);
  //const progress = data?.completedTrails / data?.totalTrails;
console.log(park)

const isLocked = !usersWilds.some((uw: User_Wild) => uw.wildId === wild.id)
if(!user || !park ){
  return (
    <View>
      <Text>Loading..</Text>
    </View>
  )
}

  return (
    <Card style={styles.cardContainer}>
      <View style={[styles.content]}>
        <Text style={styles.title}>{park.parkName}</Text>

        {/* <Text testID={`park-${park.parkId}-level`} style={styles.levelBadge}>
            Level: {data?.pass?.parkLevel || 0}
          </Text> */}
      <View style={styles.imageContainer}>
         {wild.id ? <WildAvatar
            id={wild.id}
            key={wild.id}
            pose={isLocked ?  'hidden' : 'still'}
            //pose={'still'}
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
        <Button mode="elevated" buttonColor='rgb(7,254,213)' onPress={() => {
          console.log('Redeem button clicked', wild.id);
          navigation.navigate('ParkDetails', {wild:wild, park:park, user})

        }}>
          Details
        </Button>
      </View>
    </Card>
  );
};

const enhance = withObservables(['user', 'parkWild'], ({ user, parkWild }) => ({
    user: user.observe(),
    usersWilds: user.usersWilds,
    park: parkWild.park.observe(),
    wild: parkWild.wild.observe(),
    
}));


const EnhancedParkCard = enhance(ParkCard);
export default EnhancedParkCard;


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

