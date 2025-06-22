# DiagnoSys Backend

DiagnoSys Backend is a Node.js-based backend application designed to manage hospital operations, including user authentication, patient management, appointment scheduling, and examination handling. It provides a RESTful API for seamless integration with frontend applications.

---

## Features

- **Authentication and Authorization**:

  - User registration, login, and logout.
  - Role-based access control (Admin, Doctor, Receptionist, Laboratory, Radiology).
  - Email-based account activation and password reset.
  - Passwords are securely hashed using bcrypt before being stored in the database.

- **Patient Management**:

  - Add, update, delete, and retrieve patient details.
  - Search patients by name, national ID, or phone.
  - Automatically extract patient details (e.g., age, gender, governorate) from the national ID.

- **Appointment Management**:

  - Schedule, update, cancel, and retrieve appointments.
  - Conflict detection for overlapping appointments.
  - Filter appointments by doctor, date, or patient.

- **Examination Management**:

  - Request and manage lab or radiology examinations.
  - Upload and store examination responses (PDFs and images) using Cloudinary.
  - Search examinations by patient name, national ID, or phone.

- **Utilities**:
  - Email notifications using Nodemailer.
  - File uploads using Multer.
  - Cloud storage integration with Cloudinary.
  - Security features such as Helmet for HTTP headers and rate limiting to prevent abuse.

---

## Project Structure

```
DiagnoSys Backend/
├── DB/
│   ├── connection.js
│   └── models/
│       ├── appointment.model.js
│       ├── examination.model.js
│       ├── patient.model.js
│       ├── token.model.js
│       └── user.model.js
├── src/
│   ├── middleware/
│   │   ├── authentication.middleware.js
│   │   ├── authorization.middleware.js
│   │   └── validation.middleware.js
│   ├── modules/
│   │   ├── auth/
│   │   ├── patient/
│   │   ├── appointment/
│   │   └── examination/
│   └── utils/
│       ├── asyncHandler.js
│       ├── cloud.js
│       ├── fileUpload.js
│       ├── htmlTemplates.js
│       └── sendEmails.js
├── .env
├── .gitignore
├── index.js
├── package.json
└── README.md

```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user (Admin only).
- `GET /auth/activate_account/:token` - Activate a user's account via email.
- `POST /auth/login` - Login a user.
- `PATCH /auth/forgetCode` - Send a password reset code to the user's email.
- `PATCH /auth/resetPassword` - Reset the user's password using the reset code.
- `GET /auth` - Get the logged-in user's profile.
- `PUT /auth` - Update the logged-in user's profile (with optional profile image upload).
- `GET /auth/logout` - Logout the user and invalidate the token.

---

### Patient Management

- `POST /patient` - Add a new patient (Receptionist only).
- `PUT /patient/:id` - Update patient details (Receptionist and Doctor only).
- `DELETE /patient/:id` - Delete a patient (Receptionist only).
- `GET /patient/info/:nationalId` - Get patient and examination details by national ID.
- `GET /patient` - Get all patients or search by name, national ID, or phone (Receptionist only).
- `GET /patient/:id` - Get patient details by ID (Receptionist only).

---

### Appointment Management

- `GET /appointment/doctors` - Get all doctors and filter by name or specialization (Receptionist only).
- `POST /appointment` - Schedule a new appointment (Receptionist only).
- `PUT /appointment/:id` - Update an appointment (Receptionist only).
- `PATCH /appointment/:id` - Cancel an appointment (Receptionist only).
- `GET /appointment` - Get all appointments or search by patient name, doctor name, or date (Receptionist only).
- `GET /appointment/doctor` - Get appointments for the logged-in doctor filtered by date (Doctor only).
- `GET /appointment/:id` - Get appointment details by ID (Doctor only).
- `PATCH /appointment/end/:id` - Mark an appointment as completed (Doctor only).

---

### Examination Management

- `POST /examination` - Request a new examination (Doctor only).
- `GET /examination` - Get all examinations or search by patient name, national ID, or phone (Doctor, Laboratory, Radiology).
- `GET /examination/:id` - Get examination details by ID (Doctor, Laboratory, Radiology).
- `PUT /examination/laboratory/:id` - Update lab examination response (Laboratory only, with PDF upload).
- `PUT /examination/radiology/:id` - Update radiology examination response (Radiology only, with image and PDF upload).
- `PATCH /examination/:id` - Cancel an examination (Doctor, Laboratory, Radiology).

---

### Miscellaneous

- `GET /` - Welcome message for the API.

---

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT
- **File Uploads**: Multer, Cloudinary
- **Validation**: Joi
- **Email Service**: Nodemailer
- **Utilities**: Moment.js, Randomstring
- **Security**:
  - Helmet for HTTP headers.
  - Rate limiting using `express-rate-limit`.
  - CORS for cross-origin resource sharing.

---

## Contact Information

For questions or support, please contact:

- **Email**: [yosefnasra96@gmail.com](mailto:yosefnasra96@gmail.com)
- **GitHub**: [yousefnasra](https://github.com/yousefnasra)
