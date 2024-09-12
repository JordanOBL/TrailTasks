import React from 'react';
import { View, Text, Image } from 'react-native';
import addonImages from '../../helpers/Addons/addonImages';

const TimerBackpack = ({ sessionDetails, user }) => {
  // Ensure that backpack exists and is an array
  const backpack = sessionDetails?.backpack || [];
  return (
    <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      {
        backpack.map((slot, idx) => {
          if (slot.addon) {
            return (
              <View key={slot.addon?.id} style={{ marginHorizontal: 5 }}>
                <Image
                  style={{ width: 100, height: 100 }}
                  source={addonImages[slot.addon.name.replace(/\s/g, '')]} 
                />
              </View>
            )
          } 
          else if(slot.addon === null && user.totalMiles >= slot.minimumTotalMiles ) {
            return (
              <View
                style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: 50, height: 50, marginHorizontal: 5, borderWidth: 1, borderRadius: 10, borderColor: 'rgba(211,211,211, .3)' }}
              >
                <Text style={{ textAlign: 'center', color: 'rgba(211,211,211, .3)' }}>
                  Slot {idx + 1}
                </Text>
              </View>

            )
          }
        })
      } 

    </View>
  );
};

export default TimerBackpack;
