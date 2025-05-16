const db = require('../config/db');

class Attendance {
  // Ирц бүртгэх with remote check-in support
  static async checkIn(userId, location, isRemote = false) {
    try {
      // If remote, set approval_status to pending, otherwise it's automatically approved
      const approvalStatus = isRemote ? 'pending' : 'approved';
      
      const [result] = await db.query(
        'INSERT INTO attendance (user_id, check_in, check_in_location, is_remote, approval_status) VALUES (?, NOW(), ?, ?, ?)',
        [userId, location, isRemote, approvalStatus]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Явсан цагийг бүртгэх with remote check-out support
  static async checkOut(id, userId, location, isRemote = false) {
    try {
      // For remote check-out, we don't change the approval status
      // Only update is_remote if it's a remote check-out
      if (isRemote) {
        const [result] = await db.query(
          'UPDATE attendance SET check_out = NOW(), check_out_location = ?, is_remote = ? WHERE id = ? AND user_id = ? AND check_out IS NULL',
          [location, true, id, userId]
        );
        return result.affectedRows > 0;
      } else {
        const [result] = await db.query(
          'UPDATE attendance SET check_out = NOW(), check_out_location = ? WHERE id = ? AND user_id = ? AND check_out IS NULL',
          [location, id, userId]
        );
        return result.affectedRows > 0;
      }
    } catch (error) {
      throw error;
    }
  }

  // Get all pending approval attendance records
  static async getPendingApprovals() {
    try {
      const [rows] = await db.query(`
        SELECT a.*, u.name, u.email, u.department 
        FROM attendance a
        JOIN users u ON a.user_id = u.id
        WHERE a.approval_status = 'pending'
        ORDER BY a.check_in DESC
      `);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Approve or reject an attendance record
  static async updateApprovalStatus(id, status, managerId) {
    try {
      const [result] = await db.query(
        'UPDATE attendance SET approval_status = ?, approved_by = ?, approval_time = NOW() WHERE id = ?',
        [status, managerId, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Хэрэглэгчийн хамгийн сүүлийн ирцийг авах
  static async getLatestByUserId(userId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM attendance WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Хэрэглэгчийн өнөөдрийн ирцийг авах
  static async getTodayByUserId(userId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM attendance WHERE user_id = ? AND DATE(check_in) = CURDATE()',
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getByUserId(userId, startDate, endDate) {
    try {
      let query = 'SELECT * FROM attendance WHERE user_id = ?';
      const params = [userId];

      if (startDate) {
        query += ' AND DATE(check_in) >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += ' AND DATE(check_in) <= ?';
        params.push(endDate);
      }

      query += ' ORDER BY check_in DESC';

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async getAll(startDate, endDate) {
    try {
      let query = `
        SELECT a.*, u.name, u.email, u.department 
        FROM attendance a
        JOIN users u ON a.user_id = u.id
      `;
      const params = [];

      if (startDate) {
        query += ' WHERE DATE(a.check_in) >= ?';
        params.push(startDate);
      }

      if (endDate) {
        query += startDate ? ' AND DATE(a.check_in) <= ?' : ' WHERE DATE(a.check_in) <= ?';
        params.push(endDate);
      }

      query += ' ORDER BY a.check_in DESC';

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status, notes) {
    try {
      const [result] = await db.query(
        'UPDATE attendance SET status = ?, notes = ? WHERE id = ?',
        [status, notes, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM attendance WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getByUserIdAndDateRange(userId, startDate, endDate) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM attendance WHERE user_id = ? AND DATE(check_in) >= ? AND DATE(check_in) <= ? ORDER BY check_in',
        [userId, startDate, endDate]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Attendance;
