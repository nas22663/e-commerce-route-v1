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

router.delete(
  "/delete/:brandId",
  auth(endPointsRoles.DELETE_BRAND),
  expressAsyncHandler(controllers.deleteBrand)
);

router.get("/", expressAsyncHandler(controllers.getAllBrands));

router.put(
  "/:brandId",
  auth(endPointsRoles.UPDATE_BRAND),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(controllers.updateBrand)
);

export default router;
