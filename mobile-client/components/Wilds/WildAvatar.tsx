import { Pose, WildId, WildImages } from '../../assets/wilds';

import {Image} from 'react-native';
import PoseMap from '../../assets/wilds/poseMap'
import React from 'react';

interface Props {
  id: WildId;
  pose: Pose;
  size?: number;
}
const WildAvatar = ({id, pose, size}: Props) => {
  const path = PoseMap[id]?.[pose];

if (!path) {
  console.warn(`Missing pose "${pose}" for wild "${id}"`);
  return
}
 
  return (
    <Image
      source={PoseMap[id][pose]}
      style={{width: '100%', height: size ? size : 120}}
      resizeMode="contain"
    /> 
  );
};

export default WildAvatar;
