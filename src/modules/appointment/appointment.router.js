import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import * as appointmentController from "./appointment.controller.js";
import * as appointmentSchema from "./appointment.schema.js";

const router = Router();

// & ================ Appointment Routes ================ & //
// get doctors & filter by name or specialty
router.get(
  "/doctors",
  isAuthenticated,
  isAuthorized("receptionist"),
  appointmentController.getDoctors
);

// add appointment
router.post(
  "/",
  isAuthenticated,
  isAuthorized("receptionist"),
  validation(appointmentSchema.addAppointment),
  appointmentController.addAppointment
);

// update appointment
router.put(
    "/:id",
    isAuthenticated,
    isAuthorized("receptionist"),
    validation(appointmentSchema.updateAppointment),
    appointmentController.updateAppointment
    );

// cancel appointment
router.patch(
    "/:id",
    isAuthenticated,
    isAuthorized("receptionist"),
    validation(appointmentSchema.cancelAppointment),
    appointmentController.cancelAppointment
    );

// get all appointments and search by patient name, doctor name, or date
router.get(
  "/",
  isAuthenticated,
  isAuthorized("receptionist"),
  validation(appointmentSchema.getAppointments),
  appointmentController.getAppointments
);

// get appointments by doctor id and filter by date
router.get(
  "/doctor",
  isAuthenticated,
  isAuthorized("doctor"),
  validation(appointmentSchema.getAppointmentsByDoctorId),
  appointmentController.getAppointmentsByDoctorId
);

// get appointment by id
router.get(
  "/:id",
  isAuthenticated,
  isAuthorized("doctor"),
  appointmentController.getAppointmentById
);

// end appointment
router.patch(
  "/end/:id",
  isAuthenticated,
  isAuthorized("doctor"),
  validation(appointmentSchema.endAppointment),
  appointmentController.endAppointment
);
// & ================ End of Appointment Routes ================ & //
export default router;
