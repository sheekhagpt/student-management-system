const mongoose = require("mongoose");
const Student = require("../models/student");

const validateRollNumber = (req, res) => {
  const { rollNumber } = req.body || {};
  const isValid =
    (typeof rollNumber === "number" && Number.isInteger(rollNumber)) ||
    (typeof rollNumber === "string" && /^[1-9]\d{0,7}$/.test(rollNumber));

  if (!isValid || Number(rollNumber) < 1 || Number(rollNumber) > 99999999) {
    res.status(400).json({
      message: "Roll number must be a positive integer from 1 to 8 digits (maximum 99999999).",
    });
    return false;
  }

  return true;
};

// Helper to check DB connection
const checkDB = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      message: "Database is not connected. Please verify your MongoDB connection string in .env and ensure MongoDB is running.",
    });
    return false;
  }
  return true;
};

// CREATE
exports.createStudent = async (req, res) => {
  if (!checkDB(res)) return;
  if (!validateRollNumber(req, res)) return;

  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: `Roll number '${req.body.rollNumber}' already exists. Please use a unique roll number.`,
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(" ") });
    }
    res.status(500).json({ message: error.message || "Failed to create student record." });
  }
};

// GET ALL
exports.getStudents = async (req, res) => {
  if (!checkDB(res)) return;

  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message || "Failed to fetch student records." });
  }
};

// GET BY ID
exports.getStudentById = async (req, res) => {
  if (!checkDB(res)) return;

  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student record not found." });
    }
    res.json(student);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student ID format." });
    }
    res.status(500).json({ message: error.message || "Failed to fetch student details." });
  }
};

// UPDATE
exports.updateStudent = async (req, res) => {
  if (!checkDB(res)) return;
  if (!validateRollNumber(req, res)) return;

  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ message: "Student record not found." });
    }
    res.json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: `Roll number '${req.body.rollNumber}' is already in use by another student.`,
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(" ") });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student ID format." });
    }
    res.status(500).json({ message: error.message || "Failed to update student record." });
  }
};

// DELETE
exports.deleteStudent = async (req, res) => {
  if (!checkDB(res)) return;

  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student record not found." });
    }
    res.json({ message: "Student deleted successfully." });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid student ID format." });
    }
    res.status(500).json({ message: error.message || "Failed to delete student." });
  }
};
