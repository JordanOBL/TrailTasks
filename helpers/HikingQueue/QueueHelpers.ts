import {Database} from '@nozbe/watermelondb';
import {formatDateTime} from '../formatDateTime';
import { sync } from '../../watermelon/sync';

export const onAddToQueueClick = async ({
  user_id,
  selected_trail_id,
  date_added,
  watermelonDatabase,
}: {
  user_id: number;
  selected_trail_id: number;
  date_added: any;
  watermelonDatabase: Database;
}) => {
  //const date = new Date().getUTCDate()
  const newHikingQueue = await watermelonDatabase
    .get('hiking_queue')
    .create((hikingQueue) => {
      hikingQueue.userId = user_id;
      hikingQueue.trailId = selected_trail_id;
    });
};

export const onDeleteFromQueueClick = async ({
  user_id,
  selected_trail_id,
  watermelonDatabase,
}: {
  user_id: number;
  selected_trail_id: string;
  watermelonDatabase: Database;
}) => {
  try {
    await watermelonDatabase.write(async () => {
      const HikingQueueRowToDelete = await watermelonDatabase
        .get('HikingQueue')
        .find(selected_trail_id);
      await HikingQueueRowToDelete.markAsDeleted();
    });
  } catch (err) {
    console.log('Error attempting to remove from HikingQueue', err);
  }
};

//Run after user clicks "OK" when modal asks to change current trail and trail progress
export const replaceCurrentTrail = async ({
  watermelonDatabase,
  user,
  replacementCurrentTrailId,
  setReplacementCurrentTrailId,
  setShowReplaceCurrentTrailModal,
}: {
  watermelonDatabase: Database;
  user: any;
  replacementCurrentTrailId: number | string | null;
  setReplacementCurrentTrailId: React.Dispatch<
    React.SetStateAction<number | null | string>
  >;
  setShowReplaceCurrentTrailModal: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}) => {
  //Are you sure you want to replace the current trail. Current Trail progress will be rest, but toal user miles hiked will be saved.
  //if yes, set trail.trail_id(replacementTrailId)
  //else
  //setReplacementTrailId(null)
  //setReplaceCurrentTrailModal(false)
  try
  {
    const now = new Date();
    const formattedDateTime: string = formatDateTime(now);
    console.log({replacementCurrentTrailId})
  await watermelonDatabase.write(async () => {
    const userToUpdate = await watermelonDatabase.get('users').find(user.id);
    await userToUpdate.update(() => {
      user.trailId = replacementCurrentTrailId;
      user.trailProgress = "0.0";
      user.trailStartDate = formattedDateTime;
    });
  });
  setReplacementCurrentTrailId(null);
    setShowReplaceCurrentTrailModal(false);
    await sync(watermelonDatabase)
  } catch (err)
  {
    console.log('Error in "replaceCurrentTrail" helper function', err)
  }
  
};

//onPress "start Now" (number)
export const startNowClick = async ({
  watermelonDatabase,
  selected_trail_id,
  current_trail_id,
  setUser,
  user,
  setReplacementCurrentTrailId,
  setShowReplaceCurrentTrailModal,
}: {
  selected_trail_id: number;
  current_trail_id: number | null;
  setUser: (prev: any) => void;
  user: any;
  watermelonDatabase: Database;
  setReplacementCurrentTrailId: React.Dispatch<React.SetStateAction<number | null>>;
  setShowReplaceCurrentTrailModal: React.Dispatch<
    React.SetStateAction<boolean>
  >;
}) => {
  const now = new Date();
  const formattedDateTime: string = formatDateTime(now);
  //if there is NOT a current trail, make it the current trail
  console.log('startNowClick', {selected_trail_id, current_trail_id});
  if (user.trail_id === null) {
    await watermelonDatabase.write(async () => {
      const userToUpdate = await watermelonDatabase.get('users').find(user.id);
      await userToUpdate.update(() => {
        user.trail_id = selected_trail_id;
        user.trail_progress = "0.0";
        user.trail_start_date = formattedDateTime;
      });
    });
  } else {
    setReplacementCurrentTrailId(selected_trail_id);
    setShowReplaceCurrentTrailModal(true);
  }
};
