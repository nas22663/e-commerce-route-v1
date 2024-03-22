import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import * as controllers from "./user.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./user.endpoints.js";

const router = Router();

router.put(
  "/update",
  auth(endPointsRoles.UPDATE_USER),
  expressAsyncHandler(controllers.updateUser)
);

router.delete(
  "/delete/:userId",
  auth(endPointsRoles.UPDATE_USER),
  expressAsyncHandler(controllers.deleteUser)
);

router.get(
  "/profile",
  auth(endPointsRoles.UPDATE_USER),
  expressAsyncHandler(controllers.getUserProfileData)
);

export default router;
