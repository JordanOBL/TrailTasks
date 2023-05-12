import {Database, Q} from '@nozbe/watermelondb';

async function insertInitialData(watermelonDatabase: Database) {
  try {
    const trailsinDB = watermelonDatabase
      .get('trails')
      .query(Q.where('trail_id', 5))
      .fetch();
    // const trails = await trailsinDB.query().fetch();
    return trailsinDB;
  } catch (error) {
    console.error('Error while inserting initial data:', error);
  }
}

export default insertInitialData;

// {"_cache": {"_debugCollection": [Circular], "map": Map {}, "recordInsantiator": [Function anonymous], "tableName": "trails"}, "_subscribers": [], "changes": {"closed": false, "currentObservers": null, "hasError": false, "isStopped": false, "observers": [], "thrownError": null}, "database": {"_isBeingReset": false, "_isBroken": false, "_pendingNotificationBatches": 0, "_pendingNotificationChanges": [], "_resetCount": 0, "_subscribers": [], "_workQueue": {"_db": [Circular], "_queue": [Array], "_subActionIncoming": false}, "adapter": {"underlyingAdapter": [SQLiteAdapter]}, "collections": {"map": [Object]}, "schema": {"tables": [Object], "unsafeSql": undefined, "version": 1}}, "modelClass": [Function Trail]}
