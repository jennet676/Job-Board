const Job = require("../models/Job");

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.getJobs({});
    res.json(jobs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    await Job.delete(req.params.id);
    res.json({ message: "Job deleted by admin" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
