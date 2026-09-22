# Student Management System

A full-stack web application to add, view, update, and delete student records with a clean, responsive interface.

## Tech Stack
- **Frontend**: HTML5, CSS3, Modern JavaScript (Fetch API)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM

---

## Features
- **Student Registration**: Add new students with validation (name, roll number, class, section, email, phone with country code, address, DOB).
- **View Records**: Real-time list of all students sorted with the latest records first.
- **Edit & Update**: Inline edit mode with cancel support.
- **Delete Confirmation**: Safe deletion with confirmation modal.
- **Error Handling**: Friendly alerts for duplicate roll numbers, validation errors, and network issues.
- **Unified Server**: The Express backend serves both the REST API and the frontend UI directly.

---

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) installed locally OR a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

### 2. Configure Database (.env)
Edit the `.env` file in the root folder:

```env
PORT=5000

# For Local MongoDB (Default):
MONGO_URI=mongodb://127.0.0.1:27017/studentDB

# For MongoDB Atlas (Cloud):
# MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/studentDB?retryWrites=true&w=majority
```

### 3. Run the Project
Start the server:
```bash
npm start
```
Or for auto-reload during development:
```bash
npm run dev
```

### 4. Open in Browser
Visit [http://localhost:5000](http://localhost:5000) in any web browser.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check API and database connection status |
| `GET` | `/students` | Get all student records |
| `GET` | `/students/:id` | Get single student details |
| `POST` | `/students` | Add a new student |
| `PUT` | `/students/:id` | Update an existing student |
| `DELETE` | `/students/:id` | Delete a student record |

