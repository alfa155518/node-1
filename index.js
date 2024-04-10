require("dotenv").config();

const express = require("express");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log(file);
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];

    const filename = `user-${Date.now()}.${ext}`;
    cb(null, filename);
  },
});

function fileFilter(req, file, cb) {
  const img = file.mimetype.split("/")[0];

  if (img === "image") {
    return cb(null, true);
  } else {
    return rcb("this not image", false);
  }
}

const upload = multer({ storage: storage, fileFilter });

const path = require("path");

const Course = require("./models/course");

const Users = require("./models/user");

const bcrypt = require("bcryptjs");

const cors = require("cors");

const jwt = require("jsonwebtoken");

const generateToken = require("./util/generate-token");

const app = express();

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());

app.use("/uploads", express.static("uploads"));
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URL)
  .then((data) => console.log("good Connected"));
app.use(cors());

// Get All Courses
app.get("/api/courses", async (req, res) => {
  // const courses = await Course.find({ price: 4000 });
  // const courses = await Course.find({ price: { $gt: 4000 } });
  // const { limit, page } = req.query;

  // console.log(limit, page);

  // const skip = (page - 1) * limit;

  // console.log(skip);

  // const courses = await Course.find({}, { __v: false }).limit(limit).skip(skip);
  const courses = await Course.find();
  res.json({ status: "success", data: { courses } });
});

// Get Single Course
app.get("/api/courses/:id", async (req, res) => {
  const course = await Course.findById(req.params.id);
  res.json({ status: "success", data: { course } });
});

// Post  Course
app.post("/api/courses", async (req, res) => {
  const { title, price } = req.body;
  if (title === null || price === null) {
    return res.status(400);
  }
  const newCourse = new Course(req.body);
  await newCourse.save();
  res.json(newCourse);
});

app.patch("/api/courses/:id", async (req, res) => {
  const courseId = req.params.id;
  const updatedCourse = await Course.updateOne(
    { _id: courseId },
    { $set: req.body }
  );
  res.json(updatedCourse);
});

app.delete("/api/courses/:id", async (req, res) => {
  const courseId = req.params.id;

  const auth = req.headers["authorization"] || req.headers["Authorization"];
  const token = auth.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

  console.log(decodedToken);

  await Course.deleteOne({ _id: courseId });
  res.status(200);
  res.json({ status: "success", data: null });
});

//************ Users *********//

// Show All Users
app.get("/api/users", async (req, res) => {
  const allUser = await Users.find({}, { __v: false, password: false });

  if (req.header.authorization === undefined) {
    return res.status(400).json("Un Authorized");
  }

  const auth = req.headers["authorization"] || req.headers["Authorization"];
  const token = auth.split(" ")[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);

  console.log(decodedToken);

  res.json({ status: "success", data: { allUser } });
});

// Register Users
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const user = await Users.findOne({ email: email });

  if (!user) {
    return res.json({ status: "Failed", msg: "User Not Found" });
  }

  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword) {
    return res.json({ status: "Failed", msg: "Password Wrong" });
  }
  // return;
  if (user && matchedPassword) {
    const token = await generateToken({ email: user.email, id: user._id });

    return res.json({ status: "success", token: { token } });
  } else {
    return res.json("Something is Wrong");
  }
});

// login
app.post("/login", upload.single("avatar"), async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  const exitEmail = await Users.findOne({ email: email });

  if (exitEmail) {
    return res.json({ status: "failed", msg: `This Email Already Exit` });
  }

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new Users({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role,
  });

  console.log(newUser);

  // generate Token
  const token = await generateToken({ email: newUser.email, id: newUser._id });
  newUser.Token = token;

  try {
    await newUser.save();
    return res.json({ status: "success", data: { newUser } });
  } catch (err) {
    console.log(err);
  }
});

app.all("*", (req, res) => {
  return res.status(404).json({ status: "Failed", message: "page Not Found" });
});
app.listen(process.env.PORT || 4000, () => {
  console.log("done");
});
