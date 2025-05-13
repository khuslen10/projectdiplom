const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Performance = require('../models/Performance');
const Salary = require('../models/Salary');
const db = require('../config/db');

// Хэлтсийн хуваарилалтын статистикийг авах
exports.getDepartmentStats = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT department, COUNT(*) as count 
      FROM users 
      GROUP BY department
      ORDER BY count DESC
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Хэлтсийн статистик авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Тодорхой сар ба жилийн ирцийн статистикийг авах
exports.getAttendanceStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    
    // Оролтыг шалгах
    if (!month || !year) {
      return res.status(400).json({ message: 'Сар болон жил заавал шаардлагатай' });
    }
    
    // Тоон утга руу хөрвүүлэх
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    // Сарын эхлэх ба дуусах огноог авах
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0);
    
    // SQL хүсэлтэд зориулж огноог форматлах
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Сарын бүх ирцийн бүртгэлийг авах
    const [records] = await db.query(`
      SELECT status, COUNT(*) as count 
      FROM attendance 
      WHERE DATE(check_in) >= ? AND DATE(check_in) <= ?
      GROUP BY status
    `, [startDateStr, endDateStr]);
    
    // Бүртгэлийн нийт тоог авах
    const [totalResult] = await db.query(`
      SELECT COUNT(*) as total 
      FROM attendance 
      WHERE DATE(check_in) >= ? AND DATE(check_in) <= ?
    `, [startDateStr, endDateStr]);
    
    const total = totalResult[0].total;
    
    // Хувь хэмжээг тооцоолох
    const stats = [
      { 
        name: 'Ирсэн', 
        value: Math.round((records.find(r => r.status === 'present')?.count || 0) / total * 100) || 0 
      },
      { 
        name: 'Хоцорсон', 
        value: Math.round((records.find(r => r.status === 'late')?.count || 0) / total * 100) || 0 
      },
      { 
        name: 'Ирээгүй', 
        value: Math.round((records.find(r => r.status === 'absent')?.count || 0) / total * 100) || 0 
      },
      { 
        name: 'Хагас өдөр', 
        value: Math.round((records.find(r => r.status === 'half-day')?.count || 0) / total * 100) || 0 
      }
    ];
    
    res.json(stats);
  } catch (error) {
    console.error('Ирцийн статистик авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Хэлтсээр гүйцэтгэлийн статистикийг авах
exports.getPerformanceStats = async (req, res) => {
  try {
    const { year } = req.query;
    
    // Оролтыг шалгах
    if (!year) {
      return res.status(400).json({ message: 'Жил заавал шаардлагатай' });
    }
    
    // Convert to number
    const yearNum = parseInt(year);
    
    // Хэлтсээр дундаж үнэлгээг авах
    const [rows] = await db.query(`
      SELECT u.department, AVG(p.rating) as rating
      FROM performance_reviews p
      JOIN users u ON p.user_id = u.id
      WHERE p.review_period LIKE ?
      GROUP BY u.department
      ORDER BY u.department
    `, [`%${yearNum}%`]);
    
    res.json(rows);
  } catch (error) {
    console.error('Гүйцэтгэлийн статистик авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Хэлтсээр цалингийн статистикийг авах
exports.getSalaryStats = async (req, res) => {
  try {
    const { year } = req.query;
    
    // Оролтыг шалгах
    if (!year) {
      return res.status(400).json({ message: 'Жил заавал шаардлагатай' });
    }
    
    // Convert to number
    const yearNum = parseInt(year);
    
    // Хэлтсээр дундаж цалингийг авах
    const [rows] = await db.query(`
      SELECT u.department, AVG(s.base_salary + s.bonus - s.deductions) as averageSalary
      FROM salary s
      JOIN users u ON s.user_id = u.id
      WHERE YEAR(s.effective_date) = ?
      GROUP BY u.department
      ORDER BY u.department
    `, [yearNum]);
    
    res.json(rows);
  } catch (error) {
    console.error('Цалингийн статистик авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};

// Системийн ерөнхий статистикийг авах
exports.getOverallStats = async (req, res) => {
  try {
    // Нийт ажилтнуудын тоог авах
    const [employeeCount] = await db.query('SELECT COUNT(*) as count FROM users');
    
    // Хэлтсийн тоог авах
    const [departmentCount] = await db.query('SELECT COUNT(DISTINCT department) as count FROM users');
    
    // Дундаж цалингийг авах
    const [avgSalary] = await db.query(`
      SELECT AVG(base_salary + bonus - deductions) as average 
      FROM salary
    `);
    
    // Дундаж гүйцэтгэлийн үнэлгээг авах
    const [avgRating] = await db.query('SELECT AVG(rating) as average FROM performance_reviews');
    
    res.json({
      totalEmployees: employeeCount[0].count,
      totalDepartments: departmentCount[0].count,
      averageSalary: avgSalary[0].average || 0,
      averageRating: avgRating[0].average || 0
    });
  } catch (error) {
    console.error('Ерөнхий статистик авахад алдаа гарлаа:', error);
    res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
  }
};
