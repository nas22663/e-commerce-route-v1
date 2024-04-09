import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import * as cartController from "./cart.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { systemRoles } from "../../utils/system-roles.js";

const router = Router();

router.post(
  "/",
  auth(systemRoles.USER),
  expressAsyncHandler(cartController.addToCart)
);

router.put(
  "/:productId",
  auth(systemRoles.USER),
  expressAsyncHandler(cartController.removeFromCart)
);

export default router;
