const API = window.location.origin.includes(":5000")
  ? "/students"
  : "http://localhost:5000/students";

let editStudentId = null;

function getField(id) {
  return document.getElementById(id);
}

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizePhone(value, code) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `${code}${digits}` : value;
}

function getCountryCode(phone) {
  const codes = [
    "+971",
    "+966",
    "+91",
    "+49",
    "+44",
    "+61",
    "+81",
    "+55",
    "+33",
    "+86",
    "+1",
    "+7",
  ];
  return codes.find((code) => phone.startsWith(code)) || "+91";
}

function getLocalPhone(phone, code) {
  if (phone.startsWith(code)) {
    return phone.slice(code.length);
  }
  return phone.replace(/\D/g, "");
}

function getFormData() {
  const countryCode = getField("countryCode").value;

  return {
    name: getField("name").value.trim(),
    rollNumber: Number(getField("rollNumber").value.trim()),
    class: getField("class").value.trim(),
    section: getField("section").value.trim(),
    email: getField("email").value.trim(),
    phone: normalizePhone(getField("phone").value.trim(), countryCode),
    address: getField("address").value.trim(),
    dob: getField("dob").value,
  };
}

function resetForm() {
  [
    "name",
    "rollNumber",
    "class",
    "section",
    "email",
    "phone",
    "address",
    "dob",
  ].forEach((id) => {
    const el = getField(id);
    if (el) el.value = "";
  });

  const countryCode = getField("countryCode");
  if (countryCode) countryCode.value = "+91";

  editStudentId = null;

  const submitBtn = document.getElementById("submitBtn");
  if (submitBtn) submitBtn.textContent = "Add Student";

  const formHeading = document.getElementById("formHeading");
  if (formHeading) formHeading.textContent = "Add Student";

  const cancelBtn = document.getElementById("cancelBtn");
  if (cancelBtn) cancelBtn.style.display = "none";
}

function cancelEdit() {
  resetForm();
  showMessage("Edit canceled.", "success");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 80;
}

function isValidPhone(phone) {
  // Matches + followed by 1 to 5 country digits and exactly 10 local digits
  return /^\+\d{1,5}\d{10}$/.test(phone);
}

