const getSafeLastPulledAt = req => {
  const lastPulledAt = req.body('lastPulledAt');
  if (lastPulledAt !== 'null') {
    return DateTime.fromMillis(parseInt(lastPulledAt)).toString();
  }
  return DateTime.fromMillis(1).toString();
};

export default SyncController = {
  async pull({request}) {
    const {changes} = request.body();

    if (changes?.users_miles?.created?.length > 0) {
      await Users_Miles.createMany(
        changes.users_miles.created.map(remoteEntry => ({
          note: remoteEntry.note,
          weight: remoteEntry.weight,
          watermelonId: remoteEntry.id,
          createdAt: DateTime.fromMillis(parseInt(remoteEntry.created_at)),
        })),
      );
    }

    if (changes?.users_miles?.updated?.length > 0) {
      const updateQueries = changes.users_miles.updated.map(remoteEntry => {
        return Users_Miles.query()
          .where('watermelonId', remoteEntry.id)
          .update({
            user_id: remoteEntry.user_id,
            total_miles: remoteEntry.total_miles,
          });
      });
      await Promise.all(updateQueries);
    }

    if (changes?.users_miles?.deleted?.length > 0) {
      await User_Miles.query()
        .where('watermelon_id', changes.users_miles.deleted)
        .exec();
    }
  },
  async push({request}) {
    const lastPulledAt = getSafeLastPulledAt(request);
    const created = await Users_Miles.query()
      .where('created_at', '>', lastPulledAt)
      .exec();
    const updated = await Users_Miles.query()
      .where('updated_at', '>', lastPulledAt)
      .exec();
    return {
      changes: {
        users_miles: {
          created,
          updated,
          deleted: [],
        },
      },
      timestamp: Date.now(),
    };
  },
};
