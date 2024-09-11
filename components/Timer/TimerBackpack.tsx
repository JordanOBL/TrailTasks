import React from 'react';
import { View, Text, Image } from 'react-native';
import addonImages from '../../helpers/Addons/addonImages';

const TimerBackpack = ({ sessionDetails }) => {
  // Ensure that backpack exists and is an array
  const backpack = sessionDetails?.backpack || [];
  return (
    <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
      {backpack.some(slot => slot.addon) ? (
        backpack.map((slot) => {
          if (slot.addon) {
            return (
              <View key={slot.addon?.id} style={{ margin: 10 }}>
                <Image
                  style={{ width: 100, height: 100 }}
                  source={addonImages[slot.addon.name.replace(/\s/g, '')]} 
                />
              </View>
            )
          }
        })
      ) : (
        <Text style={{ textAlign: 'center', color: 'rgba(211,211,211, .3)' }}>
          Backpack is empty
        </Text>
      )}
    </View>
  );
};

export default TimerBackpack;
