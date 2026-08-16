import { Database, Q } from "@nozbe/watermelondb";
import { EventBus, Registry, SessionCompletedPayload } from "../EventBus/EventBus";

import { SessionSnapshot } from "../sessionEngine/sessionEngine";
import { User } from "../watermelon/models";
import handleError from "../helpers/ErrorHandler";

export type  Rewards = {
  trailRewards: number;
  wildXpRewards: number;
  timeRewards: number;
  totalTokenRewards: number;
}
type TrailTokenRules = {
  // e.g. distance * perMileMultiplier
  perMileMultiplier: number;   // was "distance * 3"
  minPerTrail: number;         // was "Math.max(5, ...)"
};

type WildXpRules = {
  xpPerMile: number;           // was "miles * 10"
};

type TimeTokenRules = {
    minThresholdMinutes: number,
    tokensPerThreshold: number,
    bonusThresholdMinutes: number,
    bonusThresholdMultiplier: number
}

type RewardRules = {
  trailTokens: TrailTokenRules;
  wildXp: WildXpRules;
  timeTokens: TimeTokenRules;
};


export default class RewardService {
  private bus: EventBus;
  private db: Database;
  private user: User;
  private isProMember: boolean;
  private defaultRewardRules: RewardRules = {
    timeTokens: {
      minThresholdMinutes: 15, //how many minutes needed for token grant
      tokensPerThreshold: 5, // how many tokens granted
      bonusThresholdMinutes: 45,
      bonusThresholdMultiplier: 0.25,
    },
    trailTokens: {
      perMileMultiplier: 3,
      minPerTrail: 5,
    },
    wildXp: {
      xpPerMile: 10,
    },
  };
  private rules: RewardRules;

  constructor(
    bus: EventBus,
    db: Database,
    user: User,
    isProMember: boolean,
    rewardRulesOverride: Partial<RewardRules> = {},
  ) {
    this.bus = bus;
    this.db = db;
    this.user = user;
    this.isProMember = isProMember;
    this.rules = { ...this.defaultRewardRules, ...rewardRulesOverride };
  }

  register(): Function {
    const unregisterList: Registry[] = [];
    unregisterList.push(
      this.bus.on("SESSION_COMPLETED", (payload: SessionCompletedPayload) => {
        void this.calculateRewards(payload.snapshot).catch(e => {
          handleError(e, "RewardService.register() - Error calculating rewards on SESSION_COMPLETED event");
        })
  }),
    );

    return () => {
      unregisterList.forEach(r => r.unregister());
    };
  }

  async calculateRewards(snapshot: SessionSnapshot): Promise<Rewards> {
    try {
      //(PRO)calculate non active wilds xp from completed trails
      const wildXpRewards: number = await this.calculateActiveWildXpReward(snapshot);

      const timeRewards = this.calculateTimeTokens(snapshot);
      //calculate trail tokens from completed trails
      //trail distance * 3, minimum of 5 tokens

      //add bonus xp from sessions totalBonusXp (there is a backpack addon and wild perk(if active) that adds x% to token bonus depending on addon or wild level)
      //take away tokens from penalty strikes (sessions  penalty val can be decreased via active backpack addon or active wild perk )
      const trailRewards: number = this.calculateTrailTokens(snapshot);

      //persistenceService listens and takes the payload and applies rewards to watermelon db transaction
      //UI listens and shows rewards component wiith payload
      this.bus.emit("REWARDS_CALCULATED", {
        finalSnapshot: snapshot,
        rewards: {
          trailRewards: trailRewards,
          timeRewards: timeRewards,
          totalTokenRewards: trailRewards + timeRewards,
          wildXpRewards,
        },
      });
      const rewards = {
        trailRewards: trailRewards,
        timeRewards: timeRewards,
        totalTokenRewards: trailRewards + timeRewards,
        wildXpRewards,
      };
    return rewards;
    } catch (e) {
      handleError(e, "RewardService.calculateRewards()");
      throw new Error("Error calculating rewards in RewardService", { cause: e});
    }
    return rewards;
  }

  private calculateTimeTokens(snapshot: SessionSnapshot): number {
    const rules = this.rules.timeTokens;
    let totalTimeTokens = 0;

    // Convert elapsed time to minutes
    const totalMinutes = Math.floor(snapshot.totalElapsedSec / 60);
    // If total focus time is < 15 minutes, NO reward
    if (totalMinutes < rules.minThresholdMinutes) {
      return 0;
    }

    // Base Tokens: **10 per 15 minutes**
    const baseTokens =
      Math.floor(totalMinutes / rules.minThresholdMinutes) * rules.tokensPerThreshold;

    // Bonus Multiplier: Every **45 min → +25%**
    const bonusMultiplier =
      Math.floor(totalMinutes / rules.bonusThresholdMinutes) * rules.bonusThresholdMultiplier;
    const bonusTokens = Math.floor(baseTokens * bonusMultiplier);

    // 🔹 **Adjusted Expected Sets (Prevents Cheating)**
    // const adjustedExpectedSets = sessionDetails.continueSessionModal
    //   ? timer.sets * 2 // If they chose "Add Session," their expected sets double
    //   : timer.sets;

    // 🔹 **Continuation Bonus** (If user exceeds planned sets)
    // let continuationBonus = 0;
    // if (snapshot.completedSets > snapshot.totalSets) {
    //   continuationBonus = (timer.completedSets - adjustedExpectedSets) * 5; // +5 per extra set
    // }
    // 🔥 Final Token Calculation
    totalTimeTokens = baseTokens + bonusTokens;
    console.log("total time tokens", totalTimeTokens);

    return totalTimeTokens;
  }

  private async calculateActiveWildXpReward(session: SessionSnapshot): Promise<number> {
      /*
            RULES: 
                ALL users  gain wild xp for active wild for either partial distance hiked or overal session time
                PRO users gain set xp amount per completed trail to that trails inactive wild.
            */

      //calcualte active wild xp
      const user = await this.db.get<User>("users").find(session.userId);

      if (!user) {
        throw new Error("No User found with params passed from session");
      }

      const activeWild = await user.usersWilds.extend(Q.where("is_active", true));

      if (!activeWild) {
        return 0;
      }

      //if Pro
      //for each completed trail grant that trails wild 10xp in persistenceService if wild.id in user.wilds array
      //meaning the user has unlocked that user wild

      // if(this.isProMember && session.completedTrails.length > 0){
      //     const uw = await this.user.usersWilds
      //     if(uw.length === 1){

      //     }
      //     session.completedTrails.map()
      // }
    return Math.floor(Number(session.totalDistanceMiles)) * this.rules.wildXp.xpPerMile;
  }

  private calculateTrailTokens(
    snapshot: Pick<SessionSnapshot, "completedTrails" | "tokenBonusFlat" | "tokenBonusPercent">,
  ): number {
    const { completedTrails, tokenBonusFlat = 0, tokenBonusPercent = 0 } = snapshot;

    const baseTokens = completedTrails?.length
      ? completedTrails.reduce((acc, trail) => {
          return (
            acc +
            Math.max(
              this.rules.trailTokens.minPerTrail,
              Math.ceil(trail.distance * this.rules.trailTokens.perMileMultiplier),
            )
          );
        }, 0)
      : 0;

    const afterFlat = baseTokens + tokenBonusFlat;
    const calculatedPercent = Math.ceil(afterFlat * (tokenBonusPercent / 100));
    const afterPercent = afterFlat + calculatedPercent;

    return Math.ceil(afterPercent);
  }
}
