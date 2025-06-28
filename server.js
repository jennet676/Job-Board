require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyparser = require("body-parser");



// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyparser.urlencoded({ extended: true }));

 // Routes
const authRoutes = require("./routes/authRoutes");
const jobRoutes = require("./routes/jobRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/admin", adminRoutes); 

// Test route
// app.get("/", (req, res) => {
//   res.send("Job Board API is running");
// });

// Error handling
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ error: "Internal server error" });
// });

const PORT = process.env.PORT || 5000;
// const PORT =  5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
