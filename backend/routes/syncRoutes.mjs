import {Router} from 'express';
import SyncController from '../controllers/SyncController.mjs';

export const router = Router();

router.get('/push', (req, res) => {
  r
});
router.post('/pull', SyncController.pull, (req, res) => {
  res.status(200).json();
});

export default router;
