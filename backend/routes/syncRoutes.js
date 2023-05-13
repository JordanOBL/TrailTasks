import {Router} from 'express';
import SyncController from '../controllers/SyncController';

export const router = new Router();

router.get('/sync', SyncController.pull, async (req, res) => {
  res.status(200).json();
});
router.post('/sync', SyncController.push, async (req, res) => {
  res.status(200).json();
});
