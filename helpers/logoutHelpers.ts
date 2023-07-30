import { Database } from "@nozbe/watermelondb";
import { sync } from "../watermelon/sync";

export const handleLogOut = async (
  setUser: React.Dispatch<React.SetStateAction<any>>,
  watermelonDatabase: Database,

) => {
  try {
    await watermelonDatabase.localStorage.remove('user_id');
    await watermelonDatabase.localStorage.remove('username');
    await watermelonDatabase.localStorage.remove('user_miles_id');
    setUser(null);
    await sync(watermelonDatabase)
  } catch (error) {
    console.error('Error in handleLogOut function, app.tsx', error);
  }
};
