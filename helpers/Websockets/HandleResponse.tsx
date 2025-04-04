export const handleResponse = (
  message,
  setHikers,
  setRoomId,
  setView,
  user,
  setMessageQueue,
  setError,
  setTimer,
  setSession
) => {
  let { header, response }= message;

  function reset() {
    setTimer({
      startTime: null,
      isRunning: false,
      pace: 2.0,
      completedSets: 0,
      isCompleted: false,
      isBreak: false,
      duration: 1500,
      focusTime: 1500,
      shortBreakTime: 300,
      longBreakTime: 2700,
      sets: 3,
      autoContinue: false
    });
    setSession({
      name: '',
      distance: 0.0,
      level: 1,
      highestCompletedLevel: 0,
      strikes: 0,
      tokensEarned: 0,
      bonusTokens: 0,
    });
  }

  console.log("new message for user: ",user.username, message.response);

  switch (header.protocol) {
    case "create":
      setRoomId(header.roomId);
      setHikers(response.hikers);
      setView("lobby");
      break;

    case "join":
      setHikers(prev => ({
        ...prev,
        ...response.hikers,
      }));
      if (response.type === 'direct') {
        setView("lobby");
        setTimer(response.timer);
        setSession(response.session);
      }
      break;

    case "newHost":
      setHikers(response.hikers);
      break;

    case "updateConfig":
      setTimer( prev => ({ ...prev, ...response.timerConfig }) ); //setTimer(response.timerConfig);
      setSession(prev => ({ ...prev, ...response.sessionConfig })); //setSession(response.sessionConfig);
      break;

    case "ready":
      console.log("ready resonse hikers: ", response.hikers);
        setHikers((prev) =>(  {...prev, ...response.hikers} ));
        break;
    case "start":
      setTimer(prev => ({ ...prev, ...response.timer }));
      setSession(prev => ({ ...prev, ...response.session }));
      setView("timer");
      break;

    case "update":
      setTimer(prev => ({ ...prev, ...response.timer, duration: response.remainingTime }));
      setSession(prev => ({ ...prev, ...response.session }));
      setHikers(prev => ({ ...prev, ...response.hikers }));
      break;

    case "pause":
      if (response.type === "broadcast") {
        if(response.session.isBreak) {
          setHikers(prev => ({
            ...prev,
            [response.pausedHikerId]: {
              ...prev[response.pausedHikerId],
              isPaused: false
            }
          }));
        } else {
        setHikers(prev => ({
          ...prev,
          [response.pausedHikerId]: {
            ...prev[response.pausedHikerId],
            isPaused: true,
            strikes: prev[response.pausedHikerId].strikes + 1,
          }
        }));
        }
      }
      setSession(prev => ({ ...prev, ...response.session }));
      break;

    case "resume":
      if (response.type === "broadcast") {
        setHikers(prev => ({
          ...prev,
          [response.resumeHikerId]: {
            ...prev[response.resumeHikerId],
            isPaused: false
          }
        }));
      } else {
        setTimer(prev => ({ ...prev, duration: response.remainingTime }));
      }
      break;

    case "shortBreak":
        setTimer(prev => ({ ...prev, ...response.timer }));
        setSession(prev => ({ ...prev, ...response.session }));
        setView("timer");
        break;
    //emdModal sets view to show EndSessionmodal
    case "endModal":
      setView("endModal");
      break;

    case "extraSet":
        setTimer(prev => ({ ...prev, ...response.timer }));
        setSession(prev => ({ ...prev, ...response.session }));
        setView("timer");
        break;
    case "extraSession":
        setTimer(prev => ({ ...prev, ...response.timer }));
        setSession(prev => ({ ...prev, ...response.session }));
        setView("timer");
        break;
    case "end":
      setHikers(prev => ({ ...prev, [user.id]: { ...prev[user.id], isPaused: false, isReady: false}}));
      setTimer(prev => ({ ...prev, isRunning: false, isCompleted: true , distance: prev.focusTime}));
      setView("results");
      break;

    

    default:
      console.log("Unknown protocol:", header.protocol);
  }

  if (response.message) {
    setMessageQueue(prev => [...prev, response.message]);
  }
  if (response.status === "Error") {
    console.error("Error:", response.message);
    setError(response.message);
  }
};

