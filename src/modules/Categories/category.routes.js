import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import * as categoryController from "./category.controller.js";
import { multerMiddleHost } from "../../middlewares/multer.middleware.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";
import { endPointsRoles } from "./category.endpoints.js";

const router = Router();

router.post(
  "/",
  auth(endPointsRoles.ADD_CATEGORY),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(categoryController.addCategory)
);

router.put(
  "/:categoryId",
  auth(endPointsRoles.ADD_CATEGORY),
  multerMiddleHost({ extensions: allowedExtensions.image }).single("image"),
  expressAsyncHandler(categoryController.updateCategory)
);

router.get("/", expressAsyncHandler(categoryController.getAllCategories));

router.delete(
  "/:categoryId",
  auth(endPointsRoles.ADD_CATEGORY),
  expressAsyncHandler(categoryController.deleteCategory)
);

export default router;
