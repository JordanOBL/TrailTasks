import { Database } from "@nozbe/watermelondb";

export const handleLogOut = async (
  setUserId: React.Dispatch<React.SetStateAction<any>>,
  watermelonDatabase: Database,

) => {
  try {
    await watermelonDatabase.localStorage.remove('user_id');
    await watermelonDatabase.localStorage.remove('username');
    await watermelonDatabase.localStorage.remove('user_miles_id');
    setUserId(null);
  } catch (error) {
    console.error('Error in handleLogOut function, app.tsx', error);
  }
};
