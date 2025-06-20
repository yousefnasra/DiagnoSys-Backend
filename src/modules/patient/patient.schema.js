import joi from "joi";
import { ObjectIdValidation } from "../../middleware/validation.middleware.js";

// List of valid Egyptian governorate codes and names
const validGovernorateCodes = [
  "01", "02", "03", "04", "11", "12", "13", "14", "15",
  "16", "17", "18", "19", "21", "22", "23", "24", "25",
  "26", "27", "28", "29", "31", "32", "33", "34", "35",
  "88",
];

const validGovernorates = [
  "Cairo", "Alexandria", "Port Said", "Suez", "Damietta", "Dakahlia", "Sharqia",
  "Qalyubia", "Kafr El Sheikh", "Gharbia", "Monufia", "Beheira", "Ismailia",
  "Giza", "Beni Suef", "Fayoum", "Minya", "Assiut", "Sohag", "Qena", "Luxor",
  "Aswan", "Red Sea", "New Valley", "Matruh", "North Sinai", "South Sinai",
  "Unknown", // Added for cases where the governorate code is not recognized
];

// addPatient
export const addPatient = joi.object({
    patientName: joi.string().min(3).max(50).required(),
    nationalId: joi.string().length(14).pattern(/^[23]\d{13}$/) // First digit must be 2 or 3, followed by 13 digits
    .custom((value, helpers) => {
      // Extract components of the national ID
      const century = value[0];
      const year = parseInt(value.slice(1, 3), 10);
      const month = parseInt(value.slice(3, 5), 10);
      const day = parseInt(value.slice(5, 7), 10);
      const governorate = value.slice(7, 9);
      // Validate the date of birth
      const fullYear = (century === "2" ? 1900 : 2000) + year;
      const date = new Date(fullYear, month - 1, day); // Month is zero-indexed in JS
      if (
        date.getFullYear() !== fullYear ||
        date.getMonth() + 1 !== month ||
        date.getDate() !== day
      ) {
        return helpers.error("any.invalid", { message: "Invalid date of birth in National ID" });
      }
      // Validate the governorate code
      if (!validGovernorateCodes.includes(governorate)) {
        return helpers.error("any.invalid", { message: "Invalid governorate code in National ID" });
      }
      return value; // Return the value if all validations pass
    }, "Egyptian National ID Validation")
    .required(),
    phone: joi.string().pattern(new RegExp('^(20)?01[0-25][0-9]{8}$')).required(),
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    currentAddress: joi.object({
      street: joi.string(),
      city: joi.string(),
      governorate: joi.string().valid(...validGovernorates),
      zipCode: joi.string().pattern(new RegExp('^[0-9]{5}$')),
    }),
    emergencyContact: joi.object({
      name: joi.string().presence("required"),
      relation: joi.string().presence("required"),
      phone: joi.string().pattern(new RegExp('^(20)?01[0-25][0-9]{8}$')).presence("required"),
    }),
    bloodType: joi.string().valid("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"),
    allergies: joi.array().items(joi.string()).default([]),
    medicalHistory: joi.array().items(
      joi.object({
        condition: joi.string().presence("required"),
        diagnosisDate: joi.date().presence("required"),
        treatment: joi.string().presence("required"),
        status: joi.string().valid("ongoing", "recovered").presence("required"),
      })
    ).default([]),
    currentMedications: joi.array().items(joi.string()).default([]),
    insuranceDetails: joi.object({
      provider: joi.string().presence("required"),
      policyNumber: joi.string().presence("required"),
      validUntil: joi.date().greater('now').presence("required"),
    }),
  }).required();

  // updatePatient
export const updatePatient = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
    patientName: joi.string().min(3).max(50),
    phone: joi.string().pattern(new RegExp('^(20)?01[0-25][0-9]{8}$')),
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    currentAddress: joi.object({
      street: joi.string(),
      city: joi.string(),
      governorate: joi.string().valid(...validGovernorates),
      zipCode: joi.string().pattern(new RegExp('^[0-9]{5}$')),
    }),
    emergencyContact: joi.object({
      name: joi.string(),
      relation: joi.string(),
      phone: joi.string().pattern(new RegExp('^(20)?01[0-25][0-9]{8}$')),
    }),
    bloodType: joi.string().valid("A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"),
    allergies: joi.array().items(joi.string()).default([]),
    medicalHistory: joi.array().items(
      joi.object({
        condition: joi.string(),
        diagnosisDate: joi.date(),
        treatment: joi.string(),
        status: joi.string().valid("ongoing", "recovered"),
      })
    ).default([]),
    currentMedications: joi.array().items(joi.string()).default([]),
    insuranceDetails: joi.object({
      provider: joi.string(),
      policyNumber: joi.string(),
      validUntil: joi.date().greater('now'),
    }),
  }).required();

  // deletePatient
export const deletePatient = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
  }).required();

// get patient and examinations by national id
export const getPatientByNationalId = joi.object({
    nationalId: joi.string().length(14).pattern(/^[23]\d{13}$/) // First digit must be 2 or 3, followed by 13 digits
    .custom((value, helpers) => {
      // Extract components of the national ID
      const century = value[0];
      const year = parseInt(value.slice(1, 3), 10);
      const month = parseInt(value.slice(3, 5), 10);
      const day = parseInt(value.slice(5, 7), 10);
      const governorate = value.slice(7, 9);
      // Validate the date of birth
      const fullYear = (century === "2" ? 1900 : 2000) + year;
      const date = new Date(fullYear, month - 1, day); // Month is zero-indexed in JS
      if (
        date.getFullYear() !== fullYear ||
        date.getMonth() + 1 !== month ||
        date.getDate() !== day
      ) {
        return helpers.error("any.invalid", { message: "Invalid date of birth in National ID" });
      }
      // Validate the governorate code
      if (!validGovernorateCodes.includes(governorate)) {
        return helpers.error("any.invalid", { message: "Invalid governorate code in National ID" });
      }
      return value; // Return the value if all validations pass
    }, "Egyptian National ID Validation")
    .required(),
  }).required();

  // get patients by id
export const getPatientById = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
  }).required();