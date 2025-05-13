const db = require('../config/db');

class LeaveRequest {
  // Чөлөөний хүсэлт үүсгэх
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

  // ID-гаар чөлөөний хүсэлт авах
  static async getById(id) {
    try {
      const [rows] = await db.query(
        `SELECT lr.*, u.name as user_name, u.email as user_email, 
         a.name as approver_name, a.email as approver_email
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

  // Хэрэглэгчийн ID-гаар чөлөөний хүсэлтүүдийг авах
  static async getByUserId(userId) {
    try {
      const [rows] = await db.query(
        `SELECT lr.*, u.name as approver_name
         FROM leave_requests lr
         LEFT JOIN users u ON lr.approved_by = u.id
         WHERE lr.user_id = ?
         ORDER BY lr.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Хүлээгдэж буй чөлөөний хүсэлтүүдийг авах
  static async getPending() {
    try {
      const [rows] = await db.query(
        `SELECT lr.*, u.name as user_name, u.email as user_email, u.department
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

  // Бүх чөлөөний хүсэлтүүдийг авах
  static async getAll() {
    try {
      const [rows] = await db.query(
        `SELECT lr.*, u.name as user_name, u.email as user_email, u.department,
         a.name as approver_name
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

  // Чөлөөний хүсэлтийн төлвийг шинэчлэх
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

  // Чөлөөний хүсэлтийг устгах
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
}

module.exports = LeaveRequest;
