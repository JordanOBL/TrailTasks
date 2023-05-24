import watermelonDatabase from "../watermelon/getWatermelonDb";
export const handleLogOut = async (
  setUser: React.Dispatch<React.SetStateAction<any>>
) => {
  try {
    await watermelonDatabase.localStorage.remove('user_id');
    await watermelonDatabase.localStorage.remove('username');
    setUser(null);
  } catch (error) {
    console.error('Error in handleLogOut function, app.tsx', error);
  }
};
