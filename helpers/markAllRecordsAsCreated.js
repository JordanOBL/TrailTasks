import { Database } from '@nozbe/watermelondb';
const TABLES_TO_UPDATE = [
  'users', 'users_sessions',
  'users_addons', 'users_completed_trails', 'users_queued_trails',
  'users_subscriptions', 'users_achievements', 
   'users_purchased_trails',   'sessions_addons', 'users_parks'];

export async function markAllRecordsAsCreated(database: Database) {
    try {
       const resync_completed = await database.localStorage.get('resync_completed');
       if(resync_completed) return; 
    
  await database.write(async () => {
    for (const table of TABLES_TO_UPDATE) {
      const records = await database.get(table).query().fetch();

      records.forEach(record => {
        const keys = Object.keys(record._raw).filter(
          key => !key.startsWith('_') && key !== 'id'
        );
        console.log(record)

        record._raw._status = 'updated';
        record._raw.updated_at = Date.now()
          console.log(Date.now())
        record.__changes = 'updated_at';
      });

      console.debug(`[Sync Reset] Marked ${records.length} records in ${table} as created.`);
    }
  });

//await database.localStorage.set('resync_completed', true);
    } catch (err) {
        console.error('Error in markAllAsCreated:', err);
    }
}

