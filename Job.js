const { Pool } = require("pg");
const pool = new Pool(require("../config/db"));

module.exports = {
  async create({
    employer_id,
    title,
    description,
    company,
    location,
    salary,
    category,
  }) {
    const result = await pool.query(
      `INSERT INTO jobs 
       (employer_id, title, description, company, location, salary, category) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [employer_id, title, description, company, location, salary, category]
    );
    return result.rows[0];
  },
  async getUsersApply(jobId) {
    const result = await pool.query(
      "SELECT  users.name,users.email FROM applications INNER JOIN users ON applications.user_id = users.id where applications.job_id = $1;",
      [jobId]
    );
    return result.rows;
  },

  async getUsersApply(jobId) {
    const result = await pool.query(
      "SELECT  users.name,users.email FROM applications INNER JOIN users ON applications.user_id = users.id where applications.job_id = $1;",
      [jobId]
    );
    return result.rows;
  },

  async findAll({ location, title, category, page = 1, limit = 10 }) {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM jobs";
    const values = [];
    const conditions = [];

    if (location) {
      conditions.push(`location ILIKE $${values.length + 1}`);
      values.push(`%${location}%`);
    }

    if (title) {
      conditions.push(`title ILIKE $${values.length + 1}`);
      values.push(`%${title}%`);
    }

    if (category) {
      conditions.push(`category = $${values.length + 1}`);
      values.push(category);
    }

    if (conditions.length) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${
      values.length + 2
    }`;
    values.push(limit, offset);

    const result = await pool.query(query, values);
    return result.rows;
  },

  // async getByEmployer_Id(id, userId) {
  //   const result = await pool.query(
  //     "SELECT * FROM jobs WHERE id = $1 AND employer_id = $2",
  //     [id, employer_id]
  //   );
  //   return result.rows;
  // },

  async update(id, updates) {
    const { title, description, company, location, salary, category } = updates;
    const result = await pool.query(
      `UPDATE jobs 
       SET title = $1, description = $2, company = $3, 
           location = $4, salary = $5, category = $6 
       WHERE id = $7 
       RETURNING *`,
      [title, description, company, location, salary, category, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    await pool.query("DELETE FROM jobs WHERE id = $1", [id]);
  },

  async apply(jobId, userId) {
    const checkJob = await pool.query("select * from jobs where id = $1", [
      jobId,
    ]);
    if (checkJob.rows.length === 0) {
      return { error: "Job not found" };
    }

    const result = await pool.query(
      `INSERT INTO applications (job_id, user_id) 
       VALUES ($1, $2) 
       RETURNING *`,
      [jobId, userId]
    );
    return result.rows[0];
  },

  async isOwner(jobId, userId) {
    const result = await pool.query(
      "SELECT 1 FROM jobs WHERE id = $1 AND employer_id = $2",
      [jobId, userId]
    );
    return result.rowCount > 0;
  },

  async getTotalJobs(filters = {}) {
    let query = "SELECT COUNT(*) FROM jobs";
    const values = [];
    const conditions = [];

    Object.entries(filters).forEach(([key, value]) => {
      if (value && ["location", "title"].includes(key)) {
        conditions.push(`${key} ILIKE $${values.length + 1}`);
        values.push(`%${value}%`);
      } else if (value && key === "category") {
        conditions.push(`${key} = $${values.length + 1}`);
        values.push(value);
      }
    });

    if (conditions.length) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count);
  },
};
