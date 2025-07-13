import { User, User_Achievement, User_Addon, User_Completed_Trail, User_Park, User_Purchased_Trail, User_Session } from "../watermelon/models";

export interface GlobalExistingUserResponseSuccess {
  user: User; 
  userSessions: User_Session[];
  userPurchasedTrails: User_Purchased_Trail[];
  userAchievements: User_Achievement[];
  userCompletedTrails: User_Completed_Trail[];
  userAddons: User_Addon[];
  userParks: User_Park[];
}
export interface GlobalExistingUserResponseFail {
  messaage: string;
}
