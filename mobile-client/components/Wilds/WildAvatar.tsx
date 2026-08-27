import { Image } from "react-native";
import { Pose, WildId } from "../../assets/wilds";

import PoseMap from "../../assets/wilds/poseMap";
import React, { useRef } from "react";
import Rive, { RiveRef } from "rive-react-native";
import RivePoseMap from "../../assets/wilds/rivePoseMap";
import { useTheme } from "../../contexts/ThemeProvider";

interface Props {
  id: WildId;
  pose: Pose;
  size?: number;
  animated?: boolean;
}

const WildAvatar = ({ id, pose, size = 120, animated = false }: Props) => {
  const { theme } = useTheme();
  const [riveFailed, setRiveFailed] = React.useState(false);
  const hiddenTheme = theme.themeName === "lightTheme" ? "hidden_light" : "hidden_dark";
  const themedPose = pose === "hidden" ? hiddenTheme : pose;
  const rivePose = RivePoseMap[id]?.[themedPose];
  const imagePath = PoseMap[id]?.[themedPose] ?? PoseMap[id]?.["still"];
  const riveRef = useRef<RiveRef>(null);

  React.useEffect(() => {
    setRiveFailed(false);

    if (!animated || !rivePose || !rivePose.stateMachineName) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout>;
    let cancelled = false;

    const minDelay = 4000;
    const maxDelay = 12000;

    const scheduleWave = () => {
      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);

      timeoutId = setTimeout(() => {
        if (cancelled) {
          return;
        }

        riveRef.current?.fireState(rivePose.stateMachineName!, pose);

        scheduleWave();
      }, delay);
    };

    scheduleWave();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [animated, id, pose, rivePose, themedPose]);

  if (animated && rivePose && !riveFailed) {
    return (
      <Rive
        source={rivePose.source}
        artboardName={rivePose.artboardName}
        stateMachineName={rivePose.stateMachineName}
        autoplay
        style={{ width: size, height: size }}
        onError={() => setRiveFailed(true)}
        ref={riveRef}
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
