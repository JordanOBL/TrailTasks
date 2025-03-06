export interface GlobalExistingUserResponseSuccess {
  user: User; 
  userSubscription: UserSubscription;
  userSessions: UserSession[];
  userPurchasedTrails: UserPurchasedTrail[];
  userAchievements: UserAchievement[];
  userCompletedTrails: UserCompletedTrail[];
  userAddons: UserAddon[];
  userParks: UserPark[];
}
export interface GlobalExistingUserResponseFail {
  messaage: string;
}
