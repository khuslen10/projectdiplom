const db = require('../config/db');

class Salary {
  // Цалингийн бүртгэл үүсгэх
  static async create(salaryData) {
    try {
      const { user_id, base_salary, bonus, deductions, effective_date } = salaryData;
      const [result] = await db.query(
        'INSERT INTO salary (user_id, base_salary, bonus, deductions, effective_date) VALUES (?, ?, ?, ?, ?)',
        [user_id, base_salary, bonus || 0, deductions || 0, effective_date]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // ID-гаар цалингийн бүртгэл авах
  static async getById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM salary WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Хэрэглэгчийн ID-гаар цалингийн бүртгэлүүдийг авах
  static async getByUserId(userId) {
    try {
      const [rows] = await db.query(
        `SELECT s.*, u.name, u.email, u.position, u.department
         FROM salary s
         JOIN users u ON s.user_id = u.id
         WHERE s.user_id = ?
         ORDER BY s.effective_date DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Хэрэглэгчийн ID-гаар одоогийн цалингийн бүртгэл авах
  static async getCurrentByUserId(userId) {
    try {
      const [rows] = await db.query(
        `SELECT s.*, u.name, u.email, u.position, u.department
         FROM salary s
         JOIN users u ON s.user_id = u.id
         WHERE s.user_id = ?
         ORDER BY s.effective_date DESC
         LIMIT 1`,
        [userId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Бүх цалингийн бүртгэлүүдийг авах
  static async getAll() {
    try {
      const [rows] = await db.query(
        `SELECT s.*, u.name, u.email, u.position, u.department
         FROM salary s
         JOIN users u ON s.user_id = u.id
         ORDER BY s.effective_date DESC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Цалингийн бүртгэлийг шинэчлэх
  static async update(id, salaryData) {
    try {
      const { base_salary, bonus, deductions, effective_date } = salaryData;
      const [result] = await db.query(
        'UPDATE salary SET base_salary = ?, bonus = ?, deductions = ?, effective_date = ? WHERE id = ?',
        [base_salary, bonus, deductions, effective_date, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Цалингийн бүртгэлийг устгах
  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM salary WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Хэрэглэгчийн ID ба огнооны хугацаагаар цалингийн бүртгэлүүдийг авах
  static async getByUserIdAndDateRange(userId, startDate, endDate) {
    try {
      const [rows] = await db.query(
        `SELECT s.*, u.name, u.email, u.position, u.department
         FROM salary s
         JOIN users u ON s.user_id = u.id
         WHERE s.user_id = ? AND s.effective_date >= ? AND s.effective_date <= ?
         ORDER BY s.effective_date DESC`,
        [userId, startDate, endDate]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Salary;
