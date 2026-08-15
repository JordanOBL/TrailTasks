import { StyleSheet, Text, View } from "react-native";

import React from "react";
import ScreenLink from "../components/screenLink";
import { getTheme } from "../utils/theme";
import { useAuthContext } from "../services/AuthContext";
import { useTheme } from "../contexts/ThemeProvider";
import { withObservables } from "@nozbe/watermelondb/react";

const ProfileScreen = ({navigation, user}) => {
    const {theme} = useTheme();
    const {isProMember } = useAuthContext();
  return (
    <View>
   
      <ScreenLink
            user={user}
            needsActiveSubscription={false}
            hasActiveSubscription={true}
            navigation={navigation}
            navTo={'Stats'}>
            Stats
          </ScreenLink>
             <ScreenLink
            user={user}
            needsActiveSubscription={true}
            hasActiveSubscription={isProMember}
            navigation={navigation}
            navTo={'Trail Queue'}>
            Upcoming Trails
          </ScreenLink> <ScreenLink
            user={user}
            needsActiveSubscription={true}
            hasActiveSubscription={isProMember}
            navigation={navigation}
            navTo={'Friends'}>
            Friends
          </ScreenLink>
                <ScreenLink
            user={user}
            needsActiveSubscription={false}
            hasActiveSubscription={isProMember}
            navigation={navigation}
            navTo={'Achievements'}>
            Achievements
          </ScreenLink>
    </View>
  );
}

const enhance = withObservables(['user'], ({user}) => ({
    user: user.observe(),
    currentTrail: user.trail.observe(),
    userSessions: user.usersSessions.observe(),
    userWilds: user.usersWilds.observe(),
}));
const EnhancedProfileScreen = enhance(ProfileScreen);
export default EnhancedProfileScreen;

