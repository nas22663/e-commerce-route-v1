import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../../DB/models/user.model.js";
import sendEmailService from "../services/send-email.service.js";

export const signUp = async (req, res, next) => {
  // 1-deconstruct data from req.body
  const { username, email, password, age, role, addresses, phoneNumbers } =
    req.body;
  console.log(req.body);

  // 2-validate that data does not exist already
  const isEmailExist = await User.findOne({ email });
  if (isEmailExist)
    return next(new Error("email already exist", { cause: 409 }));

  //2.1- send confirmation email

  const userToken = jwt.sign({ email }, process.env.JWT_SECRET_VERIFCATION, {
    expiresIn: "2m",
  });

  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Email Confirmation",
    message:
      "<h2>Click the link below to confirm your email</h2>" +
      `<a href="${req.protocol}://${req.headers.host}/auth/confirm-email/?email=${userToken}">Confirm Email</a>`,
  });

  if (!isEmailSent) return next(new Error("email not sent", { cause: 500 }));

  // 3- hash password
  const hashedPassword = bcrypt.hashSync(password, +process.env.SALT_ROUNDS);

  // 4- create user
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    age,
    role,
    addresses,
    phoneNumbers,
  });

  // 5- send response

  return res.status(201).json({
    status: "successfully signed up",
    data: newUser,
  });
};

export const confirmEmail = async (req, res, next) => {
  const { email } = req.query;
  const decodedData = jwt.verify(email, process.env.JWT_SECRET_VERIFCATION);

  const user = await User.findOneAndUpdate(
    { email: decodedData.email, isEmailVerified: false },
    { isEmailVerified: true },
    { new: true }
  );
  if (!user)
    return next(
      new Error("user not found or already confirmed", { cause: 404 })
    );
  return res.status(200).json({
    success: true,
    status: "email confirmed",
    data: user,
  });
};
// ================================ Sign In API ================================//

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, isEmailVerified: true });

  if (!user) return next(new Error("user not found", { cause: 404 }));

  const isPasswordCorrect = bcrypt.compareSync(password, user.password);

  if (!isPasswordCorrect)
    return next(new Error("wrong password", { cause: 400 }));

  const token = jwt.sign(
    { id: user._id, email, isloggedin: true },
    process.env.LOGIN_SIGNATURE,
    {
      expiresIn: "1d",
    }
  );

  user.isloggedIn = true;

  await user.save();

  return res.status(200).json({
    success: true,
    status: "successfully signed in",
    data: { token },
    message: "you are now logged in",
  });
};
