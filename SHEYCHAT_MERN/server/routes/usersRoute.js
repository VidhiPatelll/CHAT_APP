const User = require("../models/userModel");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middlewares/authMiddleware");
const cloudinary = require("../cloudinary");
const {validateUser} = require("../models/validateuser");

// User registration

router.post("/register", async (req, res) => {
  try {
    // check if user already exists
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.send({
        success: false,
        message: "User is already exists",
      });
    } else {
      validateUser(req.body)
        .then(async (value) => {
          // create User
          const hashPassword = await bcrypt.hash(req.body.password, 10);
          req.body.password = hashPassword;
          const newUser = new User(req.body);
          await newUser.save();
          res.send({
            success: true,
            message: "User created successfully",
          });
        })
        .catch((err) =>
          res.send({
            message: err.message,
            success: false,
          })
        );
    }
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

// User login

router.post("/login", async (req, res) => {
  try {
    // check if user exists
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.send({
        success: false,
        message: "User Does not exist",
      });
    }
    // check if password is correct
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validPassword) {
      return res.send({
        success: false,
        message: "Invalid Password",
      });
    }

    // create and asign a token

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.send({
      success: true,
      message: "User logged in succesfully",
      data: token,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

// Get Current User

router.get("/get-current-user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    res.send({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

// get all users expect current user

router.get("/get-all-users", authMiddleware, async (req, res) => {
  try {
    const allUsers = await User.find({ _id: { $ne: req.body.userId } });
    res.send({
      success: true,
      message: "Users fetched Successfully",
      data: allUsers,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

// update user profile picture

router.post("/update-profile-picture", authMiddleware, async (req, res) => {
  try {
    const image = req.body.image;

    // upload image to cloudinary and get url

    const uploadedImage = await cloudinary.uploader.upload(image, {
      folder: "Chat",
    });

    // update user profile picture

    const user = await User.findOneAndUpdate(
      { _id: req.body.userId },
      { profilePic: uploadedImage.secure_url },
      { new: true }
    );

    res.send({
      success: true,
      message: "Profile picture updated successfully",
      data: user,
    });
  } catch (error) {
    res.send({
      message: error.message,
      success: false,
    });
  }
});

module.exports = router;
