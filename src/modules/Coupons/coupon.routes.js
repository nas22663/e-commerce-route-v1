import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import * as controllers from "./coupon.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./coupon.endpoints.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from "./coupon.validation-schemas.js";

const router = Router();

router.post(
  "/add",
  auth(endPointsRoles.ADD_COUPON),
  validationMiddleware(validators.addCouponSchema),
  expressAsyncHandler(controllers.addCoupon)
);

router.post(
  "/validate",
  auth(endPointsRoles.ADD_COUPON),
  expressAsyncHandler(controllers.validateCoupon)
);

export default router;
