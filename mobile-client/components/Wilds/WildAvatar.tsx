import { Pose, WildId } from '../../assets/wilds';

import {Image} from 'react-native';
import PoseMap from '../../assets/wilds/poseMap';
import React from 'react';

interface Props {
  id: WildId;
  pose: Pose;
  size?: number;
}
const WildAvatar = ({id, pose, size}: Props) => {
  const path = PoseMap[id]?.[pose];
  console.log(path)
  console.log(`Rendering WildAvatar for ${id} with pose ${pose}`, path);

if (!path) {
  console.warn(`Missing pose "${pose}" for wild "${id}"`);
  return;
}

  return (
    <Image
  source={path}
  style={{ width: size ?? 120, height: size ?? 120 }}
  resizeMode="contain"
/>

  );
};

export default WildAvatar;
