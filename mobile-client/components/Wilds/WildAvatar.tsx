import { Pose, WildId } from '../../assets/wilds';

import {Image} from 'react-native';
import PoseMap from '../../assets/wilds/poseMap';
import React from 'react';
import { useTheme } from '../../contexts/ThemeProvider';

interface Props {
  id: WildId;
  pose: Pose;
  size?: number;
}
const WildAvatar = ({id, pose, size = 120}: Props) => {
  const {theme} = useTheme()
  const hiddenTheme = theme.themeName == 'lightTheme' ? 'hidden_light' :'hidden_dark'
  const themedPose = pose == 'hidden' ? hiddenTheme : pose
  const path = PoseMap[id]?.[themedPose];

if (!path) {
  console.warn(`Missing pose "${pose}" for wild "${id}"`);
  return null;
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
