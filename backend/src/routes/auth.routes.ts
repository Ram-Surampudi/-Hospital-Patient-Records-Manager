
import {Router} from 'express'
import { verifyJWT } from '../middlewares/auth.middlewares';
import { register , login , getDetails , logout } from '../controllers/auth.controller';

const router:Router = Router();

router.route("/register").post(verifyJWT, register);
router.route("/login").post(login);
router.route("/me").get(verifyJWT , getDetails);
router.route("/logout").post(verifyJWT , logout);

export default router;