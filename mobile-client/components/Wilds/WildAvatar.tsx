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
const WildAvatar = ({id, pose, size}: Props) => {
  const {theme} = useTheme()
  console.log(theme)
  const hiddenTheme = theme.themeName == 'lightTheme' ? 'hidden_light' :'hidden_dark'
  const themedPose = pose == 'hidden' ? hiddenTheme : pose
  const path = PoseMap[id]?.[themedPose];
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
