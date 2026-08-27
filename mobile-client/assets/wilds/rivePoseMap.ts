import { Pose, WildId } from "../wilds";

export interface RivePoseConfig {
  source: number;
  animationName?: string;
  artboardName?: string;
  stateMachineName?: string;
}

const RivePoseMap: Partial<Record<WildId, Partial<Record<Pose, RivePoseConfig>>>> = {};

export default RivePoseMap;
