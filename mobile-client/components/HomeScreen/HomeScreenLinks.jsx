import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import React from "react";
import { useAuthContext } from "../../services/AuthContext";
import {useTheme} from '../../contexts/ThemeProvider';

export default function HomeScreenLinks ({user, navigation}) {
    const {theme} = useTheme();
    const styles = getStyles(theme)
    const {currentOffering, customerInfo, isProMember } = useAuthContext();


    function handlePress(needsSubscription, link){
        if(!needsSubscription){
            navigation.navigate(link)
            return
        }
        if(!isProMember){
            navigation.navigate('Subscribe')
            return
        }
        navigation.navigate(link)
        return
    }

  return (
    <View style={styles.container}>
       <Pressable style={styles.screenLink} onPress={() => handlePress(false, 'Profile')}>
        <Text style={styles.text}>Profile</Text>
       </Pressable>
 <Pressable style={styles.screenLink} onPress={() => handlePress(false,'Shop')}>
        <Text style={styles.text}>Shop</Text>
       </Pressable>
        <Pressable style={styles.screenLink} onPress={() => handlePress(true,'Leaderboards')}>
        <Text style={styles.text}>Leaderboards</Text>
       </Pressable>
        <Pressable style={styles.screenLink} onPress={() => handlePress(false, 'Settings')}>
        <Text style={styles.text}>Settings</Text>
       </Pressable>
    </View>

  );
};


const getStyles = (theme) =>  {
    return StyleSheet.create({
        container:{
             flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around', // Distributes items evenly with space around them
    padding: 10,
        },
       
        screenLink:{
           width: '45%', // Approximately two columns with some spacing
    height: 150,
    backgroundColor: theme.card,
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius:20,
        },

        text:{color: theme.text},
    });
}
        //     <ScrollView
        //   style={styles.linkContainer}
        //   contentContainerStyle={{flexGrow: 1, paddingBottom: 40}} // adjust for safety
        //   keyboardShouldPersistTaps="handled">
        //     <ScreenLink
        //     user={user}
        //     needsActiveSubscription={false}
        //     hasActiveSubscription={true}
        //     navigation={navigation}
        //     navTo={'Profile'}>
        //     Profile
        //   </ScreenLink>
 
        //   <ScreenLink
        //     user={user}
        //     needsActiveSubscription={false}
        //     hasActiveSubscription={true}
        //     navigation={navigation}
        //     navTo={'Shop'}>
        //     Shop
        //   </ScreenLink>

       
         
     
    
        //   <ScreenLink
        //     user={user}
        //     navigation={navigation}
        //     navTo={'Leaderboards'}
        //     needsActiveSubscription={true}
        //     hasActiveSubscription={isProMember}>
        //     Leaderboards
        //   </ScreenLink>
        //   <ScreenLink
        //     user={user}
        //     navigation={navigation}
        //     navTo={'Settings'}
        //     needsActiveSubscription={false}
        //     hasActiveSubscription={false}>
        //     Settings
        //   </ScreenLink>
        // </ScrollView>