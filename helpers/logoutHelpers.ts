import { Database } from "@nozbe/watermelondb";

export const handleLogOut = async (
  setUser: React.Dispatch<React.SetStateAction<any>>, watermelonDatabase: Database
) => {
  try {
    await watermelonDatabase.localStorage.remove('user_id');
    await watermelonDatabase.localStorage.remove('username');
    setUser(null);
  } catch (error) {
    console.error('Error in handleLogOut function, app.tsx', error);
  }
};
