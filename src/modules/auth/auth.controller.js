import { User } from "../../../DB/models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmails.js";
import { resetPassTemp, signUpTemp } from "../../utils/htmlTemplates.js";
import { Token } from "../../../DB/models/token.model.js";
import Randomstring from "randomstring";
import cloudinary from "../../utils/cloud.js";


// Register
export const register = asyncHandler(async (req, res, next) => {
    // data from request
    const { email } = req.body;
    // check user existence
    const user = await User.findOne({ email });
    if (user)
        return next(new Error("user already exist!", { cause: 409 }));
    // generate token
    const token = jwt.sign({ email }, process.env.TOKEN_SECRET);
    // create user + hash password (using hash password hook)
    await User.create({ ...req.body });
    // create confirmationLink
    const confirmationLink = `https://diagnosys-backend-nine.vercel.app/auth/activate_account/${token}`;
    // send email
    const messageSent = await sendEmail({
        to: email,
        subject: "Activate Account",
        html: signUpTemp(confirmationLink)
    });
    // check if email does not send
    if (!messageSent)
        return next(new Error("something went wrong!", { cause: 400 }));
    // send Response
    return res.status(201).json({ success: true, message: "check your email!" });
});

// Activate Account
export const activateAccount = asyncHandler(async (req, res, next) => {
    // data from request
    const { email } = jwt.verify(req.params.token, process.env.TOKEN_SECRET);
    // find user and update isConfirmed
    const user = await User.findOneAndUpdate({ email }, { isConfirmed: true });
    // check if the user does not exist
    if (!user)
        return next(new Error("user not found!", { cause: 404 }));
    // send response
    return res.redirect('https://diagno-sys-cr4n.vercel.app/login');
});

// Login
export const login = asyncHandler(async (req, res, next) => {
    // data from request
    const { email, role } = req.body;
    // check user existence
    const user = await User.findOne({ email, role});
    if (!user)
        return next(new Error("Not Found!", { cause: 404 }));
    // check user email isConfirmed
    if (!user.isConfirmed)
        return next(new Error("you must activate your email first!", { cause: 401 }));
    // check user password
    const match = bcryptjs.compareSync(req.body.password, user.password)
    if (!match)
        return next(new Error("invalid password!", { cause: 400 }));
    // generate token
    const token = jwt.sign({ id: user._id, email, role }, process.env.TOKEN_SECRET);
    // Save token in token model
    await Token.create({ token, user: user._id, agent: req.headers['user-agent'] });
    // send response
    return res.json({ success: true, rseults: { token } });
});

// Forget Code
export const forgetCode = asyncHandler(async (req, res, next) => {
    // data from request
    const { email } = req.body;
    // check user existence
    const user = await User.findOne({ email });
    if (!user)
        return next(new Error("invalid email!", { cause: 404 }));
    //check activation code
    if (!user.isConfirmed)
        return next(new Error("you must activate your account first!", { cause: 401 }));
    // generate forget code
    const forgetCode = Randomstring.generate({
        charset: "alphanumeric",
        length: 6,
    });
    // send email
    const messageSent = await sendEmail({
        to: email,
        subject: "Reset Password",
        html: resetPassTemp(forgetCode)
    });
    // check if email does not send
    if (!messageSent)
        return next(new Error("something went wrong!", { cause: 400 }));
    // save forget code in user model
    user.forgetCode = forgetCode;
    await user.save();
    // send Response
    return res.json({ success: true, message: "check your email!" });
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res, next) => {
    // data from request
    const { email, forgetCode, password } = req.body;
    // check user existence
    const user = await User.findOne({ email });
    if (!user)
        return next(new Error("invalid email!", { cause: 404 }));
    // check the forget code
    if (forgetCode !== user.forgetCode) {
        const newForgetCode = Randomstring.generate({
            charset: "alphanumeric",
            length: 6,
        });
        // send email
        const messageSent = await sendEmail({
            to: email,
            subject: "Reset Password",
            html: resetPassTemp(newForgetCode)
        });
        // check if email does not send
        if (!messageSent)
            return next(new Error("something went wrong!", { cause: 400 }));
        // save forget code in user model
        user.forgetCode = newForgetCode;
        await user.save();
        return next(new Error("invalid code, new code has been resent!", { cause: 400 }));
    }
    // hash password (using hook) and save in user model
    user.password = password;
    await user.save();
    // find all token of the user
    const tokens = await Token.find({ user: user._id });
    // invalidate all token
    tokens.forEach(async (token) => {
        token.isValid = false;
        await token.save();
    });
    // send Response
    return res.json({ success: true, message: "you can login now!" });
});

// Get User Profile
export const getProfile = asyncHandler(async (req, res, next) => {
    // data from request
    const { _id } = req.user;
    // Get user profile
    const user = await User.findById(_id).select("-password -__v -forgetCode -createdAt -updatedAt -isConfirmed");
    // send response
    return res.json({ success: true, message:"User Found successfully.", data: user });
});

// Update User Profile
export const updateProfile = asyncHandler(async (req, res, next) => {
    // data from request
    const { _id } = req.user;
    // check if the user exists
    const user = await User.findById(_id);
    if (!user) return next(new Error("User not found!", { cause: 404 }));
    // If a new profile image file is uploaded
    if (req.file) {
    // upload pdf file in cloudinary
     const { secure_url, public_id } = await  cloudinary.uploader.upload(
       req.file.path,
       {
         folder: `${process.env.CLOUD_FOLDER_NAME}/users/${user._id}`,
       });
    // Update the user's profile image with the returned Cloudinary details.
    user.profileImage = { id: public_id, url: secure_url };
    }
    // update user data
    user.userName = req.body.userName ? req.body.userName : user.userName;
    user.specialization = req.body.specialization ? req.body.specialization : user.specialization;
    user.phone = req.body.phone ? req.body.phone : user.phone;
    // save updated user
    await user.save();
    // send response
    return res.json({ success: true, message: "User updated successfully." });
});

// logout
export const logout = asyncHandler(async (req, res, next) => {
    // data from request
    let token  = req.headers["token"];
    token = token.split(process.env.BEARER_KEY)[1];
    // find token in token model
    const foundToken = await Token.findOne({ token });
    if (!foundToken)
        return next(new Error("token not found!", { cause: 404 }));
    // invalidate the token
    foundToken.isValid = false;
    await foundToken.save();
    // send response
    return res.json({ success: true, message: "logged out successfully!" });
});