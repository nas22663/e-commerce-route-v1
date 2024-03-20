import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import * as controllers from "./sub-category.controller.js";
import { multerMiddleHost } from "../../middlewares/multer.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { endPointsRoles } from "./sub-category.endpoints.js";

const router = Router();

router.post(
  "/:categoryId",
  auth(endPointsRoles.ADD_SUB_CATEGORY),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(controllers.addsubCategory)
);

export default router;
