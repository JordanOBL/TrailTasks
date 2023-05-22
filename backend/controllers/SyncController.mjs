import {Op} from 'sequelize';
import {User} from '../db/sequelizeModel.mjs';

const getSafeLastPulledAt = (lastPulledAt) => {
  if (lastPulledAt !== 'null') {
    return new Date(parseInt(lastPulledAt, 10)).toISOString();
  }
  return new Date(1).toISOString();
};

const SyncController = {
   async pull(req, res, next) {
    try
    {
      console.log('Pulling...');
      const changes = req.body.changes;
      if (changes?.users?.created?.length > 0) {
        await User.bulkCreate(changes.users.created);
      }
      if (changes?.users?.updated?.length > 0) {
        const updateQueries = changes.users.updated.map((remoteEntry) => {
          return User.update(remoteEntry, {
            where: {
              id: remoteEntry.id,
            },
          });
        });
        await Promise.all(updateQueries);
      }
      if (changes?.users?.deleted?.length > 0) {
        await User.destroy({
          where: {
            id: changes.users.deleted,
          },
        });
      }
    } catch (err) {
      console.log('Error in syncController.pull', err);
    }

    return next();
  },
  async push(
    req,
    res,
    next
  ) {
    try
    {
      console.log('pushing...')
      const lastPulledAt = getSafeLastPulledAt(req.query.lastPulledAt);
      const created = await User.findAll({
        where: {
          createdAt: {
            [Op.gt]: lastPulledAt,
          },
        },
      });
      const updated = await User.findAll({
        where: {
          updatedAt: {
            [Op.gt]: lastPulledAt,
          },
        },
      });
      res.locals.changes = {
        users: {
          created,
          updated,
          deleted: [],
        },
      };

      res.locals.timestamp = Date.now();
      return next();
    } catch (err) {
      console.log('Error in syncController.push', err);
    }
  },
};

export default SyncController;
