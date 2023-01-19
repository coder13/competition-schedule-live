import { Router } from 'express';
import cors from 'cors';
import notifyRouter from './notify';
import admin from './admin';

const router = Router();

router.use(
  cors<cors.CorsRequest>({
    origin: '*',
  })
);

router.use((req, _, next) => {
  console.log(req.headers);

  next();
});

router.use('/admin', admin);
router.use(notifyRouter);

export default router;
