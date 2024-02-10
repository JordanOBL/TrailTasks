import {StyleSheet, Text, View} from 'react-native';
import React, {useEffect} from 'react';
import Purchases from 'react-native-purchases';

const AchievementsScreen = () => {
  async function getCustomerInfo() {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      // access latest customerInfo
      console.log(customerInfo);
    } catch (e) {
      // Error fetching customer info
    }
  }

  useEffect(() => {
    getCustomerInfo();
  }, []);
  return (
    <View>
      <Text>AchievementsScreen</Text>
    </View>
  );
};

export default AchievementsScreen;

const styles = StyleSheet.create({});
