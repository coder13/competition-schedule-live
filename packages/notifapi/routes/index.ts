import { Router } from 'express';
import auth from './auth';
import subscriptions from './subscriptions';

const router = Router();

router.use('/auth', auth);
router.use('/subscriptions', subscriptions);

export default router;
