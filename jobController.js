const Job = require("../models/Job");



exports.createJob = async (req, res) => {
  try {
    const { title, description, company, location, salary, category } =
      req.body;

    const job = await Job.create({
      employer_id: req.user.id,
      title,
      description,
      company,
      location,
      salary,
      category,
    });

    res.status(201).json(job);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// exports.getJobs = async (req, res) => {
//   try {
//     const { page = 1, limit = 10, title, location } = req.query;
//     const filter = {};

//     // ✳️ Filter: umumy gözleg üçin
//     if (title) {
//       filter.title = { $regex: title, $options: "i" };
//     }

//     if (location) {
//       filter.location = { $regex: location, $options: "i" };
//     }

//     // ✳️ Employer üçin öz post eden işleri
//     if (req.path === "/postedjobs" && req.user.role === "employer") {
//       filter.postedBy = req.user.id; // şu ýerde diňe öz işleri
//     }

//     // ✳️ Pagination
//     const skip = (page - 1) * limit;

//     const jobs = await Job.find(filter)
//       .sort({ createdAt: -1 }) // iň täze işler öňde
//       .skip(skip)
//       .limit(parseInt(limit));

//     const total = await Job.countDocuments(filter);

//     res.json({
//       total,
//       page: parseInt(page),
//       pages: Math.ceil(total / limit),
//       jobs,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

exports.getJobs = async (req, res) => {
  try {
    const { location, title, category, page = 1,employer_id, limit = 10 } = req.query;

    const jobs = await Job.findAll({
      location,
      title,
      category,
      page: parseInt(page),
      limit: parseInt(limit),
    });

    const totalJobs = await Job.getTotalJobs({ location, title, category });
    const totalPages = Math.ceil(totalJobs / limit);

    res.json({
      jobs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalJobs,
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const isOwner = await Job.isOwner(jobId, req.user.id);

    if (!isOwner) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this job" });
    }

    const updatedJob = await Job.update(jobId, req.body);
    res.json(updatedJob);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const isOwner = await Job.isOwner(jobId, req.user.id);

    if (!isOwner) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this job" });
    }

    await Job.delete(jobId);
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.applyForJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const userId = req.user.id;

    const result = await Job.apply(jobId, userId);
    res.json(result);
  } catch (err) {
    console.error(err);

    if (err.code === "23505") {
      return res
        .status(400)
        .json({ error: "You have already applied for this job" });
    }

    res.status(500).json({ error: "Server error" });
  }
};

exports.getUsersApplyedJob = async (req, res) => {
  try {
    const jobId = req.params.id;

    const usersApply = await Job.getUsersApply(jobId);
    res.json(usersApply);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

