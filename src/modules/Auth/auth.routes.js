import { Router } from "express";
import expressAsyncHandler from "express-async-handler";
import * as authController from "./auth.controller.js";

const router = Router();

router.post("/signup", expressAsyncHandler(authController.signUp));
router.get("/confirm-email", expressAsyncHandler(authController.confirmEmail));
router.post("/login", expressAsyncHandler(authController.signIn));

export default router;
