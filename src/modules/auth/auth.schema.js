import joi from "joi"

// Register
export const register = joi.object({
    userName: joi.string().min(3).max(50).required(),
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: joi.string().min(6).max(20).required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    gender: joi.string().valid('male', 'female').required(),
    role: joi.string().valid('doctor', 'receptionist', 'laboratory', 'radiology').required(),
    specialization: joi.string().min(3).max(50).required(),
    phone: joi.string().pattern(new RegExp('^(20)?01[0-25][0-9]{8}$')).required(),
}).required();

// Activate Account
export const activateAccount = joi.object({
    token: joi.string().required(),
}).required();

// Login
export const login = joi.object({
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: joi.string().min(6).max(20).required(),
    role: joi.string().valid('doctor', 'receptionist', 'laboratory', 'radiology', 'admin').required(),
}).required();

// Forget Code
export const forgetCode = joi.object({
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
}).required();

// Reset Password
export const resetPassword = joi.object({
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: joi.string().min(6).max(20).required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    forgetCode: joi.string().length(6).required(),
}).required();

// Update Profile
export const updateProfile = joi.object({
    userName: joi.string().min(3).max(50),
    specialization: joi.string().min(3).max(50),
    phone: joi.string().pattern(new RegExp('^(20)?01[0-25][0-9]{8}$')),
}).required();
