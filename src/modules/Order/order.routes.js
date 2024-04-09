import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import * as controllers from "./order.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { systemRoles } from "../../utils/system-roles.js";
// import { endPointsRoles } from "./order.endpoints.js";
// import { validationMiddleware } from "../../middlewares/validation.middleware.js";

const router = Router();

router.post(
  "/create",
  auth(systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN),
  expressAsyncHandler(controllers.createOrder)
);

router.post(
  "/cartToOrder",
  auth(systemRoles.USER, systemRoles.ADMIN, systemRoles.SUPER_ADMIN),
  expressAsyncHandler(controllers.cartToOrder)
);

router.put(
  "/:orderId",
  auth(systemRoles.DELIVERY_ROLE),
  expressAsyncHandler(controllers.orderDelivery)
);

export default router;
