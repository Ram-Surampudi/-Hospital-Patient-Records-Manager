
import {Router} from 'express'
import { validatePermissionForAcess, verifyJWT } from '../middlewares/auth.middlewares';
import { toggleIsActive, createAnewAdmin , deleteAdmin , listAllUsers , updateDetails } from '../controllers/user.controller';
import { Role } from '@prisma/client';

const router = Router();

router.route("/")
        .get( verifyJWT ,validatePermissionForAcess([Role.SUPERADMIN, Role.DOCTOR]), listAllUsers)
        .post(verifyJWT , validatePermissionForAcess([Role.SUPERADMIN, Role.DOCTOR]), createAnewAdmin)

router.route("/:id")
        .post(verifyJWT , validatePermissionForAcess([Role.SUPERADMIN, Role.DOCTOR]),  updateDetails)
        .delete(verifyJWT , validatePermissionForAcess([Role.SUPERADMIN]),  deleteAdmin)

router.route("/:id/toggle").patch(verifyJWT , validatePermissionForAcess([Role.SUPERADMIN]),  toggleIsActive);

export default router;