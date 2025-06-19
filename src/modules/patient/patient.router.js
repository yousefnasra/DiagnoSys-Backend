import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import * as patientController from "./patient.controller.js";
import * as patientSchema from "./patient.schema.js";

const router = Router();

// & ================ Patient Routes ================ & //
// add patient
router.post(
  "/",
  isAuthenticated,
  isAuthorized("receptionist"),
  validation(patientSchema.addPatient),
  patientController.addPatient
);

// update patient
router.put(
  "/:id",
  isAuthenticated,
  isAuthorized("receptionist","doctor"),
  validation(patientSchema.updatePatient),
  patientController.updatePatient
);

// delete patient
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized("receptionist"),
  validation(patientSchema.deletePatient),
  patientController.deletePatient
);

// get all patients and search by name, national id, or phone
router.get(
  "/",
  isAuthenticated,
  isAuthorized("receptionist"),
  patientController.getPatients
);

// get patient by id
router.get(
  "/:id",
  isAuthenticated,
  isAuthorized("receptionist"),
  patientController.getPatientById
);
// & ================ End of Patient Routes ================ & //
export default router;
