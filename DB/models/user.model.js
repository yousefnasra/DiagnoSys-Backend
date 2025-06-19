import { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
      min: 3,
      max: 50,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
      max: 20,
    },
    role: {
      type: String,
      enum: ["doctor", "receptionist", "laboratory", "radiology", "admin"],
      required: true,
    },
    isConfirmed: { type: Boolean, default: false },
    gender: { type: String, enum: ["male", "female"] },
    specialization: { type: String, min: 3, max: 50 },
    phone: { type: String },
    forgetCode: { type: String, length: 6 },
    profileImage: {
        url: { type: String, default: "https://res.cloudinary.com/dzxfqohg5/image/upload/v1745353193/hospital/users/defaults/Default-Profile-Picture-PNG-Download-Image_a4xjlk_okx8lq.png" },
        id: { type: String, default: "hospital/users/defaults/Default-Profile-Picture-PNG-Download-Image_a4xjlk_okx8lq" }
    },
  },
  { timestamps: true }
);

// hash password hook
userSchema.pre("save", function () {
  if (this.isModified("password")) {
    this.password = bcryptjs.hashSync(
      this.password,
      parseInt(process.env.SALT_ROUND)
    );
  }
});

// query helper to filter doctors by name or specialization
userSchema.statics.searchDoctors = async function(keyword) {
  const query = { role: "doctor" };
  if (keyword) {
    query.$or = [
      { userName: { $regex: keyword, $options: "i" } },
      { specialization: { $regex: keyword, $options: "i" } }
    ];
  }
  // chain .select()
  return this.find(query).select("userName specialization profileImage phone email").sort({ createdAt: -1 });
};

export const User = model("User", userSchema);
