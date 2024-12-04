import { Pressable, StyleSheet, Text, View } from "react-native";
import { Subscription, User, User_Session } from "../watermelon/models";

import React from "react";
import ScreenLink from "../components/HomeScreen/screenLink";

interface Props {
    user: User;

    navigation: any;
    setUser: any;
    userSubscription: Subscription;

}

const SessionTypeScreen = ({navigation, user, setUser}: Props) => {
  return (
    <View style={{height: '100%', width: '100%', padding: 50}}>
          <ScreenLink needsActiveSubscription={true}
                    hasActiveSubscription={
                        true
                    }
                    user={user}
                    navigation={navigation}
              navTo={'Group'}>
              Group
          </ScreenLink>
          <ScreenLink needsActiveSubscription={true}
                    hasActiveSubscription={
                    true
                    }
                    user={user}
                    navigation={navigation}
              navTo={'Solo'}>
              Solo
          </ScreenLink>
      </View>
  );
};

export default SessionTypeScreen;

const styles = StyleSheet.create({});
