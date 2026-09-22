const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required."],
      trim: true,
      minlength: [2, "Name must be at least 2 characters."],
      maxlength: [50, "Name cannot exceed 50 characters."],
      match: [/^[a-zA-Z\s.'-]+$/, "Name should contain letters only."],
    },
    rollNumber: {
      type: Number,
      required: [true, "Roll number is required."],
      unique: true,
      min: [1, "Roll number must be a positive number starting from 1."],
      max: [99999999, "Roll number cannot exceed 8 digits (max: 99999999)."],
      validate: {
        validator: Number.isInteger,
        message: "Roll number must be an integer.",
      },
    },
    class: {
      type: String,
      required: [true, "Class is required."],
      trim: true,
      minlength: [1, "Class cannot be empty."],
      maxlength: [30, "Class cannot exceed 30 characters."],
    },
    section: {
      type: String,
      required: [true, "Section is required."],
      trim: true,
      minlength: [1, "Section cannot be empty."],
      maxlength: [20, "Section cannot exceed 20 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      maxlength: [80, "Email cannot exceed 80 characters."],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address.",
      ],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required."],
      trim: true,
      maxlength: [16, "Phone number is too long."],
      match: [/^\+\d{1,5}\d{10}$/, "Phone must include country code and exactly 10 digits."],
    },
    address: {
      type: String,
      required: [true, "Address is required."],
      trim: true,
      minlength: [3, "Address must be at least 3 characters."],
      maxlength: [150, "Address cannot exceed 150 characters."],
    },
    dob: {
      type: String,
      required: [true, "Date of birth is required."],
      validate: {
        validator: function (v) {
          const d = new Date(v);
          return !isNaN(d.getTime()) && d <= new Date() && d >= new Date("1900-01-01");
        },
        message: "Please enter a valid date of birth between 1900 and today.",
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", studentSchema);


