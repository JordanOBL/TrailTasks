import { StyleSheet, Text, View } from "react-native";

import React from "react";
import {withObservables} from "@nozbe/watermelondb/react";

const ParkDetails = ({user, park, trails, wild}) => {
  return (
    <View>
      <Text>ParkDetails</Text>
    </View>
  );
};

const enhance = withObservables(['user', 'park'], ({ user,park }) => ({
    user: user.observe(),
    park, 
    trails: park.trails,
}));

const EnhancedParkDetails = enhance(ParkDetails)
export default EnhancedParkDetails

const styles = StyleSheet.create({});
