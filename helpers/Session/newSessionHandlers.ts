import {Database} from '@nozbe/watermelondb';
import formatDateTime from '../formatDateTime';
import {SessionDetails} from '../../types/session';
import Timer from '../../types/timer';
import { User } from '../../watermelon/models';
import handleError from "../ErrorHandler";
import React from "react";

const NewSessionHandlers: any = {};

NewSessionHandlers.checkLocalStorageSessionSettings = async (
  {sessionCategoryId, database}:{ sessionCategoryId: string,
    database: Database }
) => {
  if(!sessionCategoryId || !database) {
      return {};
    }

  try{
         const recentSettings = await database.localStorage.get(
      'category ' + sessionCategoryId + ' settings'
    );

    if (recentSettings) {
      //@ts-ignore
      return JSON.parse(recentSettings);
    }
    return {};
  } catch (err) {
    handleError(err, "checkLocalStorageSessionSettings")
  }
};

NewSessionHandlers.SelectSessionCategoryId = async ({setTimer, setSessionDetails, sessionCategoryId, database}:
  {  setTimer: React.Dispatch<React.SetStateAction<Timer>>,
    setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>,
    sessionCategoryId: string,
    database: Database }
) => {
  try {
    const recentSettings =
      await NewSessionHandlers.checkLocalStorageSessionSettings(
        { sessionCategoryId,
          database }
      );
    if (recentSettings && Object.values(recentSettings).length > 1) {
      setTimer((prev: any) => ({...prev, focusTime: recentSettings.focusTime, shortBreakTime: recentSettings.shortBreakTime, longBreakTime: recentSettings.longBreakTime, time: recentSettings.focusTime}))
    }
    setSessionDetails((prev: any) => ({...prev, sessionCategoryId: sessionCategoryId}));
  } catch (err) {
    handleError(err, "selectSessionCategoryId")
  }
};

NewSessionHandlers.SessionNameChange = ({
  setSessionDetails,
  value}:
  { setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>,
    value: string }
) => {
  setSessionDetails((prev: any) => {
    return {...prev, sessionName: value};
  });
};

NewSessionHandlers.FocusTimeChange = ({setTimer, value}:{
  setTimer: React.Dispatch<React.SetStateAction<Timer>>,
  value: number }
) => {
  setTimer((prev: any) => {
    return {...prev, focusTime: value, time: value};
  });
};

NewSessionHandlers.ShortBreakChange = (
  {setTimer, value}: {  setTimer: React.Dispatch<React.SetStateAction<Timer>>,
    value: number }
) => {
  setTimer((prev: any) => {
    return {...prev, shortBreakTime: value};
  });
};

NewSessionHandlers.LongBreakChange = (
  {setTimer, value}: { setTimer: React.Dispatch<React.SetStateAction<Timer>>,
    value: number }
) => {
  setTimer((prev: any) => {
    return {...prev, longBreakTime: value};
  });
};



NewSessionHandlers.StartSessionClick = async (
  {setTimer, timer, setSessionDetails, sessionDetails, user, database}: { setTimer: React.Dispatch<React.SetStateAction<Timer>>,
    timer: Timer,
    setSessionDetails: React.Dispatch<React.SetStateAction<SessionDetails>>,
    sessionDetails: SessionDetails,
    user: User,
    database: Database }
) => {
  try {
    setSessionDetails((prev: any) => {
      return {...prev, isLoading: true};
    });

    const {newSession, status} = await user.startNewSession(sessionDetails)
    if (newSession && status) {
      await database.localStorage.set('sessionId', newSession.id);
      await database.localStorage.set(
        'category ' + sessionDetails.sessionCategoryId + ' settings',
        JSON.stringify({
          sessionCategoryId: sessionDetails.sessionCategoryId,
          focusTime: timer.focusTime,
          shortBreakTime: timer.shortBreakTime,
          longBreakTime: timer.longBreakTime,
        })
      );
      return newSession
    } else {
      setSessionDetails((prev: any) => {
        return {
          ...prev,
          isLoading: false,
          isError: 'Error creating new Session in handleStartSession func',
        };
      });
    }
  } catch (err) {
    handleError(err, "StartSessionClick");
  }
};

export default NewSessionHandlers;
