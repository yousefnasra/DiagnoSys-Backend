import { Examination } from "../../../DB/models/examination.model.js";
import { Patient } from "../../../DB/models/patient.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// add Patient
export const addPatient = asyncHandler(async (req, res, next) => {
  // data from request
  const { nationalId } = req.body;
  // check patient existence
  const patient = await Patient.findOne({ nationalId });
  if (patient)
    return next(new Error("patient already exists!", { cause: 409 }));
  // create new patient
  await Patient.create({...req.body, createdBy: req.user._id });
  // send Response
  return res.status(201).json({ success: true, message: "patient added successfully!" });
});

// update Patient
export  const updatePatient = asyncHandler(async (req, res, next) => {
  // data from request
  const { id } = req.params;
  // check patient existence
  const patient = await Patient.findById(id);
  if (!patient) return next(new Error("patient not found!", { cause: 404 }));
  // update patient
  const updatePatient = await Patient.findByIdAndUpdate(id, { $set: { ...req.body, updatedBy: req.user._id }}, { new: true });
  // send Response
  return res.json({ success: true, message: "patient updated successfully!", data: updatePatient  });
});

// delete Patient
export const deletePatient = asyncHandler(async (req, res, next) => {
  // data from request
  const { id } = req.params;
  // check patient existence
  const patient = await Patient.findById(id);
  if (!patient) return next(new Error("patient not found!", { cause: 404 }));
  // delete patient
  await patient.deleteOne();
  // send Response
  return res.json({ success: true, message: "patient deleted successfully!" });
});

// get patient and examinations by national id
export const getPatientByNationalId = asyncHandler(async (req, res, next) => {
  // data from request
  const { nationalId } = req.params;
  // check patient existence
  const patient = await Patient.findOne({ nationalId });
  if (!patient) return next(new Error("patient not found!", { cause: 404 }));
  // get patient examinations
  const patientData = await Examination.find({ patientId: patient._id , status: "Completed" })
  .select("doctorId requestTo labExaminationType radExaminationType examinationResponse updatedAt")
  .populate("doctorId", "userName phone specialization");
  // send Response
  return res.json({ success: true, message: "patient retrieved successfully!", data: patient , results: patientData });
});

// get all Patients
export const getPatients = asyncHandler(async (req, res, next) => {
  // data from request
  const { keyword } = req.query;
  // get patients with seeacrh
  const patients = await Patient.find({ ...req.query }).search(keyword);
  // send Response
  return res.json({ success: true, message: "patients retrieved successfully!", data: patients });
});

// get Patient by id
export const getPatientById = asyncHandler(async (req, res, next) => {
  // data from request
  const { id } = req.params;
  // check patient existence
  const patient = await Patient.findById(id);
  if (!patient) return next(new Error("patient not found!", { cause: 404 }));
  // send Response
  return res.json({ success: true, message: "patient retrieved successfully!", data: patient });
});