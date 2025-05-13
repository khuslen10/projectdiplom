const db = require('../config/db');

class Leave {
  static async create(leaveData) {
    try {
      const { user_id, start_date, end_date, type, reason } = leaveData;
      const [result] = await db.query(
        'INSERT INTO leave_requests (user_id, start_date, end_date, type, reason) VALUES (?, ?, ?, ?, ?)',
        [user_id, start_date, end_date, type, reason]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const [rows] = await db.query(
        `SELECT lr.*, u.name, u.email, u.position, u.department, a.name as approver_name
         FROM leave_requests lr
         JOIN users u ON lr.user_id = u.id
         LEFT JOIN users a ON lr.approved_by = a.id
         WHERE lr.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getByUserId(userId) {
    try {
      const [rows] = await db.query(
        `SELECT lr.*, u.name, u.email, u.position, u.department, a.name as approver_name
         FROM leave_requests lr
         JOIN users u ON lr.user_id = u.id
         LEFT JOIN users a ON lr.approved_by = a.id
         WHERE lr.user_id = ?
         ORDER BY lr.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getPending() {
    try {
      const [rows] = await db.query(
        `SELECT lr.*, u.name, u.email, u.position, u.department
         FROM leave_requests lr
         JOIN users u ON lr.user_id = u.id
         WHERE lr.status = 'pending'
         ORDER BY lr.created_at ASC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getAll() {
    try {
      const [rows] = await db.query(
        `SELECT lr.*, u.name, u.email, u.position, u.department, a.name as approver_name
         FROM leave_requests lr
         JOIN users u ON lr.user_id = u.id
         LEFT JOIN users a ON lr.approved_by = a.id
         ORDER BY lr.created_at DESC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status, approvedBy) {
    try {
      const [result] = await db.query(
        'UPDATE leave_requests SET status = ?, approved_by = ? WHERE id = ?',
        [status, approvedBy, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id, userId) {
    try {
      const [result] = await db.query(
        'DELETE FROM leave_requests WHERE id = ? AND user_id = ? AND status = "pending"',
        [id, userId]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getByUserIdAndDateRange(userId, startDate, endDate) {
    try {
      const [rows] = await db.query(
        `SELECT lr.*, u.name, u.email, u.position, u.department, a.name as approver_name
         FROM leave_requests lr
         JOIN users u ON lr.user_id = u.id
         LEFT JOIN users a ON lr.approved_by = a.id
         WHERE lr.user_id = ? AND 
         ((lr.start_date BETWEEN ? AND ?) OR 
          (lr.end_date BETWEEN ? AND ?) OR
          (lr.start_date <= ? AND lr.end_date >= ?))
         ORDER BY lr.start_date DESC`,
        [userId, startDate, endDate, startDate, endDate, startDate, endDate]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Leave;
