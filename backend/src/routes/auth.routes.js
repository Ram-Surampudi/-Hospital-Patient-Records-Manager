
import { Router } from 'express'
import { verifyJWT } from '../middlewares/auth.middlewares.js';
import { register, login, getDetails, logout } from '../controllers/auth.controller.js';

const router = Router();

router.route("/register").post(verifyJWT, register);
router.route("/login").post(login);
router.route("/me").get(verifyJWT, getDetails);
router.route("/logout").post(verifyJWT, logout);

export default router;