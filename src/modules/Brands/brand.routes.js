import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import * as controllers from "./brand.controller.js";
import { multerMiddleHost } from "../../middlewares/multer.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { endPointsRoles } from "./brand.endpoints.js";

const router = Router();

router.post(
  "/",
  auth(endPointsRoles.ADD_BRAND),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(controllers.addBrand)
);

export default router;
