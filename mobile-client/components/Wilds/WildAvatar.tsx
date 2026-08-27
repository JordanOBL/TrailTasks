import { Image } from "react-native";
import { Pose, WildId } from "../../assets/wilds";

import PoseMap from "../../assets/wilds/poseMap";
import React from "react";
import Rive from "rive-react-native";
import RivePoseMap from "../../assets/wilds/rivePoseMap";
import { useTheme } from "../../contexts/ThemeProvider";

interface Props {
  id: WildId;
  pose: Pose;
  size?: number;
}

const WildAvatar = ({ id, pose, size = 120 }: Props) => {
  const { theme } = useTheme();
  const [riveFailed, setRiveFailed] = React.useState(false);
  const hiddenTheme = theme.themeName === "lightTheme" ? "hidden_light" : "hidden_dark";
  const themedPose = pose === "hidden" ? hiddenTheme : pose;
  const rivePose = RivePoseMap[id]?.[themedPose];
  const imagePath = PoseMap[id]?.[themedPose];

  React.useEffect(() => {
    setRiveFailed(false);
  }, [id, themedPose]);

  if (rivePose && !riveFailed) {
    return (
      <Rive
        source={rivePose.source}
        animationName={rivePose.animationName}
        artboardName={rivePose.artboardName}
        stateMachineName={rivePose.stateMachineName}
        autoplay
        style={{ width: size, height: size }}
        onError={() => setRiveFailed(true)}
      />
    );
  }

  if (!imagePath) {
    console.warn(`Missing pose "${pose}" for wild "${id}"`);
    return null;
  }

  return <Image source={imagePath} style={{ width: size, height: size }} resizeMode="contain" />;
};

export default WildAvatar;
