const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
router.use(auth);

router.get("/", jobController.getJobs);


router.get("/", role(["job_seeker"]), jobController.getJobs);
//router.get("/:id", role(["employer"]), jobController.getownJobs);
router.post("/", role(["employer"]), jobController.createJob);
router.put("/:id", role(["employer"]), jobController.updateJob);
router.get("/postedjobs", role(["employer"]), jobController.getJobs);
router.delete("/:id", role(["employer"]), jobController.deleteJob);
router.post("/:id/apply", role(["job_seeker"]), jobController.applyForJob);
router.get("/:id/apply", role(["employer"]), jobController.getUsersApplyedJob);


module.exports = router;

// // //   (req, res) => {
// // //     // console.log("user", req.user);
// // //     res.send("hello");
// // //   }
// // //   // jobController.getJob
// // // );
