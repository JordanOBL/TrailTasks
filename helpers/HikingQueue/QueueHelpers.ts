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
    .create((hikingQueue) =>
    {
      //@ts-ignore
      hikingQueue.userId = user_id;
      //@ts-ignore
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