function validateForm() {
  const form = getField("studentForm");
  const nameField = getField("name");
  const rollField = getField("rollNumber");
  const classField = getField("class");
  const sectionField = getField("section");
  const emailField = getField("email");
  const phoneField = getField("phone");
  const addressField = getField("address");
  const dobField = getField("dob");

  [
    nameField,
    rollField,
    classField,
    sectionField,
    emailField,
    phoneField,
    addressField,
    dobField,
  ].forEach((field) => {
    if (field) field.setCustomValidity("");
  });

  // Name validation (2 to 50 characters, letters/spaces/dots)
  const nameVal = nameField ? nameField.value.trim() : "";
  if (!nameVal || nameVal.length < 2 || nameVal.length > 50) {
    nameField.setCustomValidity("Name must be between 2 and 50 characters.");
  } else if (!/^[a-zA-Z\s.'-]+$/.test(nameVal)) {
    nameField.setCustomValidity("Name should contain letters only.");
  }

  // Roll Number validation (1 to 8 digits, positive number)
  const rollVal = rollField ? rollField.value.trim() : "";
  if (!rollVal) {
    rollField.setCustomValidity("Roll Number is required.");
  } else if (!/^[1-9][0-9]{0,7}$/.test(rollVal)) {
    rollField.setCustomValidity("Roll Number must be a positive number from 1 to 8 digits (max: 99999999).");
  }

  // Class validation
  const classVal = classField ? classField.value.trim() : "";
  if (!classVal || classVal.length > 30) {
    classField.setCustomValidity("Class must be between 1 and 30 characters.");
  }

  // Section validation
  const sectionVal = sectionField ? sectionField.value.trim() : "";
  if (!sectionVal || sectionVal.length > 20) {
    sectionField.setCustomValidity("Section must be between 1 and 20 characters.");
  }

  // Email validation
  const emailVal = emailField ? emailField.value.trim() : "";
  if (!emailVal || !isValidEmail(emailVal)) {
    emailField.setCustomValidity("Please enter a valid email address (max 80 characters).");
  }

  // Phone validation (exactly 10 digits)
  const phoneVal = phoneField ? phoneField.value.trim() : "";
  if (!phoneVal || !/^\d{10}$/.test(phoneVal)) {
    phoneField.setCustomValidity("Phone number must be exactly 10 digits.");
  }

  // Address validation
  const addrVal = addressField ? addressField.value.trim() : "";
  if (!addrVal || addrVal.length < 3 || addrVal.length > 150) {
    addressField.setCustomValidity("Address must be between 3 and 150 characters.");
  }

  // DOB validation
  const dobVal = dobField ? dobField.value : "";
  if (!dobVal) {
    dobField.setCustomValidity("Date of birth is required.");
  } else {
    const dobDate = new Date(dobVal);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (isNaN(dobDate.getTime()) || dobDate > today || dobDate < new Date("1900-01-01")) {
      dobField.setCustomValidity("Date of birth must be a valid date between 1900 and today.");
    }
  }

  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  return true;
}

function showMessage(text, type = "success") {
  const messageBox = document.getElementById("message");
  if (!messageBox) return;

  if (!text) {
    messageBox.textContent = "";
    messageBox.className = "message-box";
    return;
  }

  messageBox.textContent = text;
  messageBox.className = `message-box ${type}`;

  setTimeout(() => {
    if (messageBox.textContent === text) {
      showMessage("");
    }
  }, 4000);
}

async function fetchStudents() {
  const container = document.getElementById("students");
  const count = document.getElementById("studentCount");

  try {
    const res = await fetch(API);
    const data = await res.json();

    if (!res.ok || !Array.isArray(data)) {
      const errMsg = (data && data.message) ? data.message : "Unable to load students.";
      container.innerHTML = `<div class="student error-state"><p>⚠️ ${escapeHTML(errMsg)}</p></div>`;
      count.textContent = "0 students";
      return;
    }

    container.innerHTML = "";

    if (!data.length) {
      container.innerHTML = `<div class="student empty-state"><p>No students found yet. Add a student to get started.</p></div>`;
      count.textContent = "0 students";
      return;
    }

    data.forEach((student) => {
      container.innerHTML += `
        <div class="student" id="student-${student._id}">
          <p><b>Name:</b> ${escapeHTML(student.name)}</p>
          <p><b>Roll:</b> ${escapeHTML(student.rollNumber)}</p>
          <p><b>Class:</b> ${escapeHTML(student.class)}</p>
          ${student.section ? `<p><b>Section:</b> ${escapeHTML(student.section)}</p>` : ""}
          ${student.email ? `<p><b>Email:</b> ${escapeHTML(student.email)}</p>` : ""}
          ${student.phone ? `<p><b>Phone:</b> ${escapeHTML(student.phone)}</p>` : ""}
          ${student.address ? `<p><b>Address:</b> ${escapeHTML(student.address)}</p>` : ""}
          ${student.dob ? `<p><b>DOB:</b> ${escapeHTML(student.dob)}</p>` : ""}
          <div class="student-actions">
            <button class="edit-btn" onclick="startEdit('${student._id}')">Edit</button>
            <button class="delete-btn" onclick="deleteStudent('${student._id}')">Delete</button>
          </div>
        </div>
      `;
    });

    count.textContent = `${data.length} student${data.length === 1 ? "" : "s"}`;
  } catch (error) {
    console.error("fetchStudents error:", error);
    container.innerHTML = `<div class="student error-state"><p>⚠️ Unable to connect to server. Please ensure the backend is running.</p></div>`;
    count.textContent = "0 students";
  }
}

async function startEdit(id) {
  try {
    const res = await fetch(`${API}/${id}`);
    const student = await res.json();

    if (!res.ok) {
      showMessage(student.message || "Failed to load student details.", "error");
      return;
    }

    getField("name").value = student.name || "";
    getField("rollNumber").value = student.rollNumber !== undefined ? student.rollNumber : "";
    getField("class").value = student.class || "";
    getField("section").value = student.section || "";
    getField("email").value = student.email || "";

    const code = getCountryCode(student.phone || "+91");
    getField("countryCode").value = code;
    getField("phone").value = getLocalPhone(student.phone || "", code);
    getField("address").value = student.address || "";
    getField("dob").value = student.dob || "";

    editStudentId = id;
    document.getElementById("submitBtn").textContent = "Update Student";

    const formHeading = document.getElementById("formHeading");
    if (formHeading) formHeading.textContent = "Edit Student";

    const cancelBtn = document.getElementById("cancelBtn");
    if (cancelBtn) cancelBtn.style.display = "inline-block";

    // Scroll smoothly to form
    const formCard = document.querySelector(".form-card");
    if (formCard) {
      formCard.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  } catch (error) {
    showMessage("Unable to load student data for editing.", "error");
    console.error(error);
  }
}

async function addStudent(event) {
  if (event) {
    event.preventDefault();
  }

  if (!validateForm()) {
    showMessage("Please fix highlighted fields.", "error");
    return;
  }

  try {
    const studentData = getFormData();

    if (!isValidPhone(studentData.phone)) {
      showMessage(
        "Please enter 10 digits. The selected country code will be saved automatically.",
        "error",
      );
      return;
    }

    const isEditing = Boolean(editStudentId);
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API}/${editStudentId}` : API;

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(studentData),
    });

    const result = await res.json();

    if (!res.ok) {
      showMessage(result.message || "Unable to save student.", "error");
      return;
    }

    resetForm();
    await fetchStudents();
    showMessage(
      isEditing ? "Student updated successfully." : "Student added successfully.",
      "success"
    );
  } catch (error) {
    showMessage("Unable to save student. Server may be offline.", "error");
    console.error(error);
  }
}

async function deleteStudent(id) {
  if (!confirm("Are you sure you want to delete this student record?")) {
    return;
  }

  try {
    const res = await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    if (!res.ok) {
      showMessage(result.message || "Unable to delete student.", "error");
      return;
    }

    // If currently editing this student, reset form
    if (editStudentId === id) {
      resetForm();
    }

    await fetchStudents();
    showMessage("Student deleted successfully.", "success");
  } catch (error) {
    showMessage("Unable to delete student. Server may be offline.", "error");
    console.error(error);
  }
}

// Attach event listeners and live input restrictions
const rollField = getField("rollNumber");
if (rollField) {
  rollField.addEventListener("input", function () {
    // Only allow digits, max 8 digits
    this.value = this.value.replace(/\D/g, "").slice(0, 8);
  });
}

const phoneField = getField("phone");
if (phoneField) {
  phoneField.addEventListener("input", function () {
    // Only allow digits, max 10 digits
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });
}

const dobField = getField("dob");
if (dobField) {
  // Prevent future dates dynamically
  dobField.max = new Date().toISOString().split("T")[0];
}

const studentForm = getField("studentForm");
if (studentForm) {
  studentForm.addEventListener("submit", (event) => {
    addStudent(event);
  });
}

fetchStudents();


