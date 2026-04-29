import { Router } from 'express';
import passwordRoutes from './password';
import oauthRoutes from './oauth';
import meRoutes from './me';

const router = Router();
router.use(passwordRoutes);
router.use(oauthRoutes);
router.use(meRoutes);

export default router;
