import {Database} from '@nozbe/watermelondb';
import formatDateTime from '../formatDateTime';
import {SessionDetails} from '../../types/session';
import { User } from '../../watermelon/models';
import handleError from "../ErrorHandler";
import React from "react";

const NewSessionHandlers: any = {};

NewSessionHandlers.checkLocalStorageSessionSettings = async (
  sessionCategoryId: string,
  database: Database
) => {
  try{
  const recentSettings = await database.localStorage.get(
    'category ' + sessionCategoryId + ' settings'
  );

  if (recentSettings) {
    //@ts-ignore
    return JSON.parse(recentSettings);
  }
  return undefined;
  } catch (err) {
    handleError(err, "checkLocalStorageSessionSettings")
  }
};

NewSessionHandlers.SelectSessionCategoryId = async (
  cb: React.Dispatch<React.SetStateAction<any>>,
  sessionCategoryId: string,
  database: Database
) => {
  try {
    const recentSettings =
        await NewSessionHandlers.checkLocalStorageSessionSettings(
            sessionCategoryId,
            database
        );
    if (recentSettings) {
      cb((prev: any) => {
        return {...prev, ...recentSettings};
      });
    } else {
      cb((prev: any) => {
        return {...prev, sessionCategoryId: sessionCategoryId};
      });
    }
  } catch (err) {
    handleError(err, "selectSessionCategoryId")
  }
};

NewSessionHandlers.SessionNameChange = (
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  value: string
) => {

  if (value.toLowerCase() === 'fastasfuqboi') {
    cb((prev: any) => {
      return {...prev, sessionName: value, pace: 26};
    });
  } else {
    cb((prev: any) => {
      return {...prev, sessionName: value};
    });
  }
};

NewSessionHandlers.InitialPomodoroTimeChange = (
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  value: number
) => {
  cb((prev: any) => {
    return {...prev, initialPomodoroTime: value};
  });
};

NewSessionHandlers.InitailShortBreakChange = (
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  value: number
) => {
  cb((prev: any) => {
    return {...prev, initialShortBreakTime: value};
  });
};

NewSessionHandlers.InitialLongBreakChange = (
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  value: number
) => {
  cb((prev: any) => {
    return {...prev, initialLongBreakTime: value};
  });
};



NewSessionHandlers.StartSessionClick = async (
  cb: React.Dispatch<React.SetStateAction<SessionDetails>>,
  sessionDetails: SessionDetails,
  user: User,
  database: Database
) => {
  try {
    cb((prev: any) => {
      return {...prev, isLoading: true};
    });
  
       const {newSession, status} = await user.startNewSession(sessionDetails)
    if (newSession && status) {
      await database.localStorage.set('sessionId', newSession.id);
      await database.localStorage.set(
        'category ' + sessionDetails.sessionCategoryId + ' settings',
        JSON.stringify({
          sessionCategoryId: sessionDetails.sessionCategoryId,
          initialPomodoroTime: sessionDetails.initialPomodoroTime,
          initialShortBreakTime: sessionDetails.initialShortBreakTime,
          initialLongBreakTime: sessionDetails.initialLongBreakTime,
        })
      );
      console.debug('returning in start session click newSession', newSession)
       return newSession 
      } else {
      cb((prev: any) => {
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
