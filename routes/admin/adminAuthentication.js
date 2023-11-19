const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Admin = require("../../model/admin/adminAuthentication");
const jwt = require("jsonwebtoken");
const JWT_SECRET =
  "sfaosoowennsflaaoosdnqnwieieiwdnsnnsasdasdkasdkqwiebsicxzicbzibaibdd";

router.post("/registerAdmin", async (req, res) => {
  const { email, password, name, image } = req.body;
  let pass = await bcrypt.hash(password, 10);
  try {
    const result = await Admin.create({
      email,
      password: pass,
      name,
      image
    });
    res.json({
      status: "ok",
      message: "Admin created successfully.",
    });
  } catch (error) {
    console.log(error, "Erorr");
    if (error.code == 11000) {
      return res.status(400).json({
        status: "error",
        message: "email or phone already in use",
      });
    }
    return res.status(400).json({
      status: "error",
      message: "something went wrong",
    });
  }
});

router.post("/loginAdmin", async (req, res) => {
  const { email, password } = req.body;
  try {
    await Admin.findOne({ email }, async (err, user) => {
      console.log(user, "USER=>>>>>");
      if (!user) {
        return res.status(400).send({
          status: "error",
          message: "email not found",
        });
      }

      if (await bcrypt.compare(password, user.password)) {
        const token = jwt.sign(
          {
            id: user._id,
            name: user.name,
          },
          JWT_SECRET
        );

        user["password"] = null;
        const params = {
          token: token,
          userDetails: user,
        };
        return res.json({
          status: "ok",
          data: params,
        });
      } else {
        res
          .status(400)
          .send({ status: "error", message: "Invalid email or password" });
      }
    }).clone();
  } catch (error) {
    console.log(error, "ERRRRRRRRRRRR");
  }
});

router.post("/changePasswordAdmin", async (req, res) => {
  const { email, password, newPassword } = req.body;
  let result = await Admin.findOne({ email });
  if (result) {
    if (await bcrypt.compare(password, result.password)) {
      let hashedPassword = await bcrypt.hash(newPassword, 10);
      let updateUser = await Admin.updateOne(
        { _id: result._id },
        { $set: { password: hashedPassword } }
      );
      res.status(200).send({ status: "ok", message: "Password updated Successfully" });
    } else {
      res.status(400).send({
        status: "error",
        message: "Current Password is Invalid",
      });
    }
  } else {
    res.status(400).send({
      status: "error",
      message: "Something went wrong",
    });
  }
});


module.exports = router;
