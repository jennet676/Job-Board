const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const adminController = require("../controllers/adminController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

router.use(auth);
router.use(role(["admin"]));

router.get("/jobs", jobController.getJobs);
router.delete("/jobs/:id", adminController.deleteJob);
//nrouter.delete("/users/:id", adminController.deleteUser);

module.exports = router;
