import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import * as authController from "./auth.controller.js";
import * as authSchema from "./auth.schema.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload } from "../../utils/fileUpload.js";

const router = Router();

// Register
router.post('/register', isAuthenticated, isAuthorized("admin"), validation(authSchema.register), authController.register);

// Activate Account
router.get("/activate_account/:token", validation(authSchema.activateAccount), authController.activateAccount);

// Login
router.post('/login', validation(authSchema.login), authController.login);

// Send Forget Code
router.patch('/forgetCode', validation(authSchema.forgetCode), authController.forgetCode);

// Reset Password
router.patch('/resetPassword', validation(authSchema.resetPassword), authController.resetPassword);

// Get User Profile
router.get('/', isAuthenticated, authController.getProfile);

// Update User Profile
router.put('/', isAuthenticated, fileUpload().single("profileImage"), validation(authSchema.updateProfile), authController.updateProfile);

// logout
router.get('/logout', isAuthenticated, authController.logout);

export default router;