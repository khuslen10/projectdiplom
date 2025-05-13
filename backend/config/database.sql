-- Create database
CREATE DATABASE IF NOT EXISTS employee_management;
USE employee_management;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'employee') NOT NULL DEFAULT 'employee',
  position VARCHAR(100),
  department VARCHAR(100),
  phone VARCHAR(20),
  hire_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  check_in DATETIME,
  check_out DATETIME,
  check_in_location VARCHAR(255),
  check_out_location VARCHAR(255),
  status ENUM('present', 'late', 'absent', 'half-day') DEFAULT 'present',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Leave requests table
CREATE TABLE IF NOT EXISTS leave_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type ENUM('annual', 'sick', 'personal', 'maternity', 'paternity', 'other') NOT NULL,
  reason TEXT,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  approved_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Performance reviews table
CREATE TABLE IF NOT EXISTS performance_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  review_period VARCHAR(50) NOT NULL,
  rating INT NOT NULL,
  strengths TEXT,
  areas_to_improve TEXT,
  goals TEXT,
  comments TEXT,
  status ENUM('draft', 'submitted', 'acknowledged') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Salary table
CREATE TABLE IF NOT EXISTS salary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  base_salary DECIMAL(10, 2) NOT NULL,
  bonus DECIMAL(10, 2) DEFAULT 0,
  deductions DECIMAL(10, 2) DEFAULT 0,
  effective_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Changelog table
CREATE TABLE IF NOT EXISTS changelog (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type ENUM('feature', 'update', 'fix') NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert admin user (password: admin123)
INSERT INTO users (name, email, password, role)
VALUES ('Админ', 'admin@example.com', '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', 'admin');

-- Insert sample manager user (password: manager123)
INSERT INTO users (name, email, password, role, position, department)
VALUES ('Менежер', 'manager@example.com', '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', 'manager', 'Хүний нөөцийн менежер', 'Хүний нөөц');

-- Insert sample employee user (password: employee123)
INSERT INTO users (name, email, password, role, position, department)
VALUES ('Ажилтан', 'employee@example.com', '$2a$10$mLK.rrdlvx9DCFb6Eck1t.TlltnGulepXnov3bBp5T2TloO1MYj52', 'employee', 'Хөгжүүлэгч', 'IT');

-- Insert sample changelog entries
INSERT INTO changelog (title, description, type, created_by)
VALUES 
('Систем үүсгэсэн', 'Ажилтны удирдлагын системийг үүсгэж эхлүүлсэн', 'feature', 1),
('Нэвтрэх систем', 'Нэвтрэх болон бүртгүүлэх хуудсуудыг нэмсэн', 'feature', 1),
('Ирц бүртгэл', 'Байршил дээр суурилсан ирц бүртгэлийн системийг нэмсэн', 'feature', 1);
