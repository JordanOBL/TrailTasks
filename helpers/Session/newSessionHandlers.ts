import {Database} from '@nozbe/watermelondb';
import {formatDateTime} from '../formatDateTime';

const NewSessionHandlers: any = {};

NewSessionHandlers.SelectSessionCategoryId = (
  cb: React.Dispatch<React.SetStateAction<any>>,
  sessionCategoryId: string
) => {
  cb((prev: any) => {
    return {...prev, sessionCategoryId: sessionCategoryId};
  });
};

NewSessionHandlers.SessionNameChange = (
  cb: React.Dispatch<React.SetStateAction<any>>,
  value: string
) => {
  cb((prev: any) => {
    return {...prev, sessionName: value};
  });
};

NewSessionHandlers.InitialPomodoroTimeChange = (
  cb: React.Dispatch<React.SetStateAction<any>>,
  value: number
) => {
  cb((prev: any) => {
    return {...prev, initialPomodoroTime: value};
  });
};

NewSessionHandlers.InitailShortBreakChange = (
  cb: React.Dispatch<React.SetStateAction<any>>,
  value: number
) => {
  cb((prev: any) => {
    return {...prev, initialShortBreak: value};
  });
};

NewSessionHandlers.InitialLongBreakChange = (
  cb: React.Dispatch<React.SetStateAction<any>>,
  value: number
) => {
  cb((prev: any) => {
    return {...prev, initialLongBreak: value};
  });
};

NewSessionHandlers.StartSessionClick = async (
  cb: React.Dispatch<React.SetStateAction<any>>,
  sessionDetails: any,
  userId: string,
  database: Database
) => {
  try {
    cb((prev: any) => {
      return {...prev, isLoading: true};
    });
    let newSession = null;
    //@ts-ignore
    await database.write(async () => {
      newSession = await database
        .get('users_sessions')
        //@ts-ignore
        .create((userSession: User_Session) => {
          userSession.userId = userId;
          userSession.sessionName = sessionDetails.sessionName;
          userSession.sessionDescription = '';
          userSession.sessionCategoryId = sessionDetails.sessionCategoryId;
          userSession.totalSessionTime = '0';
          userSession.totalDistanceHiked = '0.00';
          userSession.dateAdded = formatDateTime(new Date());
        });
    });
    if (newSession !== null) {
      cb((prev: any) => {
        return {...prev, isSessionStarted: true, isLoading: false};
      });
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
    console.error('Error creating new Session in handleStartSessionClick', err);
  }
};

export default NewSessionHandlers;
