import joi from "joi"
import { ObjectIdValidation } from "../../middleware/validation.middleware.js";

export const addExamination = joi.object({
    patientId: joi.string().custom(ObjectIdValidation).required(),
    requestTo: joi.string().valid("Lab", "Radiology").required(),
    labExaminationType: joi
    .string()
    .valid("Blood", "PCR", "LFT")
    .when("requestTo", { is: "Lab", then: joi.required(), otherwise: joi.forbidden() }),
    radExaminationType: joi
    .string()
    .valid("CT Scan", "Ultrasound", "Mammogram", "X-Ray", "MRI")
    .when("requestTo", { is: "Radiology", then: joi.required(), otherwise: joi.forbidden() }),
    doctorNotes: joi.string().max(500).trim(),
    clinicalIndications: joi.object({
        cough: joi.boolean().default(false),
        fever: joi.boolean().default(false),
        trauma: joi.boolean().default(false),
        followUp: joi.boolean().default(false),
        chestPain: joi.boolean().default(false),
        otherIndication: joi.boolean().default(false),
        routineScreening: joi.boolean().default(false),
        ruleOutPneumonia: joi.boolean().default(false),
        shortnessOfBreath: joi.boolean().default(false),
        abnormalLabResults: joi.boolean().default(false),
        ruleOutPneumothorax: joi.boolean().default(false),
        unexplainedWeightLoss: joi.boolean().default(false),
        preOperativeEvaluation: joi.boolean().default(false)
    }).when("requestTo", { is: "Radiology", then: joi.required(), otherwise: joi.optional() } )
}).required();

export const getExaminationById = joi.object({
    id: joi.string().custom(ObjectIdValidation).required()
}).required();

export const updateLaboratoryExaminationResponse = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
    bodyPart: joi.string(),
    responseNotes: joi.string().max(500).trim(),
    findings: joi.array().items(joi.string()),
    impression: joi.string(),
}).required();

export const updateRadiologyExaminationResponse = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
    bodyPart: joi.string().required(),
    responseNotes: joi.string().max(500).trim().required(),
    findings: joi.array().items(joi.string()).required(),
    impression: joi.string().required(),
}).required();