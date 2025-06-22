import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import morgan from "morgan";
import { connectDB } from "./DB/connection.js";
import authRouter from "./src/modules/auth/auth.router.js";
import patientRouter from "./src/modules/patient/patient.router.js";
import appointmentRouter from "./src/modules/appointment/appointment.router.js";
import examinationRouter from "./src/modules/examination/examination.router.js";

// configurations
dotenv.config();
const app = express();
const port = process.env.PORT;
// DB connection
await connectDB();
// Set security headers using Helmet
app.use(helmet());

// Create a rate limiter specifically for the auth routes: 100 requests per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute window
    max: 100, // Limit each IP to 10 auth requests per windowMs
    handler: function (req, res, next) {
        return next(new Error("Too many requests, please try again later.", { cause: 429 }));
    }
});

// Create a general rate limiter for other routes: 100 requests per 15 minutes
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15-minute window
    max: 100, // Limit each IP to 100 requests per windowMs
    handler: function (req, res, next) {
        return next(new Error("Too many requests, please try again later.", { cause: 429 }));
    }
});
//&==========
// CORS configuration
// // Define a whitelist of allowed origins (replace with your actual front-end URL(s))
// const whitelist = process.env.FRONTEND_URLS ? process.env.FRONTEND_URLS.split(",").map(origin => origin.trim()) : [];
// // Custom CORS middleware
// app.use((req, res, next) => {
//   // Allow any origin for the account activation endpoint using GET method
//   if (req.originalUrl.includes("/auth/activate_account")) {
//     res.setHeader("Access-Control-Allow-Origin", "*");
//     res.setHeader("Access-Control-Allow-Methods", "GET");
//     return next();
//   }
//   // Retrieve the origin header from the request
//   const origin = req.get("origin");
//   // If the origin is not in the whitelist, block the request
//   if (!whitelist.includes(origin)) return next(new Error("blocked by cors!"));
//   // For allowed origins, set the CORS headers
//   res.setHeader("Access-Control-Allow-Origin", origin);
//   res.setHeader("Access-Control-Allow-Headers", "*");
//   res.setHeader("Access-Control-Allow-Methods", "*");
//   // Optionally:
//   res.setHeader("Access-Control-Private-Network", "true"); // This header is experimental
//   next();
// });
//allow access from every where
app.use(cors());
//&==========

// parsing
app.use(express.json());

// morgan
app.use(morgan("combined"));

// routers
// Apply authLimiter only to /auth routes
app.use("/auth", authLimiter, authRouter);
// Apply the generalLimiter for all remaining routes below
app.use(generalLimiter);
app.use("/patient", patientRouter);
app.use("/appointment", appointmentRouter);
app.use("/examination", examinationRouter);


// Define the root route ("/") to return a welcome message
app.get("/", (req, res) => {
    return res.status(200).json({
      success: true,
      message: "Welcome to DiagnoSys API!"
    });
});
// page not found handler
app.all("*", (req, res, next) => {
    return next(new Error("page not found!", { cause: 404 }));
});
// global error handler
app.use((error, req, res, next) => {
    const statusCode = error.cause || 500;
    return res.status(statusCode).json({
        success: false,
        message: error.message,
        stack: error.stack,
    });
});

app.listen(port, () => { console.log("App is running on port: ", port); });