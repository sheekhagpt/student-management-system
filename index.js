const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");   // 👈 ये add करना है
const connectDB = require("./config/db");

dotenv.config();

const app = express();

app.use(cors());   // 👈 ये add करना है (IMPORTANT)
app.use(express.json());

app.use("/students", require("./routes/studentRoutes"));

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();