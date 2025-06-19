import joi from "joi";
import { ObjectIdValidation } from "../../middleware/validation.middleware.js";
import e from "express";

export const addAppointment = joi.object({
    patientId: joi.string().custom(ObjectIdValidation).required(),
    doctorId: joi.string().custom(ObjectIdValidation).required(),
    appointmentDate: joi.string()
    .pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/)
    .required()
    .messages({
        "string.pattern.base": `"appointmentDate" must be in MM/DD/YYYY format`,
        "any.required": `"appointmentDate" is required`,
    }),
    startTime: joi.string()
    .pattern(/^((0?[1-9])|(1[0-2])):[0-5][0-9] (AM|PM)$/)
    .required()
    .messages({
        "string.pattern.base": `"startTime" must be in hh:mm AM/PM format`,
        "any.required": `"startTime" is required`,
    }),
    status: joi.string().valid("Scheduled","Re-Scheduled" ,"Completed", "Cancelled").default("Scheduled"),
    visitType: joi.string().valid("Visit", "Re-Visit").required(),
    notes: joi.string().min(3).max(500).required(),
}).required();

export const updateAppointment = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
    appointmentDate: joi.string()
    .pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/)
    .messages({
        "string.pattern.base": `"appointmentDate" must be in MM/DD/YYYY format`,
    }),
    startTime: joi.string()
    .pattern(/^((0?[1-9])|(1[0-2])):[0-5][0-9] (AM|PM)$/)
    .messages({
        "string.pattern.base": `"startTime" must be in hh:mm AM/PM format`,
    }),
    visitType: joi.string().valid("Visit", "Re-Visit"),
    notes: joi.string().min(3).max(500),
}).required();

export const cancelAppointment = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
}).required();

export const getAppointments = joi.object({
    date: joi.string()
    .pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/)
    .required()
    .messages({
        "string.pattern.base": `"date" must be in MM/DD/YYYY format`,
    }),
}).required();

export const getAppointmentsByDoctorId = joi.object({
    date: joi.string()
    .pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/)
    .required()
    .messages({
        "string.pattern.base": `"date" must be in MM/DD/YYYY format`,
    }),
}).required();

export const getAppointmentById = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
}).required();

export const endAppointment = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
}).required();
