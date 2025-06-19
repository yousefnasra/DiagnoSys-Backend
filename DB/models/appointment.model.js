import moment from "moment";
import { Schema, Types, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    patientId: { type: Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Types.ObjectId, ref: "User", required: true },

    appointmentDate: { type: String, required: true }, // Format: "MM/DD/YYYY"
    startTime: { type: String, required: true }, // Format: "hh:mm AM/PM"
    appointmentDateTime: { type: Date, required: true }, // Automatically set based on appointmentDate and startTime
    status: {
      type: String,
      enum: ["Scheduled","Re-Scheduled", "Completed", "Cancelled"],
      default: "Scheduled",
    },
    visitType: { type: String, enum: ["Visit", "Re-Visit"] },
    notes: { type: String, min: 3, max: 500, required: true },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

 // Calculate the appointment start and end times based on the given date and start time.
 // Returns an object with appointmentStart and appointmentEnd.
appointmentSchema.statics.calculateTimes = function (appointmentDate, startTime) {
  const appointmentStart = moment(`${appointmentDate} ${startTime}`, "MM/DD/YYYY hh:mm A").toDate();
  const appointmentEnd = new Date(appointmentStart.getTime() + 30 * 60 * 1000);
  return { appointmentStart, appointmentEnd };
};

/**
 * Check for scheduling conflicts.
 * Options object should include:
 * - doctorId
 * - patientId
 * - appointmentStart
 * - appointmentEnd
 * - excludeId (optional): an appointment ID to exclude from the check (useful for updates)
 *
 * Returns an object: { conflict: Boolean, type: "doctor" | "patient" }
 */
appointmentSchema.statics.checkConflicts = async function ({ doctorId, patientId, appointmentStart, appointmentEnd, excludeId}) {
  // Build a common conflict query using $expr to compare computed times.
  const conflictQuery = {
    status: { $ne: "Cancelled" },
    $expr: {
      $and: [
        { $lt: ["$appointmentDateTime", appointmentEnd] },
        { $gt: [{ $add: ["$appointmentDateTime", 30 * 60 * 1000] }, appointmentStart] },
      ],
    },
  };
  // Check for a doctor conflict.
  const doctorConflict = await this.findOne({
    doctorId,
    ...conflictQuery,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });
  if (doctorConflict)
    return { conflict: true, type: "doctor" };
  // Check for a patient conflict.
  const patientConflict = await this.findOne({
    patientId,
    ...conflictQuery,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });
  if (patientConflict)
    return { conflict: true, type: "patient" };
  // If no conflicts found, return false.
  return { conflict: false };
};

// Static method on the Appointment model for retrieving appointments using aggregation
appointmentSchema.statics.getAppointmentsByCriteria = async function ({doctorId, date}) {
  // Create a date range for the given day.
  const startOfDay = moment(date).startOf("day").toDate();
  const endOfDay = moment(date).endOf("day").toDate();
  // Build the initial match stage: filter by appointmentDateTime within the day.
  const matchStage = {
    appointmentDateTime: { $gte: startOfDay, $lte: endOfDay },
  };
  // If a doctorId is provided, add it to the match stage.
  if (doctorId)
    matchStage.doctorId = new Types.ObjectId(doctorId);
  // Construct the aggregation pipeline.
  const aggregatedAppointments = await this.aggregate([
    { $match: matchStage },
    // Lookup patient details.
    {
      $lookup: {
        from: "patients", // Collection name for Patients.
        localField: "patientId",
        foreignField: "_id",
        as: "patient",
      },
    },
    { $unwind: "$patient" },
    // Lookup doctor details.
    {
      $lookup: {
        from: "users", // Collection name for Users (Doctors).
        localField: "doctorId",
        foreignField: "_id",
        as: "doctor",
      },
    },
    { $unwind: "$doctor" },
    // Add a field for patient's age computed from the birthDate.
    {
      $addFields: {
        "patient.age": {
          $floor: {
            $divide: [
              { $subtract: [new Date(), { $toDate: "$patient.birthDate" }] },
              1000 * 60 * 60 * 24 * 365.25
            ]
          }
        }
      }
    },
    // Project the required fields and compute the endTime field.
    {
      $project: {
        appointmentDate: 1,
        startTime: 1,
        appointmentDateTime: 1,
        // Compute endTime by adding 30 minutes (expressed in milliseconds) to appointmentDateTime.
        endTime: { $add: ["$appointmentDateTime", 30 * 60 * 1000] },
        status: 1,
        visitType: 1,
        notes: 1,
        createdBy: 1,
        updatedBy: 1,
        "patient._id": 1,
        "patient.patientName": 1,
        "patient.age": 1,
        "patient.gender": 1,
        "patient.phone": 1,
        "patient.email": 1,
        "doctor._id": 1,
        "doctor.userName": 1,
        "doctor.email": 1,
        "doctor.phone": 1,
        "doctor.profileImage": 1,
        "doctor.specialization": 1,
      },
    },
  ]);
  return aggregatedAppointments;
};

export const Appointment = model("Appointment", appointmentSchema);
