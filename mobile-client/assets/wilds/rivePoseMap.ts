import { Pose, WildId } from "../wilds";

export interface RivePoseConfig {
  source: number;
  animationName?: string;
  artboardName?: string;
  stateMachineName?: string;
}

const RivePoseMap: Partial<Record<WildId, Partial<Record<Pose, RivePoseConfig>>>> = {
  scout: {
    still: {
      source: require("./scout/rive/scout.riv"),
      artboardName: "Artboard",
      animationName: "idle",
    },
    rest: {
      source: require("./scout/rive/scout.riv"),
      artboardName: "Artboard",
      animationName: "idle",
    },
    wave: {
      source: require("./scout/rive/scout.riv"),
      artboardName: "Artboard",
      animationName: "wave",
    },
    cheer: {
      source: require("./scout/rive/scout.riv"),
      artboardName: "Artboard",
      animationName: "wave",
    },
  },
};

export default RivePoseMap;
