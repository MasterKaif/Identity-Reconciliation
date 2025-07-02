import { Router } from 'express';
import { identifyContact } from '../controller/IdentifyController';

const router = Router();

router.post('/', identifyContact);

export default router;
