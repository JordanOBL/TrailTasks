import React from 'react';
import { View, Image } from 'react-native';
import addonImages from '../../helpers/Addons/addonImages';

const ActiveSessionBackpack = ({ sessionDetails }) => {
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
        })
      } 

    </View>
  );
};

export default ActiveSessionBackpack;
