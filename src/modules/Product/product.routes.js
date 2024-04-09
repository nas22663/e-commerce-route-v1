import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import { multerMiddleHost } from "../../middlewares/multer.middleware.js";
import * as controllers from "./product.controller.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { endPointsRoles } from "./product.endpoints.js";

const router = Router();

router.post(
  "/",
  auth(endPointsRoles.ADD_PRODUCT),
  multerMiddleHost({ extensions: allowedExtensions.image }).array("image", 3),
  expressAsyncHandler(controllers.addProduct)
);

router.put(
  "/:productId",
  auth(endPointsRoles.ADD_PRODUCT),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(controllers.updateProduct)
);

router.get("/", expressAsyncHandler(controllers.getAllProducts));

export default router;
