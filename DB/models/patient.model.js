import { Schema, Types, model } from "mongoose";

const patientSchema = new Schema(
  {
    patientName: {
      type: String,
      required: true,
      min: 3,
      max: 50,
    },
    nationalId: { type: String, length: 14, unique: true, required: true },
    gender: { type: String, enum: ["male", "female"] },
    birthDate: { type: Date },
    phone: { type: String, required: true },
    email: { type: String },
    governorateOfBirth: { type: String },
    currentAddress: {
      street: { type: String },
      city: { type: String },
      governorate: { type: String },
      zipCode: { type: String, length: 5 },
    },
    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: { type: String },
    },
    bloodType: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
    },
    allergies: [{ type: String }], // Array to store multiple allergies
    medicalHistory: [  // Array to store multiple medical history records
      {
        condition: { type: String },
        diagnosisDate: { type: Date },
        treatment: { type: String },
        status: { type: String, enum: ["ongoing", "recovered"] },
      },
    ],
    currentMedications: [{ type: String }], // List of current medications
    insuranceDetails: {
      provider: { type: String },
      policyNumber: { type: String },
      validUntil: { type: Date },
    },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true,  strictQuery: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Implement pre-save hook to extract birthDate, gender, and governorate from nationalId
patientSchema.pre("save", function (next) {
  if (this.nationalId) {
    const nationalId = this.nationalId;

    // Extract birthDate
    const birthCentury = nationalId[0] === "2" ? "19" : "20";
    const birthYear = birthCentury + nationalId.slice(1, 3);
    const birthMonth = nationalId.slice(3, 5);
    const birthDay = nationalId.slice(5, 7);
    this.birthDate = new Date(`${birthYear}-${birthMonth}-${birthDay}`);

    // Extract gender
    const genderDigit = parseInt(nationalId[12]);
    this.gender = genderDigit % 2 === 0 ? "female" : "male";

    // Extract governorate
    const governorateCode = nationalId.slice(7, 9);
    const governorateMap = {
      "01": "Cairo",
      "02": "Alexandria",
      "03": "Port Said",
      "04": "Suez",
      "11": "Damietta",
      "12": "Dakahlia",
      "13": "Sharqia",
      "14": "Qalyubia",
      "15": "Kafr El Sheikh",
      "16": "Gharbia",
      "17": "Monufia",
      "18": "Beheira",
      "19": "Ismailia",
      "21": "Giza",
      "22": "Beni Suef",
      "23": "Fayoum",
      "24": "Minya",
      "25": "Assiut",
      "26": "Sohag",
      "27": "Qena",
      "28": "Luxor",
      "29": "Aswan",
      "31": "Red Sea",
      "32": "New Valley",
      "33": "Matruh",
      "34": "North Sinai",
      "35": "South Sinai",
    };
    this.governorateOfBirth = governorateMap[governorateCode] || "Unknown";
  }
  next();
});

// Add virtual field for age
patientSchema.virtual("age").get(function () {
  if (this.birthDate) {
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();

    // Adjust age for upcoming birthdays
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
  return null; // Return null if no birthDate is provided
});

// query helper to paginate
patientSchema.query.paginate = function (page) {
  page = page < 1 || isNaN(page) || !page ? 1 : page;
  const limit = 12; // 12 products per page
  const skip = limit * (page - 1);
  // this >> query
  return this.skip(skip).limit(limit);
};

// query helper to search
patientSchema.query.search = async function (keyword) {
  if (keyword) {
    return await this.find({
      $or: [
        { patientName: { $regex: keyword, $options: "i" } },
        { nationalId: { $regex: keyword, $options: "i" } },
        { phone: { $regex: keyword, $options: "i" } },
      ],
    });
  };
   return this; //query
};

export const Patient = model("Patient", patientSchema);
