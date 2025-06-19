import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import * as examinationController from "./examination.controller.js";
import * as examinationSchema from "./examination.schema.js";
import { fileUpload } from "../../utils/fileUpload.js";

const router = Router();

// & ================ Examination Routes ================ & //
// add Examination
router.post(
  "/",
  isAuthenticated,
  isAuthorized("doctor"),
  validation(examinationSchema.addExamination),
  examinationController.addExamination
);

// get all Examinations and search by patient name, national id, or phone
router.get(
  "/",
  isAuthenticated,
  isAuthorized("doctor", "laboratory", "radiology"),
  examinationController.getExaminations
);

// get Examination by id
router.get(
  "/:id",
  isAuthenticated,
  isAuthorized("doctor", "laboratory", "radiology"),
  validation(examinationSchema.getExaminationById),
  examinationController.getExaminationById
);

// update to add Examination response and status by laboratory
router.put(
  "/laboratory/:id",
  isAuthenticated,
  isAuthorized("laboratory"),
  fileUpload().single("pdf"),
  validation(examinationSchema.updateLaboratoryExaminationResponse),
  examinationController.updateLaboratoryExaminationResponse
);

// update to add Examination response and status by radiology
router.put(
  "/radiology/:id",
  isAuthenticated,
  isAuthorized("radiology"),
  fileUpload().fields([
    { name: "image", maxCount: 1 },
    { name: "pdf", maxCount: 1 }
  ]),
  validation(examinationSchema.updateRadiologyExaminationResponse),
  examinationController.updateRadiologyExaminationResponse
);

// cancel Examination
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorized("doctor", "laboratory", "radiology"),
  validation(examinationSchema.getExaminationById),
  examinationController.cancelExamination
);

// & ================ End of Examination Routes ================ & //
export default router;