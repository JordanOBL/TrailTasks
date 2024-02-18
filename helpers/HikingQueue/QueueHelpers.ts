import {Database} from '@nozbe/watermelondb';
import formatDateTime from '../formatDateTime';
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
  const newQueuedTrail = await watermelonDatabase
    .get('queuedTrails')
    .create((queuedTrail) =>
    {
      //@ts-ignore
      queuedTrail.userId = user_id;
      //@ts-ignore
      queuedTrail.trailId = selected_trail_id;
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
      const queuedTrailRowToDelete = await watermelonDatabase
        .get('queuedTrails')
        .find(selected_trail_id);
      await queuedTrailRowToDelete.markAsDeleted();
    });
  } catch (err) {
    console.log('Error attempting to remove from queuedTrail', err);
  }
};


