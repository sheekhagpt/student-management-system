const API = "http://localhost:5000/students";
let editStudentId = null;

function getField(id) {
  return document.getElementById(id);
}

function normalizePhone(value, code) {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 ? `${code}${digits}` : value;
}

function getCountryCode(phone) {
  const codes = [
    "+91",
    "+1",
    "+44",
    "+61",
    "+81",
    "+55",
    "+49",
    "+33",
    "+971",
    "+966",
    "+86",
    "+7",
  ];
  return codes.find((code) => phone.startsWith(code)) || "+91";
}

function getLocalPhone(phone, code) {
  return phone.startsWith(code)
    ? phone.slice(code.length)
    : phone.replace(/\D/g, "");
}

function getFormData() {
  const countryCode = getField("countryCode").value;

  return {
    name: getField("name").value.trim(),
    rollNumber: getField("rollNumber").value,
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
    getField(id).value = "";
  });

  getField("countryCode").value = "+91";
  editStudentId = null;
  document.getElementById("submitBtn").textContent = "Add Student";
  showMessage("");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
  return /^\+91\d{10}$/.test(phone);
}

function validateForm() {
  const form = getField("studentForm");
  const rollField = getField("rollNumber");
  const emailField = getField("email");
  const phoneField = getField("phone");

  [rollField, emailField, phoneField].forEach((field) => {
    if (field) field.setCustomValidity("");
  });

  if (
    rollField &&
    rollField.value.trim() &&
    !/^\d+$/.test(rollField.value.trim())
  ) {
    rollField.setCustomValidity("Roll Number should contain digits only.");
  }

  if (
    emailField &&
    emailField.value.trim() &&
    !isValidEmail(emailField.value.trim())
  ) {
    emailField.setCustomValidity("Please enter a valid email address.");
  }

  if (
    phoneField &&
    phoneField.value.trim() &&
    !/^\d{10}$/.test(phoneField.value.trim())
  ) {
    phoneField.setCustomValidity("Phone number must be exactly 10 digits.");
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
    showMessage("");
  }, 3000);
}

async function fetchStudents() {
  try {
    const res = await fetch(API);
    const data = await res.json();

    const container = document.getElementById("students");
    const count = document.getElementById("studentCount");
    container.innerHTML = "";

    if (!data.length) {
      container.innerHTML = `<div class="student"><p>No students found yet. Add a student to get started.</p></div>`;
    } else {
      data.forEach((student) => {
        container.innerHTML += `
          <div class="student">
            <p><b>Name:</b> ${student.name}</p>
            <p><b>Roll:</b> ${student.rollNumber}</p>
            <p><b>Class:</b> ${student.class}</p>
            ${student.section ? `<p><b>Section:</b> ${student.section}</p>` : ""}
            ${student.email ? `<p><b>Email:</b> ${student.email}</p>` : ""}
            ${student.phone ? `<p><b>Phone:</b> ${student.phone}</p>` : ""}
            ${student.address ? `<p><b>Address:</b> ${student.address}</p>` : ""}
            ${student.dob ? `<p><b>DOB:</b> ${student.dob}</p>` : ""}
            <div class="student-actions">
              <button class="edit-btn" onclick="startEdit('${student._id}')">Edit</button>
              <button class="delete-btn" onclick="deleteStudent('${student._id}')">Delete</button>
            </div>
          </div>
        `;
      });
    }

    count.textContent = `${data.length} student${data.length === 1 ? "" : "s"}`;
  } catch (error) {
    alert("Unable to load students. Please try again.");
    console.error(error);
  }
}

async function startEdit(id) {
  try {
    const res = await fetch(`${API}/${id}`);
    const student = await res.json();

    getField("name").value = student.name || "";
    getField("rollNumber").value = student.rollNumber || "";
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
  } catch (error) {
    alert("Unable to load student data for editing.");
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
        "Please enter 10 digits. The selected country code will be saved too.",
        "error",
      );
      return;
    }

    const method = editStudentId ? "PUT" : "POST";
    const url = editStudentId ? `${API}/${editStudentId}` : API;

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: studentData.name,
        rollNumber: studentData.rollNumber,
        class: studentData.class,
        section: studentData.section,
        email: studentData.email,
        phone: studentData.phone,
        address: studentData.address,
        dob: studentData.dob,
      }),
    });

    resetForm();
    await fetchStudents();
    showMessage(
      editStudentId ? "Data updated successfully." : "Data saved successfully.",
    );
  } catch (error) {
    showMessage("Unable to save student. Please try again.", "error");
    console.error(error);
  }
}

async function deleteStudent(id) {
  try {
    await fetch(`${API}/${id}`, {
      method: "DELETE",
    });

    fetchStudents();
    showMessage("Student deleted successfully.");
  } catch (error) {
    showMessage("Unable to delete student. Please try again.", "error");
    console.error(error);
  }
}

// AUTO LOAD
fetchStudents();

const studentForm = getField("studentForm");
if (studentForm) {
  studentForm.addEventListener("submit", (event) => {
    addStudent(event);
  });
}
