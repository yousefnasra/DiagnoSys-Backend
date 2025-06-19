import { Schema, Types, model } from "mongoose";

const examinationSchema = new Schema(
  {
    // Reference the patient this Examination belongs to
    patientId: { type: Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Types.ObjectId, ref: "User", required: true },
    // Doctor's Examination request details
    requestTo: { type: String, enum: ["Lab", "Radiology"], required: true },
    labExaminationType: { type: String, enum: ["Blood", "PCR", "LFT"] },
    radExaminationType: { type: String, enum: ["CT Scan", "Ultrasound", "Mammogram", "X-Ray", "MRI"] },
    doctorNotes: { type: String, maxlength: 500, trim: true},
    // Clinical Indications
    clinicalIndications: {
      cough: { type: Boolean, default: false },
      fever: { type: Boolean, default: false },
      trauma: { type: Boolean, default: false },
      followUp: { type: Boolean, default: false },
      chestPain: { type: Boolean, default: false },
      otherIndication: { type: Boolean, default: false },
      routineScreening: { type: Boolean, default: false },
      ruleOutPneumonia: { type: Boolean, default: false },
      shortnessOfBreath: { type: Boolean, default: false },
      abnormalLabResults: { type: Boolean, default: false },
      ruleOutPneumothorax: { type: Boolean, default: false },
      unexplainedWeightLoss: { type: Boolean, default: false },
      preOperativeEvaluation: { type: Boolean, default: false }
    },
    // Examination status to track the overall process
    status: { type: String, enum: ["Requested", "Completed", "Cancelled"], default: "Requested" },
    // Lab/Rad response initially it might be empty until the lab/rad responds
    examinationResponse: {
      image: { id: { type: String }, url: { type: String } }, // Cloudinary public key/URL for the image file
      pdfUrl: {  id: { type: String }, url: { type: String } }, // Cloudinary public key/URL for the PDF file
      bodyPart: { type: String }, // Body part being examined
      responseNotes: { type: String, maxlength: 500, trim: true },
      findings: { type: [String] },
      impression: { type: String },
      responseDateTime: { type: Date }, // Date and time when the response was generated
    },
    // Audit fields
    updatedBy: { type: Types.ObjectId, ref: "User" }, // lab/rad who updates the Examination status or response
  },
  {
    timestamps: true,
    strictQuery: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Static method to search examinations by patient name, national id, or phone
examinationSchema.statics.searchExaminations = async function (keyword) {
  if (!keyword) {
    return this.find()
      .populate("patientId", "patientName nationalId phone gender birthDate age")
      .populate("doctorId", "userName email phone specialization profileImage");
  }

  const regex = new RegExp(keyword, "i");

  return this.aggregate([
    {
      $lookup: {
        from: "patients",
        localField: "patientId",
        foreignField: "_id",
        as: "patientId"
      }
    },
    { $unwind: "$patientId" },
    {
      $match: {
        $or: [
          { "patientId.patientName": regex },
          { "patientId.nationalId": regex },
          { "patientId.phone": regex }
        ]
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "doctorId",
        foreignField: "_id",
        as: "doctorId"
      }
    },
    { $unwind: "$doctorId" },
    {
      $project: {
        patientId: { _id: 1, patientName: 1, nationalId: 1, phone: 1, gender: 1, birthDate: 1,
           age: { $floor: { $divide: [{ $subtract: [new Date(), "$patientId.birthDate"] }, 1000 * 60 * 60 * 24 * 365.25] } } },
        doctorId: { _id: 1, userName: 1, email: 1, phone: 1, specialization: 1, profileImage: 1 },
        requestTo: 1,
        labExaminationType: 1,
        radExaminationType: 1,
        doctorNotes: 1,
        clinicalIndications: 1,
        examinationResponse: {
          pdfUrl: 1,
          bodyPart: 1,
          responseNotes: 1,
          findings: 1,
          impression: 1,
          responseDateTime: 1
        },
        status: 1,
        createdAt: 1,
        updatedAt: 1
      }
    }
  ]);
};

export const Examination = model("Examination", examinationSchema);