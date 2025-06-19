import { Examination } from "../../../DB/models/examination.model.js";
import { Patient } from "../../../DB/models/patient.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";

// add Examination
export const addExamination = asyncHandler(async (req, res, next) => {
  // data from request
  const { patientId } = req.body;
  // check patient existence
  const patient = await Patient.findById(patientId);
  if (!patient) return next(new Error("Patient not found!", { cause: 404 }));
  // create new examination
  await Examination.create({ ...req.body, doctorId: req.user._id });
  // send Response
  return res.status(201).json({ success: true, message: "Examination added successfully!" });
});

// get all Examinations and search by patient name, national id, or phone
export const getExaminations = asyncHandler(async (req, res, next) => {
  // data from request
  const { keyword } = req.query;
  // get examinations with search
  const examinations = await Examination.searchExaminations(keyword);
  // send Response
  return res.json({ success: true, message: "Examinations retrieved successfully!", data: examinations });
});

// get Examination by id
export const getExaminationById = asyncHandler(async (req, res, next) => {
  // data from request
  const { id } = req.params;
  // get examination by id
  const examination = await Examination.findById(id)
    .populate("patientId", "patientName nationalId phone gender birthDate age")
    .populate("doctorId", "userName email phone specialization profileImage");
  // check examination existence
  if (!examination) return next(new Error("Examination not found!", { cause: 404 }));
  // send Response
  return res.json({ success: true, message: "Examination retrieved successfully!", data: examination });
});

// update to add Examination response and status by laboratory
export const updateLaboratoryExaminationResponse = asyncHandler(async (req, res, next) => {
  // check pdf file
    if (!req.file) return next(new Error("examination pdf file is required!", { cause: 400 }));
  // data from request
  const { id } = req.params;
  const { bodyPart, responseNotes, findings, impression } = req.body;
  // get examination by id
  const examination = await Examination.findById(id);
  // check examination existence
  if (!examination) return next(new Error("Examination not found!", { cause: 404 }));
  // check if examination is cancelled or completed
  if (examination.status === "Cancelled" || examination.status === "Completed")
    return next(new Error("Cannot update response for a cancelled or completed examination!", { cause: 400 }));
  // upload pdf file in cloudinary
  const { secure_url, public_id } = await  cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/examinations/${examination._id}`,
    });
  // update examination response
  examination.examinationResponse = {
    pdfUrl: { id: public_id, url: secure_url },
    bodyPart,
    responseNotes,
    findings,
    impression,
    responseDateTime: new Date(),
  };
  examination.status = "Completed"; // update status to completed
  examination.updatedBy = req.user._id; // update updatedBy field
  await examination.save();
  // send Response
  return res.json({ success: true, message: "Examination response updated successfully!", data: examination });
});

// update to add Examination response and status by radiology
export const updateRadiologyExaminationResponse = asyncHandler(async (req, res, next) => {
   // Check if both the "image" and "examinations" files are provided.
  if (!req.files || !req.files.image || !req.files.pdf || req.files.image.length === 0 || req.files.pdf.length === 0) {
    return next(new Error("Both image and examination PDF file are required!", { cause: 400 }));
  }
  // data from request
  const { id } = req.params;
  const { bodyPart, responseNotes, findings, impression } = req.body;
  // get examination by id
  const examination = await Examination.findById(id);
  // check examination existence
  if (!examination) return next(new Error("Examination not found!", { cause: 404 }));
  // check if examination is cancelled or completed
  if (examination.status === "Cancelled" || examination.status === "Completed")
    return next(new Error("Cannot update response for a cancelled or completed examination!", { cause: 400 }));
  // upload image and file in cloudinary
  const imageFile = await cloudinary.uploader.upload(
    req.files.image[0].path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/examinations/${examination._id}`,
    });
  const pdfFile = await cloudinary.uploader.upload(
    req.files.pdf[0].path,
    {
      folder: `${process.env.CLOUD_FOLDER_NAME}/examinations/${examination._id}`,
    });
  // update examination response
  examination.examinationResponse = {
    image: { id: imageFile.public_id, url: imageFile.secure_url },
    pdfUrl: { id: pdfFile.public_id, url: pdfFile.secure_url },
    bodyPart,
    responseNotes,
    findings,
    impression,
    responseDateTime: new Date(),
  };
  examination.status = "Completed"; // update status to completed
  examination.updatedBy = req.user._id; // update updatedBy field
  await examination.save();
  // send Response
  return res.json({ success: true, message: "Examination response updated successfully!", data: examination });
});

// cancel Examination
export const cancelExamination = asyncHandler(async (req, res, next) => {
  // data from request
  const { id } = req.params;
  // get examination by id
  const examination = await Examination.findById(id);
  // check examination existence
  if (!examination) return next(new Error("Examination not found!", { cause: 404 }));
  // cancel examination
  examination.status = "Cancelled";
  examination.updatedBy = req.user._id;
  await examination.save();
  // send Response
  return res.json({ success: true, message: "Examination cancelled successfully!" });
});