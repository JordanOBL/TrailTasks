// assets/wilds.ts
export type WildId = 'scout' | 'buckey' | 'ember';
export type Pose   = 'still' | 'walk' | 'run' | 'wave' | 'cheer' | 'rest';

type PoseMap = Record<Pose, any>;   // ReactNative image source

export const WildImages: Record<WildId, PoseMap> = {
  scout: {
    still: require('./wilds/scout/images/still.png'),
    walk : require('./wilds/scout/images/walk.png'),
    run  : require('./wilds/scout/images/run.png'),
    wave : require('./wilds/scout/images/wave.png'),
    cheer: require('./wilds/scout/images/cheer.png'),
    rest : require('./wilds/scout/images/rest.png'),
  },
  buckey: {
    still: require('./wilds/buckey/images/still.png'),
    walk : require('./wilds/buckey/images/walk.png'),
    run  : require('./wilds/buckey/images/run.png'),
    wave : require('./wilds/buckey/images/wave.png'),
    cheer: require('./wilds/buckey/images/cheer.png'),
    rest : require('./wilds/buckey/images/rest.png'),
  },
  ember: {
    still: require('./wilds/ember/images/still.png'),
    walk : require('./wilds/ember/images/walk.png'),
    run  : require('./wilds/ember/images/run.png'),
    wave : require('./wilds/ember/images/wave.png'),
    cheer: require('./wilds/ember/images/cheer.png'),
    rest : require('./wilds/ember/images/rest.png'),
  },
};
