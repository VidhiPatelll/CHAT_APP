const cloudinary = require("cloudinary").v2;

// store the images who has to share in chat
cloudinary.config({
  cloud_name: "dxxhrdurc",
  api_key: "438342438882873",
  api_secret: "IE26-9x_cRz75xipxH2ee8b0Bmo",
  // secure: true,
});

module.exports = cloudinary;
