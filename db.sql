-- Database: jobboard

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS applications;
DROP TABLE IF EXISTS jobs;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('job_seeker', 'employer', 'admin')) NOT NULL DEFAULT 'job_seeker',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create jobs table
CREATE TABLE jobs (
  id SERIAL PRIMARY KEY,
  employer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  company VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  salary NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  category VARCHAR(50)
);

-- Create applications table
CREATE TABLE applications (
  id SERIAL PRIMARY KEY,
  job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_jobs_employer ON jobs(employer_id);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_user ON applications(user_id);

-- Sample data for testing
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'john@example.com', '$2a$10$E3DgchtVry3qlYlzQ0T3fO1VlDdHd0T7JWvJh7YH8tCw9WX1Yf6dK', 'job_seeker'), -- password: jobseeker123
('Tech Company', 'tech@example.com', '$2a$10$Kz8vcmz7W2J1QY7Xb8dZ8uLdD9fV1E2rT3oG4h5i6j7k8l9m0n1o2p', 'employer'), -- password: employer123
('Admin User', 'admin@example.com', '$2a$10$Lx3r4q5s6t7u8v9w0x1y2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q', 'admin'); -- password: admin123

-- Sample jobs
INSERT INTO jobs (employer_id, title, description, company, location, salary, category) VALUES
(2, 'Frontend Developer', 'We are looking for a skilled Frontend Developer with Vue.js experience', 'Tech Solutions Inc.', 'Remote', 90000, 'IT'),
(2, 'Backend Engineer', 'Looking for backend developer with Node.js and PostgreSQL skills', 'Tech Solutions Inc.', 'New York', 110000, 'IT'),
(2, 'UX Designer', 'Design beautiful interfaces for our enterprise applications', 'Tech Solutions Inc.', 'San Francisco', 85000, 'Design');

-- Sample applications
INSERT INTO applications (job_id, user_id) VALUES
(1, 1),
(2, 1);

-- Create a view for job applications
CREATE VIEW job_applications_view AS
SELECT 
  a.id AS application_id,
  a.applied_at,
  u.id AS applicant_id,
  u.name AS applicant_name,
  u.email AS applicant_email,
  j.id AS job_id,
  j.title AS job_title,
  j.company
FROM applications a
JOIN users u ON a.user_id = u.id
JOIN jobs j ON a.job_id = j.id;

-- Create function to count job applications
CREATE FUNCTION count_job_applications(job_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
  application_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO application_count 
  FROM applications 
  WHERE job_id = $1;
  
  RETURN application_count;
END;
$$ LANGUAGE plpgsql;

-- Create admin user with privileges
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'jobboard_admin') THEN
    CREATE USER jobboard_admin WITH PASSWORD 'strongpassword';
  END IF;
END $$;

GRANT CONNECT ON DATABASE jobboard TO jobboard_admin;
GRANT USAGE ON SCHEMA public TO jobboard_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO jobboard_admin;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO jobboard_admin;