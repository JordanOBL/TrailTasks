import { Pose, WildId } from "../wilds";

export interface RivePoseConfig {
  source: number;
  animationName?: string;
  artboardName?: string;
  stateMachineName?: string;
}

const RivePoseMap: Partial<Record<WildId, Partial<Record<Pose, RivePoseConfig>>>> = {
  scout: {
    wave: {
      source: require("./scout/rive/scout.riv"),
      artboardName: "Artboard",
      stateMachineName: "State Machine 1",
    },
  },
};

export default RivePoseMap;
