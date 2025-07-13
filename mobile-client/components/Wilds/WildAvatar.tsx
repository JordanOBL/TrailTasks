import { Image, StyleSheet, Text, View } from 'react-native';
import { Pose, WildId, WildImages } from '../../assets/wilds';

import React from 'react';

interface Props
{
    id: WildId
  pose: Pose
  size?: number
}
const WildAvatar = ({id, pose, size}: Props) => {
  return (
    
          <Image
              source={WildImages[id][pose]}
      style={{ width: '100%', height:  size ? size : 120  }}
      resizeMode="contain" />
    
  );
};

export default WildAvatar;


