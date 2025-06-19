import { asyncHandler } from "../../utils/asyncHandler.js";
import { Appointment } from "../../../DB/models/appointment.model.js";
import { Patient } from "../../../DB/models/patient.model.js";
import { User } from "../../../DB/models/user.model.js";

// get doctors & filter by name or specialty
export const getDoctors = asyncHandler(async (req, res, next) => {
  // data from request
  const { keyword } = req.query;
  // get doctors with search
  const doctors = await User.searchDoctors(keyword);
  // send Response
  return res.json({success: true, message: "doctors retrieved successfully!", data: doctors});
});

// add appointment
export const addAppointment = asyncHandler(async (req, res, next) => {
  // data from request
  const { doctorId, patientId, appointmentDate, startTime } = req.body;
  // Validate that the doctor exists.
  const doctor = await User.findById(doctorId);
  if (!doctor)
    return next(new Error("Doctor not found.", { cause: 404 }));
  // Validate that the patient exists.
  const patient = await Patient.findById(patientId);
  if (!patient)
    return next(new Error("Patient not found.", { cause: 404 }));
  // Calculate start and end times.
  const { appointmentStart, appointmentEnd } = Appointment.calculateTimes(appointmentDate, startTime);
  // Validate that the appointment time is not in the past.
  if (appointmentStart < new Date())
    return next(new Error("Appointment time cannot be in the past.", { cause: 400 }));
  // Check for conflicts.
  const conflict = await Appointment.checkConflicts({
    doctorId,
    patientId,
    appointmentStart,
    appointmentEnd
  });
  if (conflict.conflict) {
    const errorMessage = conflict.type === "doctor"
      ? "This doctor is already reserved during this time slot."
      : "Patient already has an appointment scheduled during this time slot.";
    return next(new Error(errorMessage, { cause: 409 }));
  }
  // Create the appointment.
  const appointment = await Appointment.create({
    ...req.body,
    appointmentDateTime: appointmentStart,
    createdBy: req.user._id,
  });
  // send Response
  return res.status(201).json({ success: true, message: "Appointment created successfully.", data: { ...appointment.toObject(), endTime: appointmentEnd } });
});

// update appointment
export const updateAppointment = asyncHandler(async (req, res, next) => {
  // data from request
  const { id } = req.params;
  const { appointmentDate, startTime } = req.body;
  // Retrieve the appointment to update.
  const appointment = await Appointment.findById(id);
  if (!appointment)
    return next(new Error("Appointment not found.", { cause: 404 }));
  // Disallow updates if the appointment is cancelled.
  if (appointment.status === "Cancelled")
    return next(new Error("Cannot update a cancelled appointment.", { cause: 400 }));
  // Use updated values if provided; otherwise, use existing values.
  const newDate = appointmentDate || appointment.appointmentDate;
  const newTime = startTime || appointment.startTime;
  // Calculate new appointment start and end times.
  const { appointmentStart: newAppointmentStart, appointmentEnd: newAppointmentEnd } =
    Appointment.calculateTimes(newDate, newTime);
  // Validate that the new appointment time is not in the past.
  if (newAppointmentStart < new Date())
    return next(new Error("Appointment time cannot be in the past.", { cause: 400 }));
  // Check for scheduling conflicts; exclude the appointment being updated.
  const conflict = await Appointment.checkConflicts({
    doctorId: appointment.doctorId,
    patientId: appointment.patientId,
    appointmentStart: newAppointmentStart,
    appointmentEnd: newAppointmentEnd,
    excludeId: appointment._id,
  });
  if (conflict.conflict) {
    const errorMessage = conflict.type === "doctor"
      ? "This doctor is already reserved during this time slot."
      : "Patient already has an appointment scheduled during this time slot.";
    return next(new Error(errorMessage, { cause: 409 }));
  }
  // Update the appointment.
  const updatedAppointment = await Appointment.findByIdAndUpdate(
    id,
    {
      ...req.body,
      appointmentDate: newDate,
      startTime: newTime,
      appointmentDateTime: newAppointmentStart,
      status: "Re-Scheduled",
      updatedBy: req.user._id,
    },
    { new: true }
  );
  // send Response
  return res.json({ success: true, message: "Appointment updated successfully.", data: { ...updatedAppointment.toObject(), endTime: newAppointmentEnd } });
});

// cancel appointment
export const cancelAppointment = asyncHandler(async (req, res, next) => {
  // data from request
  const { id } = req.params;
  // Check if the appointment exists.
  const appointment = await Appointment.findById(id);
  if (!appointment)
    return next(new Error("Appointment not found.", { cause: 404 }));
  // Check if the appointment is already cancelled.
  if (appointment.status === "Cancelled")
    return next(new Error("Appointment is already cancelled.", { cause: 400 }));
  // Cancel the appointment.
  const cancelledAppointment = await Appointment.findByIdAndUpdate(
    id,
    { status: "Cancelled", updatedBy: req.user._id },
    { new: true }
  );
  // send Response
  return res.json({success: true, message: "Appointment cancelled successfully.", data: cancelledAppointment});
});

// get appointments by date
export const getAppointments = asyncHandler(async (req, res, next) => {
 // data from request
  const { date } = req.query;
 // get data from Appointment model using the static method
  const appointments = await Appointment.getAppointmentsByCriteria({date});
  // send Response
  return res.json({ success: true, message: "Appointments retrieved successfully.", data: appointments , count: appointments.length });
});

// get appointments by doctor id and filter by date
export const getAppointmentsByDoctorId = asyncHandler(async (req, res, next) => {
  // data from request
  const { date } = req.query;
  const doctorId = req.user._id;
  // get data from Appointment model using the static method
  const appointments = await Appointment.getAppointmentsByCriteria({doctorId, date});
  // send Response
  return res.json({ success: true, message: "Appointments retrieved successfully.", data: appointments , count: appointments.length });
});

// get appointment by id
export const getAppointmentById = asyncHandler(async (req, res, next) => {
  // data from request
  const { id } = req.params;
  // get appointment by id
  const appointment = await Appointment.findById(id).populate("patientId");
  // Check if the appointment exists.
  if (!appointment)
    return next(new Error("Appointment not found.", { cause: 404 }));
  // send Response
  return res.json({success: true, message: "Appointment retrieved successfully.", data: appointment});
});

// end appointment
export const endAppointment = asyncHandler(async (req, res, next) => {
  // data from request
  const { id } = req.params;
  // Check if the appointment exists.
  const appointment = await Appointment.findById(id);
  if (!appointment)
    return next(new Error("Appointment not found.", { cause: 404 }));
  // Check if the appointment is already ended.
  if (appointment.status === "Completed")
    return next(new Error("Appointment is already completed.", { cause: 400 }));
  // Update the appointment status to completed.
  const updatedAppointment = await Appointment.findByIdAndUpdate(
    id,
    { status: "Completed", updatedBy: req.user._id },
    { new: true }
  );
  // send Response
  return res.json({success: true, message: "Appointment ended successfully.", data: updatedAppointment});
});