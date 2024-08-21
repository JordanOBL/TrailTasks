import { Database } from "@nozbe/watermelondb";
import { sync } from "../watermelon/sync";
import React from "react";
import handleError from "./ErrorHandler";

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
  } catch (err) {
    handleError(err, "handleLogOut");
  }
};
